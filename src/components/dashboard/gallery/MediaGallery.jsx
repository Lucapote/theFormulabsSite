import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  Film,
  ArrowLeft,
  RotateCcw,
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import {
  getArchivosByCalendario,
  getPostsByCalendario,
  deleteArchivo,
  createPost,
  updatePost
} from "@/services/calendarService";
import { useUpload } from "@/context/UploadContext";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import PostModal from "@/components/dashboard/calendar/PostModal";
import GalleryItemCard from "./GalleryItemCard";
import MediaGalleryUploader from "./MediaGalleryUploader";
import MediaGalleryFilterBar from "./MediaGalleryFilterBar";
import FloatingBatchToolbar from "@/components/dashboard/calendar/FloatingBatchToolbar";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { getLocalDateString } from "@/utils/formatters";

/**
 * MediaGallery
 * Orchestrator component for viewing, uploading, filtering, and deleting media files.
 */
export default function MediaGallery({
  calendarioId,
  calendarioNombre = "Calendario",
  onBack,
  refreshTrigger = 0
}) {
  const [archivos, setArchivos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'disponible' | 'en_uso'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'image' | 'video'

  // Global Upload Context
  const { startUpload, addUploadListener, uploadState } = useUpload();

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Computed upload state for this calendar
  const isUploading = uploadState.isUploading && uploadState.calendarId === calendarioId;
  const uploadProgress = {
    current: uploadState.current,
    total: uploadState.total,
    phase: uploadState.phase,
    compressPercent: uploadState.compressPercent,
    uploadPercent: uploadState.uploadPercent,
    currentFileName: uploadState.currentFileName
  };

  // Lightbox / Delete / Edit Post Modal
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Multi-selection state
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const selectedFileIdsRef = useRef(selectedFileIds);

  useEffect(() => {
    selectedFileIdsRef.current = selectedFileIds;
  }, [selectedFileIds]);

  const isSelectMode = selectedFileIds.length > 0;

  const handleCardLongPress = (item) => {
    setSelectedFileIds((prev) => {
      if (prev.includes(item.id)) return prev;
      return [...prev, item.id];
    });
  };

  const handleCardClick = (item) => {
    if (selectedFileIdsRef.current.length > 0) {
      setSelectedFileIds((prev) => {
        if (prev.includes(item.id)) {
          return prev.filter((id) => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
    } else {
      setPreviewMedia(item);
    }
  };

  // Close selection mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedFileIds.length > 0) {
        setSelectedFileIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFileIds.length]);

  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredArchivos.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredArchivos.map((a) => a.id));
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedFileIds.length === 0) return;
    setIsDeleting(true);

    const filesToDelete = archivos.filter((a) => selectedFileIds.includes(a.id));
    let successCount = 0;
    let failCount = 0;

    for (const file of filesToDelete) {
      const res = await deleteArchivo(file.id, file.url, file.thumbnail_url);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} archivo(s) eliminado(s) correctamente.`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} archivo(s) no se pudieron eliminar.`);
    }

    setSelectedFileIds([]);
    setShowBatchDeleteConfirm(false);
    setIsDeleting(false);
    fetchGallery();
  };

  const handleSavePostFromGallery = async (formData) => {
    setIsSavingPost(true);
    let res;
    if (formData.id) {
      res = await updatePost(formData.id, formData, editingPost?.archivos || []);
    } else {
      res = await createPost({
        ...formData,
        calendario_id: calendarioId
      });
    }

    if (res.success) {
      toast.success(
        formData.id
          ? "Publicación actualizada correctamente."
          : "Publicación creada correctamente."
      );
      setEditingPost(null);
      fetchGallery();
    } else {
      toast.error(res.error || "No se pudo guardar la publicación.");
    }
    setIsSavingPost(false);
  };

  const handleAssignPost = (mediaFile, targetType) => {
    setPreviewMedia(null);
    setEditingPost({
      tipo_post: targetType,
      archivos: [mediaFile],
      caption: "",
      estado: "programado",
      fecha_programada: getLocalDateString(),
      hora_programada: "18:00"
    });
  };

  const handleAddToExistingPost = (mediaFile, targetPost) => {
    setPreviewMedia(null);
    const currentFiles = Array.isArray(targetPost.archivos) ? targetPost.archivos : [];
    if (currentFiles.some((a) => a.id === mediaFile.id || a.url === mediaFile.url)) {
      toast.info("El archivo ya está asignado a esta publicación.");
      setEditingPost(targetPost);
      return;
    }

    const maxAllowed = targetPost.tipo_post === "reel" ? 1 : 20;
    if (currentFiles.length >= maxAllowed) {
      toast.error(
        `Esta publicación (${targetPost.tipo_post}) ya alcanzó el límite máximo de ${maxAllowed} archivo(s).`
      );
      return;
    }

    setEditingPost({
      ...targetPost,
      archivos: [...currentFiles, mediaFile]
    });
  };

  // Load gallery files & posts
  const fetchGallery = async () => {
    if (!calendarioId) return;
    setLoading(true);
    const [resArchivos, resPosts] = await Promise.all([
      getArchivosByCalendario(calendarioId),
      getPostsByCalendario(calendarioId)
    ]);

    if (resArchivos.success) {
      setArchivos(resArchivos.data || []);
    } else {
      toast.error(resArchivos.error || "No se pudieron cargar los archivos de la galería.");
    }

    if (resPosts.success) {
      setPosts(resPosts.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, [calendarioId, refreshTrigger]);

  // Real-time listener for background uploads
  useEffect(() => {
    const removeListener = addUploadListener((updatedCalId) => {
      if (updatedCalId === calendarioId) {
        fetchGallery();
      }
    });
    return () => removeListener();
  }, [calendarioId]);

  // Trigger batch file upload with persistent background processing
  const handleUploadFiles = (filesList) => {
    startUpload(calendarioId, calendarioNombre, filesList, fetchGallery);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingMedia) return;
    setIsDeleting(true);
    const res = await deleteArchivo(deletingMedia.id, deletingMedia.url, deletingMedia.thumbnail_url);
    if (res.success) {
      toast.success(`Archivo "${deletingMedia.nombre_archivo}" eliminado de la galería.`);
      setDeletingMedia(null);
      if (previewMedia?.id === deletingMedia.id) {
        setPreviewMedia(null);
      }
      fetchGallery();
    } else {
      toast.error(res.error || "No se pudo eliminar el archivo.");
    }
    setIsDeleting(false);
  };

  // Dynamic check if a media item is referenced in any post or marked in DB
  const isMediaInUse = (item) => {
    if (!item) return false;
    if (item.en_uso) return true;
    if (!posts || !Array.isArray(posts)) return false;
    return posts.some(
      (p) =>
        Array.isArray(p.archivos) &&
        p.archivos.some((a) => (a.id && a.id === item.id) || (a.url && a.url === item.url))
    );
  };

  // Filtered files
  const filteredArchivos = archivos.filter((item) => {
    const inUse = isMediaInUse(item);
    if ((statusFilter === "disponible" || statusFilter === "disponibles") && inUse) return false;
    if (statusFilter === "en_uso" && !inUse) return false;
    if (typeFilter === "image" && item.tipo !== "image") return false;
    if (typeFilter === "video" && item.tipo !== "video") return false;
    return true;
  });

  const enUsoCount = archivos.filter((a) => isMediaInUse(a)).length;
  const disponiblesCount = archivos.length - enUsoCount;

  return (
    <div className="space-y-6 font-inter relative pb-12">
      {/* INTEGRATED HEADER BAR */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0"
              title="Volver a los calendarios"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs mb-1 font-sora">
              <Film className="w-4 h-4" />
              <span>BANCO DE MEDIOS Y GALERÍA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
              {calendarioNombre}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchGallery}
          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0"
          title="Actualizar banco de medios"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
        </button>
      </div>

      {/* 2-COLUMN MAIN CONTENT (1/3 Upload, 2/3 Gallery Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <MediaGalleryUploader
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onUploadFiles={handleUploadFiles}
        />

        <div className="lg:col-span-8 space-y-4">
          <MediaGalleryFilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            totalCount={archivos.length}
            disponiblesCount={disponiblesCount}
            enUsoCount={enUsoCount}
          />

          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-sora font-bold text-gray-700">Cargando banco de medios...</p>
            </div>
          ) : filteredArchivos.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h4 className="font-sora font-bold text-gray-900 text-base mb-1">
                No se encontraron archivos
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                {archivos.length === 0
                  ? "Sube tus primeros archivos utilizando el panel de carga para comenzar a organizar tu feed visual."
                  : "No hay archivos que coincidan con la combinación de filtros de estado y formato seleccionados."}
              </p>
              {archivos.length > 0 && (statusFilter !== "all" || typeFilter !== "all") ? (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-bold transition-all duration-150 active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer Filtros
                </button>
              ) : archivos.length === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    const dropzoneInput = document.querySelector('input[type="file"]');
                    if (dropzoneInput) dropzoneInput.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] shadow-md shadow-blue-200 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Seleccionar Archivos
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredArchivos.map((item) => (
                <GalleryItemCard
                  key={item.id}
                  item={item}
                  isSelectMode={isSelectMode}
                  isSelected={selectedFileIds.includes(item.id)}
                  isInUse={isMediaInUse(item)}
                  onLongPress={handleCardLongPress}
                  onClickItem={handleCardClick}
                  onSingleDelete={(media) => setDeletingMedia(media)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingBatchToolbar
        selectedCount={selectedFileIds.length}
        isAllSelected={selectedFileIds.length === filteredArchivos.length}
        onSelectAll={handleSelectAll}
        onCancelSelection={() => setSelectedFileIds([])}
        onOpenDeleteConfirm={() => setShowBatchDeleteConfirm(true)}
      />

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewMedia && (
        <MediaDetailModal
          media={previewMedia}
          posts={posts}
          onClose={() => setPreviewMedia(null)}
          onDelete={(media) => setDeletingMedia(media)}
          showDelete={true}
          onEditPost={(p) => setEditingPost(p)}
          onAssignPost={handleAssignPost}
          onAddToExistingPost={handleAddToExistingPost}
        />
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <PostModal
          isOpen={Boolean(editingPost)}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePostFromGallery}
          calendarioId={calendarioId}
          initialData={editingPost}
          isSaving={isSavingPost}
        />
      )}

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingMedia)}
        title="¿Eliminar archivo?"
        message={`¿Estás seguro de que deseas eliminar "${deletingMedia?.nombre_archivo || 'este archivo'}" de la galería? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isProcessing={isDeleting}
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* BATCH DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={showBatchDeleteConfirm}
        title={`¿Eliminar ${selectedFileIds.length} archivo(s)?`}
        message={`Esta acción eliminará de forma permanente los ${selectedFileIds.length} archivos seleccionados de la galería y de Cloudflare R2.`}
        confirmText="Confirmar Borrado"
        isProcessing={isDeleting}
        onClose={() => setShowBatchDeleteConfirm(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </div>
  );
}
