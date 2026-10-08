import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Sparkles,
  Filter,
  X,
  Play,
  Film,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  getArchivosByCalendario,
  getPostsByCalendario,
  uploadMediaFile,
  deleteArchivo,
  createPost,
  updatePost
} from "@/services/calendarService";
import { compressMediaFile, formatBytes } from "@/utils/mediaCompressor";
import { useUpload } from "@/context/UploadContext";
import { useLongPress } from "@/hooks/useLongPress";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import PostModal from "./PostModal";
import GalleryItemCard from "./GalleryItemCard";

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
  const uploadProgress = { current: uploadState.current, total: uploadState.total };

  // Lightbox / Delete / Edit Post Modal
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
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
      fecha_programada: new Date().toISOString().split("T")[0],
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

  // Copy link handler
  const copyMediaUrl = (item, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("Enlace del archivo copiado al portapapeles.");
    setTimeout(() => setCopiedId(null), 2000);
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
    // Status filter
    if ((statusFilter === "disponible" || statusFilter === "disponibles") && inUse) return false;
    if (statusFilter === "en_uso" && !inUse) return false;

    // Type filter
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

        {/* Refresh Button */}
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
        {/* LEFT COLUMN (1/3 Width: lg:col-span-4) - COMPACT UPLOADER */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-pink-500" />
              <h3 className="font-sora font-bold text-gray-900 text-sm">Subir Nuevos Medios</h3>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              isDragging
                ? "border-pink-500 bg-pink-50/50 scale-[1.02]"
                : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadFiles(e.target.files);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-sora font-bold text-gray-800 mb-1">
              Arrastra tus archivos aquí
            </p>
            <p className="text-[11px] text-gray-400">
              o haz clic para examinar desde tu equipo (Imágenes o Videos)
            </p>
          </div>

          {/* Uploading Status Panel */}
          {isUploading && (
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-sora font-bold text-pink-700">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Subiendo archivos...
                </span>
                <span>
                  {uploadProgress.current} de {uploadProgress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{
                    width: `${
                      uploadProgress.total > 0
                        ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (2/3 Width: lg:col-span-8) - GALLERY GRID */}
        <div className="lg:col-span-8 space-y-4">
          {/* FILTER BAR & COUNTS */}
          <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sora font-extrabold cursor-pointer transition-all whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos ({archivos.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("disponibles")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sora font-extrabold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "disponibles" || statusFilter === "disponible"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Disponibles ({disponiblesCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("en_uso")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sora font-extrabold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "en_uso"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> En uso ({enUsoCount})
              </button>
            </div>

            {/* Type Filters */}
            <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all whitespace-nowrap ${
                  typeFilter === "all"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("image")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                  typeFilter === "image"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Imágenes
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("video")}
                className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                  typeFilter === "video"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" /> Videos
              </button>
            </div>
          </div>

          {/* GRID RENDER */}
          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-sora font-bold text-gray-700">Cargando banco de medios...</p>
            </div>
          ) : filteredArchivos.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-sora font-bold text-gray-900 text-base mb-1">
                No se encontraron archivos
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                {archivos.length === 0
                  ? "Sube tus primeros archivos utilizando el panel de carga lateral."
                  : "No hay archivos que coincidan con los filtros seleccionados."}
              </p>
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

      {/* FLOATING BATCH SELECTION TOOLBAR */}
      {selectedFileIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 border border-gray-800 text-white rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom duration-200 font-sora max-w-[90vw] sm:max-w-md">
          {/* Selected Badge & Counter */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
              {selectedFileIds.length}
            </span>
            <span className="text-xs font-bold text-gray-200">
              {selectedFileIds.length === 1 ? "seleccionado" : "seleccionados"}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-750 mx-0.5" />

          {/* Select All Toggle */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {selectedFileIds.length === filteredArchivos.length ? "Deseleccionar" : "Todos"}
          </button>

          <div className="h-4 w-px bg-gray-750 mx-0.5" />

          {/* Cancel Action (Icon) */}
          <button
            type="button"
            onClick={() => setSelectedFileIds([])}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Cancelar selección"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Delete Action (Icon Button) */}
          <button
            type="button"
            onClick={() => setShowBatchDeleteConfirm(true)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-md shadow-red-500/20 cursor-pointer shrink-0"
            title={`Eliminar ${selectedFileIds.length} archivo(s)`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

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
      {deletingMedia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200 font-inter">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-sora font-extrabold text-gray-900 mb-2">
              ¿Eliminar archivo?
            </h3>

            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-gray-800">{deletingMedia.nombre_archivo}</strong> de la galería?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200 font-inter">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-sora font-extrabold text-gray-900 text-lg">
                ¿Eliminar {selectedFileIds.length} archivo(s)?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Esta acción eliminará de forma permanente los {selectedFileIds.length} archivos seleccionados de la galería y de Cloudflare R2.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteConfirm(false)}
                disabled={isDeleting}
                className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                disabled={isDeleting}
                className="h-11 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Confirmar Borrado
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
