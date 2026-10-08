import { useState, useEffect } from "react";
import {
  Video as VideoIcon,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Clock,
  Edit2,
  ChevronUp,
  ChevronDown,
  Layers,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { getPostsByCalendario } from "@/services/calendarService";

function formatTimeHHMM(timeStr) {
  if (!timeStr) return "18:00";
  const parts = timeStr.toString().split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export default function MediaInfoBottomSheet({
  media,
  posts = [],
  onDelete = null,
  showDelete = false,
  onEditPost = null,
  onAssignPost = null,
  onAddToExistingPost = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [associatedPosts, setAssociatedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!media) return;

    if (posts && Array.isArray(posts) && posts.length > 0) {
      const matches = posts.filter(
        (p) =>
          Array.isArray(p.archivos) &&
          p.archivos.some(
            (a) => (a.id && a.id === media.id) || (a.url && a.url === media.url)
          )
      );
      setAssociatedPosts(matches);
      return;
    }

    if (media.calendario_id) {
      setLoadingPosts(true);
      getPostsByCalendario(media.calendario_id)
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            const matches = res.data.filter(
              (p) =>
                Array.isArray(p.archivos) &&
                p.archivos.some(
                  (a) => (a.id && a.id === media.id) || (a.url && a.url === media.url)
                )
            );
            setAssociatedPosts(matches);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingPosts(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [media, posts]);

  if (!media) return null;

  const copyMediaUrl = (e) => {
    e?.stopPropagation();
    if (media.url) {
      navigator.clipboard.writeText(media.url);
      setCopied(true);
      toast.success("Enlace del archivo copiado al portapapeles.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVideo = media.tipo === "video";
  const isInUse = Boolean(media.en_uso || associatedPosts.length > 0);

  // Existing posts with room for assignment
  const availablePostsForAssignment = posts.filter((p) => {
    const fileCount = Array.isArray(p.archivos) ? p.archivos.length : 0;
    if (p.tipo_post === "carrousel") {
      return fileCount < 20;
    }
    if (p.tipo_post === "reel") {
      return isVideo && fileCount === 0;
    }
    return false;
  });

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-4 transition-all duration-300 relative z-20 flex flex-col max-h-[75vh] shrink-0 font-inter">
      {/* Top Touch Handle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col items-center cursor-pointer py-1 select-none group"
      >
        <div className="w-12 h-1 bg-slate-600 group-hover:bg-slate-400 rounded-full transition-colors my-1" />
      </div>

      {isExpanded ? (
        /* EXPANDED STATE */
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1 mt-1">
          {/* Header Title & Expand Toggle */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-sora font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                DETALLES DEL ARCHIVO
              </span>
              <h3 className="font-sora font-extrabold text-white text-base truncate" title={media.nombre_archivo}>
                {media.nombre_archivo || "Archivo de Galería"}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Colapsar detalles"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Type & Use Status Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-sora font-bold text-slate-200 uppercase flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {isVideo ? (
                <>
                  <VideoIcon className="w-3.5 h-3.5 text-pink-400" /> Video / Reel
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" /> Imagen
                </>
              )}
            </span>

            <span
              className={`font-sora font-bold text-xs px-3 py-1 rounded-full border ${
                isInUse
                  ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                  : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
              }`}
            >
              {isInUse ? "En uso" : "Disponible (Sin usar)"}
            </span>
          </div>

          {/* Linked Posts Section (When in use) */}
          {loadingPosts ? (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 animate-pulse">
              Buscando publicación vinculada...
            </div>
          ) : associatedPosts.length > 0 ? (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-sora font-bold uppercase tracking-wider text-purple-400 block">
                En uso en publicación ({associatedPosts.length}):
              </span>
              {associatedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors hover:border-slate-600"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-sora font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          post.tipo_post === "reel"
                            ? "bg-pink-600 text-white"
                            : "bg-sky-600 text-white"
                        }`}
                      >
                        {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                      </span>

                      <span className="text-[10px] font-mono text-slate-300 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {post.fecha_programada || "Sin fecha"} • {formatTimeHHMM(post.hora_programada)}
                      </span>
                    </div>

                    <span
                      className={`inline-block text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase ${
                        post.estado === "publicado"
                          ? "bg-purple-900/80 text-purple-200 border border-purple-700/60"
                          : post.estado === "borrador"
                          ? "bg-amber-900/80 text-amber-200 border border-amber-700/60"
                          : "bg-emerald-900/80 text-emerald-200 border border-emerald-700/60"
                      }`}
                    >
                      {post.estado === "publicado"
                        ? "Publicado"
                        : post.estado === "borrador"
                        ? "Borrador"
                        : "Programado"}
                    </span>
                  </div>

                  {onEditPost && (
                    <button
                      type="button"
                      onClick={() => {
                        onEditPost(post);
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-sora font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-slate-600"
                      title="Editar publicación"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Assign to Post Section (When media is NOT in use) */}
          {!isInUse && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-sora font-bold uppercase tracking-wider text-emerald-400 block">
                Asignar Archivo a Publicación:
              </span>

              {/* 1. Add to Existing Post List (FIRST) */}
              {availablePostsForAssignment.length > 0 && onAddToExistingPost && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-sora font-medium text-slate-300 block">
                    Añadir a publicación existente en este calendario:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {availablePostsForAssignment.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => onAddToExistingPost(media, post)}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 flex items-center justify-between text-xs cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-[8px] font-sora font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              post.tipo_post === "reel" ? "bg-pink-600 text-white" : "bg-sky-600 text-white"
                            }`}
                          >
                            {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300 truncate">
                            {post.fecha_programada || "Sin fecha"} • {formatTimeHHMM(post.hora_programada)}
                          </span>
                        </div>
                        <span className="text-[10px] font-sora font-bold text-sky-400 group-hover:text-white flex items-center gap-1 shrink-0">
                          <Plus className="w-3.5 h-3.5" /> Añadir
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Create New Post Buttons (BELOW the list) */}
              <div className="space-y-2 pt-1">
                {availablePostsForAssignment.length > 0 && (
                  <span className="text-[10px] font-sora font-medium text-slate-400 block">
                    O crear una nueva publicación con este archivo:
                  </span>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {isVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onAssignPost) {
                          onAssignPost(media, "reel");
                        }
                      }}
                      className="w-full py-2.5 px-3 bg-pink-600 hover:bg-pink-500 text-white font-sora font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <VideoIcon className="w-4 h-4" />
                      <span>Crear como Reel</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onAssignPost) {
                        onAssignPost(media, "carrousel");
                      }
                    }}
                    className={`w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-sora font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                      !isVideo ? "col-span-full" : ""
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Crear en Carrusel (máx. 20)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Date Metadata */}
          {media.created_at && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
              <span>Fecha de Subida:</span>
              <span className="font-mono text-slate-300">
                {new Date(media.created_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={copyMediaUrl}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Link Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" /> Copiar Enlace Directo
                </>
              )}
            </button>

            {showDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(media)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" /> Eliminar de Galería
              </button>
            )}
          </div>
        </div>
      ) : (
        /* COLLAPSED STATE PREVIEW */
        <div
          onClick={() => setIsExpanded(true)}
          className="cursor-pointer space-y-2 select-none group"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-sora font-extrabold text-slate-100 text-sm truncate flex-1 group-hover:text-white transition-colors"
              title={media.nombre_archivo}
            >
              {media.nombre_archivo || "Archivo de Galería"}
            </h3>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase border ${
                  isInUse
                    ? "bg-purple-950/70 text-purple-300 border-purple-800/60"
                    : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                }`}
              >
                {isInUse ? "En uso" : "Disponible"}
              </span>

              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              {isVideo ? (
                <VideoIcon className="w-3 h-3 text-pink-400" />
              ) : (
                <ImageIcon className="w-3 h-3 text-sky-400" />
              )}
              {isVideo ? "Video / Reel" : "Imagen"}
            </span>
            <span className="text-[10px] text-pink-400 font-semibold group-hover:underline">
              {isInUse ? "Toca para ver detalles ↑" : "Toca para asignar a publicación ↑"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
