import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  getArchivosByCalendario,
  getPostsByCalendario,
  deleteArchivo,
  createPost,
  updatePost
} from "@/services/calendarService";
import { useUpload } from "@/context/UploadContext";
import { getLocalDateString } from "@/utils/formatters";

/**
 * useMediaGalleryManager
 * Encapsulates media file fetching, multi-selection, filtering, deletions, and post creation.
 */
export function useMediaGalleryManager(calendarioId, refreshTrigger = 0) {
  const [archivos, setArchivos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Global Upload Context
  const { addUploadListener } = useUpload();

  // Modals state
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

  const handleSelectAll = (filteredItems) => {
    if (selectedFileIds.length === filteredItems.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredItems.map((a) => a.id));
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

  return {
    archivos,
    posts,
    loading,
    fetchGallery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredArchivos,
    enUsoCount,
    disponiblesCount,
    isMediaInUse,
    isSelectMode,
    selectedFileIds,
    setSelectedFileIds,
    handleCardLongPress,
    handleCardClick,
    handleSelectAll,
    previewMedia,
    setPreviewMedia,
    deletingMedia,
    setDeletingMedia,
    isDeleting,
    handleConfirmDelete,
    showBatchDeleteConfirm,
    setShowBatchDeleteConfirm,
    handleConfirmBatchDelete,
    editingPost,
    setEditingPost,
    isSavingPost,
    handleSavePostFromGallery,
    handleAssignPost,
    handleAddToExistingPost
  };
}

