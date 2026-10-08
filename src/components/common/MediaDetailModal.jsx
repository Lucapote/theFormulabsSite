import { useState, useEffect } from "react";
import {
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Clock,
  Edit2
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

export default function MediaDetailModal({
  media,
  posts = [],
  onClose,
  onDelete = null,
  showDelete = false,
  onEditPost = null
}) {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] max-w-4xl w-full my-auto overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Player / Display Container */}
        <div className="md:w-3/5 bg-gray-950 flex items-center justify-center relative p-3 sm:p-4 shrink-0 max-h-[45vh] md:max-h-full overflow-hidden">
          {media.tipo === "video" ? (
            <video
              src={media.url}
              controls
              autoPlay
              preload="metadata"
              playsInline
              poster={media.thumbnail_url || undefined}
              className="max-h-[40vh] md:max-h-[65vh] w-full object-contain rounded-xl"
            />
          ) : (
            <img
              src={media.url}
              alt={media.nombre_archivo || "Media preview"}
              className="max-h-[40vh] md:max-h-[65vh] w-full object-contain rounded-xl"
            />
          )}
        </div>

        {/* Details Side Panel */}
        <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <span className="inline-block text-[10px] font-sora font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
                DETALLES DE MEDIO
              </span>
            </div>

            <h3 className="font-sora font-extrabold text-gray-900 text-base md:text-lg mb-3 break-all leading-snug">
              {media.nombre_archivo || "Archivo de Galería"}
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600 font-medium">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Tipo de Archivo:</span>
                <span className="font-sora font-bold text-gray-900 uppercase flex items-center gap-1.5">
                  {media.tipo === "video" ? (
                    <>
                      <VideoIcon className="w-3.5 h-3.5 text-pink-500" /> Video / Reel
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-[#188ff0]" /> Imagen
                    </>
                  )}
                </span>
              </div>

              {/* Estado en Post & Detalles del Reel/Post */}
              <div className="py-2.5 border-b border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Estado en Post:</span>
                  <span
                    className={`font-sora font-bold text-xs px-2.5 py-0.5 rounded-full ${
                      media.en_uso || associatedPosts.length > 0
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {media.en_uso || associatedPosts.length > 0
                      ? "En uso"
                      : "Disponible (Sin usar)"}
                  </span>
                </div>

                {loadingPosts ? (
                  <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-400 font-medium animate-pulse">
                    Buscando detalles de publicación...
                  </div>
                ) : associatedPosts.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-sora font-bold uppercase tracking-wider text-purple-600 block">
                      En uso en publicación ({associatedPosts.length}):
                    </span>
                    {associatedPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          if (onEditPost) {
                            onClose();
                            onEditPost(post);
                          }
                        }}
                        className={`p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs space-y-2 transition-all ${
                          onEditPost
                            ? "cursor-pointer hover:bg-purple-100 hover:border-purple-300 hover:shadow-md group"
                            : ""
                        }`}
                        title={onEditPost ? "Haz clic para editar esta publicación" : undefined}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-sora font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                post.tipo_post === "reel"
                                  ? "bg-pink-500 text-white shadow-2xs"
                                  : "bg-[#188ff0] text-white shadow-2xs"
                              }`}
                            >
                              {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                            </span>

                            <span className="text-[10px] font-mono text-gray-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-600" />
                              {post.fecha_programada || "Sin fecha"} • {formatTimeHHMM(post.hora_programada)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase ${
                                post.estado === "publicado"
                                  ? "bg-purple-200 text-purple-800"
                                  : post.estado === "borrador"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {post.estado === "publicado"
                                ? "Publicado"
                                : post.estado === "borrador"
                                ? "Borrador"
                                : "Programado"}
                            </span>

                            {onEditPost && (
                              <span className="text-[10px] font-sora font-bold text-purple-700 group-hover:text-purple-900 inline-flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                                <Edit2 className="w-3 h-3 text-purple-600" /> Editar
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : media.en_uso ? (
                  <div className="p-2.5 rounded-xl bg-purple-50 text-[11px] text-purple-700 font-medium">
                    Asignado a una publicación en este calendario.
                  </div>
                ) : null}
              </div>

              {media.created_at && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Fecha de Subida:</span>
                  <span className="font-mono text-gray-700">
                    {new Date(media.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={copyMediaUrl}
              className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 font-sora font-bold text-xs rounded-full inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" /> Link Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Enlace Directo
                </>
              )}
            </button>

            {showDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(media)}
                className="w-full h-10 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-sora font-bold text-xs rounded-full inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Eliminar de Galería
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
