import {
  Video as VideoIcon,
  Layers,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  Check,
  Edit2,
  Trash2,
  Play,
  AlertTriangle,
  Loader2,
  Send,
  ExternalLink
} from "lucide-react";
import { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

/**
 * PostCardItem
 * Renders a single social media post card / draft box inside ScheduledPostsList.
 */
export default function PostCardItem({
  post,
  copiedPostId = null,
  onSelectPreview,
  onEditPost,
  onDeletePost,
  onCopyCaption,
  onPublishNow = null,
  isPublishing = false
}) {
  const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
  const isEmptyBox = !firstFile || post.estado === "borrador";

  return (
    <div
      onClick={() => {
        if (!isEmptyBox) {
          onSelectPreview(post);
        } else {
          onEditPost(post);
        }
      }}
      className={`bg-white rounded-[2rem] p-5 border shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 group cursor-pointer ${
        isEmptyBox
          ? "border-pink-200/80 hover:border-pink-300 bg-gradient-to-br from-pink-50/30 via-white to-white"
          : post.estado === "error"
          ? "border-rose-200 hover:border-rose-300 bg-rose-50/10"
          : post.estado === "procesando"
          ? "border-sky-200 hover:border-sky-300 bg-sky-50/10"
          : "border-gray-100 hover:border-blue-200 hover:border-blue-300"
      }`}
      title={isEmptyBox ? "Completar información de la caja" : "Ver vista previa de la publicación"}
    >
      {/* Top Section: Thumbnail & Post Details */}
      <div className="flex items-start gap-3.5">
        {/* Thumbnail */}
        {firstFile ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-100 shadow-xs group-hover:scale-[1.03] transition-all group-hover:ring-2 group-hover:ring-pink-400">
            {firstFile.tipo === "video" ? (
              <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                {firstFile.thumbnail_url ? (
                  <img
                    src={firstFile.thumbnail_url}
                    alt="Post Preview"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-slate-950 flex items-center justify-center">
                    <VideoIcon className="w-6 h-6 text-pink-400/90" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <Play className="w-4 h-4 text-white fill-current drop-shadow-xs" />
                </div>
              </div>
            ) : (
              <img
                src={firstFile.url}
                alt="Post Preview"
                loading="lazy"
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
          /* Empty Box Placeholder */
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

            {/* STATUS BADGE */}
            {post.estado === "publicado" ? (
              <span className="inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Publicado
              </span>
            ) : post.estado === "procesando" ? (
              <span className="inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                Procesando en Meta...
              </span>
            ) : post.estado === "error" ? (
              <span className="inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Error en Meta
              </span>
            ) : post.estado === "borrador" ? (
              <span className="inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Borrador
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Programado
              </span>
            )}
          </div>

          {/* Error Message Snippet if failed */}
          {post.estado === "error" && post.error_mensaje && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-[11px] text-rose-700 font-inter leading-tight">
              <span className="font-bold">Fallo en Meta:</span> {post.error_mensaje}
            </div>
          )}

          {/* Caption Snippet */}
          <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed">
            {post.caption || (
              <em className="text-gray-400 font-normal">
                Pendiente de medios, fecha y copy.
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

        <div className="flex items-center gap-1.5">
          {/* External Link to Published Post */}
          {post.estado === "publicado" && post.meta_permalink && (
            <a
              href={post.meta_permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 px-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Abrir publicación en vivo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver en Meta</span>
            </a>
          )}

          {/* Retry or Manual Publish Now Button */}
          {onPublishNow && !isEmptyBox && (post.estado === "error" || post.estado === "programado") && (
            <button
              type="button"
              disabled={isPublishing}
              onClick={(e) => {
                e.stopPropagation();
                onPublishNow(post);
              }}
              className={`h-8 px-3 rounded-full font-sora font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                post.estado === "error"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
              }`}
              title={post.estado === "error" ? "Reintentar publicación en Meta" : "Publicar ahora sin esperar al cron"}
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{post.estado === "error" ? "Reintentar" : "Publicar Ahora"}</span>
            </button>
          )}

          {post.caption && (
            <button
              type="button"
              onClick={(e) => onCopyCaption(post.id, post.caption, e)}
              className="h-8 px-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Copiar copywriting"
            >
              {copiedPostId === post.id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditPost(post);
            }}
            className="h-8 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Editar publicación"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePost(post);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            title="Eliminar publicación"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
