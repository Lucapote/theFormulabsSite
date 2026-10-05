import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video as VideoIcon,
  Layers,
  Edit2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Play,
  Film,
  AlertCircle,
  LayoutGrid,
  ListFilter,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  getPostsByCalendario,
  createPost,
  updatePost,
  deletePost
} from "@/services/calendarService";
import PostModal from "./PostModal";
import CalendarGridView, { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

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
  const [estadoFilter, setEstadoFilter] = useState("all"); // 'all' | 'borrador' | 'programado' | 'publicado'
  const [formatoFilter, setFormatoFilter] = useState("all"); // 'all' | 'reel' | 'carrousel'

  // View Mode: 'list' (Lista de Cajas / Posts) vs 'grid' (Cuadrícula Mensual)
  const [viewMode, setViewMode] = useState(forceViewMode || "list");

  useEffect(() => {
    if (forceViewMode) {
      setViewMode(forceViewMode);
    }
  }, [forceViewMode]);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [copiedPostId, setCopiedPostId] = useState(null);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  // Quick add empty draft box
  const handleAddDraftBox = async (tipo) => {
    const res = await createPost({
      calendario_id: calendarioId,
      tipo_post: tipo,
      caption: "",
      fecha_programada: null,
      hora_programada: "18:00",
      archivos: [],
      estado: "borrador"
    });

    if (res.success) {
      toast.success(`Caja vacía (${tipo === "reel" ? "Reel" : "Carrusel"}) agregada con éxito.`);
      loadPosts();
      if (onPostUpdated) onPostUpdated();
    } else {
      toast.error(res.error || "No se pudo agregar la caja vacía.");
    }
  };

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

    // If showOnlyDrafts is enabled (Galería view), show strictly empty draft boxes
    if (showOnlyDrafts && !isEmptyBox) return false;

    // Filter by Estado
    if (estadoFilter === "borrador" && !isEmptyBox) return false;
    if (estadoFilter === "programado" && (isEmptyBox || post.estado !== "programado")) return false;
    if (estadoFilter === "publicado" && post.estado !== "publicado") return false;

    // Filter by Formato
    if (formatoFilter === "reel" && post.tipo_post !== "reel") return false;
    if (formatoFilter === "carrousel" && post.tipo_post !== "carrousel") return false;

    return true;
  });

  // Create / Edit Post Save Handler
  const handleSavePost = async (formData) => {
    setIsSaving(true);
    if (formData.id) {
      // Edit post
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
      // Create new post
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

  // Copy Public Link handler
  const copyPublicLink = () => {
    if (!calendarioSlug) {
      toast.error("Este calendario no tiene un slug válido.");
      return;
    }
    const publicUrl = `${window.location.origin}/calendario/${calendarioSlug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedPublicLink(true);
    toast.success("Enlace público copiado al portapapeles.");
    setTimeout(() => setCopiedPublicLink(false), 2000);
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Action Bar & Toolbar */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs mb-1 font-sora">
              <Film className="w-4 h-4 text-brand-blue" />
              <span>{showOnlyDrafts ? "CAJAS VACÍAS PENDIENTES" : "PUBLICACIONES Y CAJAS EDITORIALES"}</span>
            </div>
            <h3 className="text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
              {calendarioNombre} ({filteredPosts.length} {showOnlyDrafts ? "cajas vacías" : "posts"})
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {showOnlyDrafts
                ? "Cajas vacías pendientes de asignar medios, fecha y copy. Al completarse pasarán automáticamente a la vista de Calendario."
                : "Administra, filtra y organiza tus publicaciones programadas, borradores y publicadas."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Single Add Post Button - Opens PostModal to select format & details */}
            {!showOnlyDrafts && estadoFilter !== "publicado" && (
              <button
                onClick={() => {
                  setEditingPost(null);
                  setShowModal(true);
                }}
                className="h-9 px-4 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Crear o programar una nueva publicación"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Post</span>
              </button>
            )}

            {/* View Mode Switcher Pills */}
            {!hideViewModeSwitcher && (
              <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
                <button
                  onClick={() => setViewMode("list")}
                  className={`h-8 px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Vista Lista de Posts"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>

                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Vista Cuadrícula Mensual"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cuadrícula</span>
                </button>
              </div>
            )}

            <button
              onClick={loadPosts}
              className="h-9 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
              title="Recargar publicaciones"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls Row (Shown in Calendario tab) */}
        {!showOnlyDrafts && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            {/* Estado Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200 text-xs font-sora font-bold">
              <span className="text-gray-400 pl-2 text-[10px] uppercase tracking-wider font-extrabold">
                Estado:
              </span>
              <button
                onClick={() => setEstadoFilter("all")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  estadoFilter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setEstadoFilter("borrador")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  estadoFilter === "borrador"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Borradores
              </button>
              <button
                onClick={() => setEstadoFilter("programado")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  estadoFilter === "programado"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Programados
              </button>
              <button
                onClick={() => setEstadoFilter("publicado")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  estadoFilter === "publicado"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Publicados
              </button>
            </div>

            {/* Formato Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200 text-xs font-sora font-bold">
              <span className="text-gray-400 pl-2 text-[10px] uppercase tracking-wider font-extrabold">
                Formato:
              </span>
              <button
                onClick={() => setFormatoFilter("all")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  formatoFilter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFormatoFilter("reel")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  formatoFilter === "reel"
                    ? "bg-pink-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Reels
              </button>
              <button
                onClick={() => setFormatoFilter("carrousel")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  formatoFilter === "carrousel"
                    ? "bg-[#188ff0] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Carruseles
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODE CONTENT */}
      {loading ? (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-sora font-bold text-gray-700">Cargando publicaciones...</p>
        </div>
      ) : viewMode === "grid" ? (
        /* MODE 1: MONTHLY GRID VIEW */
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
      ) : (
        /* MODE 2: SEQUENTIAL LIST VIEW (CAJAS A COMPLETAR) */
        filteredPosts.length === 0 ? (
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
                ? "¡Excelente! Todas tus cajas vacías han sido completadas o no se han creado más cajas."
                : estadoFilter === "publicado"
                ? "Las publicaciones o cajas programadas pasarán automáticamente a esta lista una vez que hayan sido publicadas."
                : "Intenta cambiar los filtros de estado o formato para ver tus publicaciones."}
            </p>
            {!showOnlyDrafts && estadoFilter !== "publicado" && (
              <div className="flex justify-center gap-3">
                <button
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
            {filteredPosts.map((post) => {
              const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
              const isEmptyBox = !firstFile || post.estado === "borrador";

              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-[2rem] p-5 border shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 group ${
                    isEmptyBox
                      ? "border-pink-200/80 hover:border-pink-300 bg-gradient-to-br from-pink-50/30 via-white to-white"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  {/* Top Section: Thumbnail & Post Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    {firstFile ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-100 shadow-xs">
                        {firstFile.tipo === "video" ? (
                          <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                            <video
                              src={firstFile.url}
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={firstFile.url}
                            alt="Post Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {post.archivos && post.archivos.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-sora font-bold px-1.5 py-0.5 rounded-md">
                            +{post.archivos.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Empty Box Placeholder Box */
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/60 flex flex-col items-center justify-center text-pink-600 shrink-0 text-center p-1.5 shadow-2xs">
                        {post.tipo_post === "reel" ? (
                          <VideoIcon className="w-5 h-5 mb-0.5 text-pink-500" />
                        ) : (
                          <Layers className="w-5 h-5 mb-0.5 text-brand-blue" />
                        )}
                        <span className="text-[8px] font-sora font-black uppercase tracking-tighter">Caja Vacía</span>
                      </div>
                    )}

                    {/* Post Info & Badges */}
                    <div className="min-w-0 space-y-1.5 flex-1">
                      {/* Format + Date/Time + Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            post.tipo_post === "reel"
                              ? "bg-pink-50 text-pink-600 border border-pink-200"
                              : "bg-blue-50 text-[#188ff0] border border-blue-200"
                          }`}
                        >
                          {post.tipo_post === "reel" ? (
                            <>
                              <VideoIcon className="w-3 h-3" /> Reel
                            </>
                          ) : (
                            <>
                              <Layers className="w-3 h-3" /> Carrusel ({post.archivos?.length || 0})
                            </>
                          )}
                        </span>

                        {post.fecha_programada ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            <CalendarIcon className="w-3 h-3 text-gray-500" />
                            {post.fecha_programada} • {formatTimeHHMM(post.hora_programada)} hrs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Sin fecha
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            post.estado === "publicado"
                              ? "bg-purple-100 text-purple-700"
                              : post.estado === "borrador"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.estado === "publicado"
                                ? "bg-purple-500"
                                : post.estado === "borrador"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {post.estado === "publicado"
                            ? "Publicado"
                            : post.estado === "borrador"
                            ? "Borrador"
                            : "Programado"}
                        </span>
                      </div>

                      {/* Caption Snippet */}
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed">
                        {post.caption || (
                          <em className="text-gray-400 font-normal">
                            Pendiente de asignar medios, fecha y copywriting.
                          </em>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <div className="text-[11px] font-sora font-bold text-gray-400">
                      {isEmptyBox ? "Caja Vacía" : "Publicación"}
                    </div>

                    <div className="flex items-center gap-2">
                      {post.caption && (
                        <button
                          onClick={(e) => copyCaption(post.id, post.caption, e)}
                          className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-sora font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Copiar copywriting"
                        >
                          {copiedPostId === post.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span>{copiedPostId === post.id ? "Copiado" : "Copy"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setShowModal(true);
                        }}
                        className={`h-8 px-4 rounded-full text-xs font-sora font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isEmptyBox
                            ? "bg-[#188ff0] hover:bg-blue-600 text-white"
                            : "bg-gray-900 hover:bg-pink-500 text-white"
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEmptyBox ? "Completar Post" : "Editar Post"}</span>
                      </button>

                      <button
                        onClick={() => setDeletingPost(post)}
                        className="h-8 w-8 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-sora font-extrabold text-gray-900 mb-2">
              ¿Eliminar publicación?
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Estás a punto de eliminar la publicación programada para el{" "}
              <span className="font-bold text-gray-900 font-sora">
                {deletingPost.fecha_programada}
              </span>
              . Los archivos asociados volverán a estar disponibles en la galería.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
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
                    <Trash2 className="w-4 h-4" /> Eliminar Publicación
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
