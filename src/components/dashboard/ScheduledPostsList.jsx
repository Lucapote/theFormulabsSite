import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  getPostsByCalendario,
  createPost,
  updatePost,
  deletePost
} from "@/services/calendarService";
import PostModal from "./PostModal";
import ImportWordModal from "./ImportWordModal";
import CalendarGridView from "@/components/calendar/CalendarGridView";
import InstagramPostPreviewModal from "@/components/common/InstagramPostPreviewModal";
import PostCardItem from "./PostCardItem";
import ScheduledPostsFilterBar from "./ScheduledPostsFilterBar";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

/**
 * ScheduledPostsList
 * Main list container component for managing, filtering, and displaying scheduled posts & draft boxes.
 */
export default function ScheduledPostsList({
  calendarioId,
  calendarioNombre = "Calendario",
  calendarioSlug = "",
  calendarioMes = new Date().getMonth() + 1,
  calendarioAnio = new Date().getFullYear(),
  tipoContenido = "Reels y Carruseles",
  plataformas = "Instagram y Facebook",
  forceViewMode = null,
  hideViewModeSwitcher = false,
  showOnlyDrafts = false,
  onPostUpdated = null
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [formatoFilter, setFormatoFilter] = useState("all");

  // View Mode: 'list' (Lista de Cajas / Posts) vs 'grid' (Cuadrícula Mensual)
  const [viewMode, setViewMode] = useState(forceViewMode || "list");

  useEffect(() => {
    if (forceViewMode) {
      setViewMode(forceViewMode);
    }
  }, [forceViewMode]);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPreviewPost, setSelectedPreviewPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState(null);

  // Load posts
  const loadPosts = async () => {
    if (!calendarioId) return;
    setLoading(true);
    const res = await getPostsByCalendario(calendarioId);
    if (res.success) {
      setPosts(res.data || []);
    } else {
      toast.error(res.error || "No se pudieron cargar los posts del calendario.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, [calendarioId]);

  // Compute filtered posts list
  const filteredPosts = posts.filter((post) => {
    const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
    const isEmptyBox = !firstFile || post.estado === "borrador";

    if (showOnlyDrafts && !isEmptyBox) return false;

    if (estadoFilter === "borrador" && !isEmptyBox) return false;
    if (estadoFilter === "programado" && (isEmptyBox || post.estado !== "programado")) return false;
    if (estadoFilter === "publicado" && post.estado !== "publicado") return false;

    if (formatoFilter === "reel" && post.tipo_post !== "reel") return false;
    if (formatoFilter === "carrousel" && post.tipo_post !== "carrousel") return false;

    return true;
  });

  // Create / Edit Post Save Handler
  const handleSavePost = async (formData) => {
    setIsSaving(true);
    if (formData.id) {
      const res = await updatePost(formData.id, formData, formData.archivosAnteriores);
      if (res.success) {
        toast.success("Publicación actualizada con éxito.");
        setShowModal(false);
        setEditingPost(null);
        loadPosts();
        if (onPostUpdated) onPostUpdated();
      } else {
        toast.error(res.error || "No se pudo actualizar el post.");
      }
    } else {
      const res = await createPost(formData);
      if (res.success) {
        toast.success("Publicación programada exitosamente.");
        setShowModal(false);
        setEditingPost(null);
        loadPosts();
        if (onPostUpdated) onPostUpdated();
      } else {
        toast.error(res.error || "No se pudo programar la publicación.");
      }
    }
    setIsSaving(false);
  };

  // Delete Post Handler
  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    const res = await deletePost(deletingPost.id, deletingPost.archivos);
    if (res.success) {
      toast.success("Publicación eliminada y medios liberados.");
      setDeletingPost(null);
      loadPosts();
      if (onPostUpdated) onPostUpdated();
    } else {
      toast.error(res.error || "Error al eliminar el post.");
    }
    setIsDeleting(false);
  };

  // Copy caption handler
  const copyCaption = (postId, captionText, e) => {
    if (e) e.stopPropagation();
    if (!captionText) {
      toast.error("No hay texto en esta publicación para copiar.");
      return;
    }
    navigator.clipboard.writeText(captionText);
    setCopiedPostId(postId);
    toast.success("Copywriting copiado al portapapeles.");
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Action Bar & Toolbar */}
      <ScheduledPostsFilterBar
        showOnlyDrafts={showOnlyDrafts}
        calendarioNombre={calendarioNombre}
        filteredPostsCount={filteredPosts.length}
        estadoFilter={estadoFilter}
        setEstadoFilter={setEstadoFilter}
        formatoFilter={formatoFilter}
        setFormatoFilter={setFormatoFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hideViewModeSwitcher={hideViewModeSwitcher}
        loading={loading}
        onNewPostClick={() => {
          setEditingPost(null);
          setShowModal(true);
        }}
        onImportClick={() => setShowImportModal(true)}
        onRefreshClick={loadPosts}
      />

      {/* RENDER MODE CONTENT */}
      {loading ? (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-sora font-bold text-gray-700">Cargando publicaciones...</p>
        </div>
      ) : viewMode === "grid" ? (
        <CalendarGridView
          mes={calendarioMes}
          anio={calendarioAnio}
          posts={posts}
          tipoContenido={tipoContenido}
          plataformas={plataformas}
          readOnly={false}
          onDayClick={(dateStr) => {
            setEditingPost({ fecha_programada: dateStr });
            setShowModal(true);
          }}
          onPostClick={(post) => {
            setEditingPost(post);
            setShowModal(true);
          }}
        />
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
          <CalendarIcon className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h4 className="font-sora font-extrabold text-gray-900 text-lg mb-1">
            {showOnlyDrafts
              ? "No hay cajas vacías pendientes"
              : estadoFilter === "publicado"
              ? formatoFilter === "reel"
                ? "No hay Reels publicados aún"
                : formatoFilter === "carrousel"
                ? "No hay Carruseles publicados aún"
                : "No hay publicaciones en estado Publicado aún"
              : "No hay publicaciones con estos filtros"}
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            {showOnlyDrafts
              ? "Todas las cajas vacías han sido completadas."
              : estadoFilter === "publicado"
              ? "Las publicaciones pasarán aquí al publicarse."
              : "No hay elementos con los filtros seleccionados."}
          </p>
          {!showOnlyDrafts && estadoFilter !== "publicado" && (
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingPost(null);
                  setShowModal(true);
                }}
                className="h-10 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs rounded-full shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Post
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredPosts.map((post) => (
            <PostCardItem
              key={post.id}
              post={post}
              copiedPostId={copiedPostId}
              onSelectPreview={(p) => setSelectedPreviewPost(p)}
              onEditPost={(p) => {
                setEditingPost(p);
                setShowModal(true);
              }}
              onDeletePost={(p) => setDeletingPost(p)}
              onCopyCaption={copyCaption}
            />
          ))}
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      <PostModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        calendarioId={calendarioId}
        initialData={editingPost}
        isSaving={isSaving}
      />

      {/* IMPORT WORD (.DOCX) MODAL */}
      <ImportWordModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        calendarioId={calendarioId}
        onImportSuccess={() => {
          loadPosts();
          if (onPostUpdated) onPostUpdated();
        }}
      />

      {/* INSTAGRAM-STYLE PREVIEW MODAL */}
      {selectedPreviewPost && (
        <InstagramPostPreviewModal
          isOpen={Boolean(selectedPreviewPost)}
          post={selectedPreviewPost}
          onClose={() => setSelectedPreviewPost(null)}
          onEditPost={(postToEdit) => {
            setSelectedPreviewPost(null);
            setEditingPost(postToEdit);
            setShowModal(true);
          }}
          onDeletePost={(postToDelete) => {
            setSelectedPreviewPost(null);
            setDeletingPost(postToDelete);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL - Reusing ConfirmDeleteModal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingPost)}
        title="¿Eliminar publicación?"
        message="Esta acción eliminará la publicación del calendario y liberará sus archivos en el banco de medios."
        confirmText="Eliminar Post"
        isProcessing={isDeleting}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
