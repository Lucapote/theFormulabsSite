import {
  Video as VideoIcon,
  Layers,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  Check,
  Edit2,
  Trash2,
  Play
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
  onCopyCaption
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
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={firstFile.url}
                    muted
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
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
