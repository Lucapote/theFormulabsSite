import {
  Film,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Layers,
  Smartphone,
  Play,
  Edit,
  Plus
} from "lucide-react";
import { getPostStatusMeta, getPostFormatMeta } from "@/utils/postStatusHelpers";
import { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

export default function HomePostsAgenda({
  posts = [],
  onSelectPost,
  onNavigateToCalendars
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col font-inter">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-brand-magenta">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sora font-extrabold text-base text-gray-900 tracking-tight">
              Publicaciones del Día ({posts.length})
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Contenido programado en calendarios editoriales
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToCalendars}
          className="text-xs font-sora font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Ir a Calendarios</span>
        </button>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="py-12 text-center my-auto">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h4 className="font-sora font-bold text-gray-900 text-sm mb-1">
            Sin publicaciones para esta fecha
          </h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
            No hay posts programados ni borradores con entrega pactada para este día.
          </p>
          <button
            type="button"
            onClick={onNavigateToCalendars}
            className="h-9 px-4 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Programar en Calendario
          </button>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {posts.map((post) => {
            const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
            const statusMeta = getPostStatusMeta(post.estado);
            const formatMeta = getPostFormatMeta(post.tipo_post, post.archivos?.length || 0);
            const clienteNombre = post.calendario?.cliente?.nombre || post.calendario?.nombre || "Cliente";

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="p-4 rounded-2xl border border-gray-100 hover:border-pink-200 bg-gray-50/50 hover:bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                {/* Thumbnail or Icon */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-100 flex items-center justify-center">
                  {firstFile ? (
                    firstFile.tipo === "video" ? (
                      firstFile.thumbnail_url ? (
                        <img
                          src={firstFile.thumbnail_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <VideoIcon className="w-5 h-5 text-pink-400" />
                      )
                    ) : (
                      <img
                        src={firstFile.url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 text-center p-1">
                      {post.tipo_post === "reel" ? (
                        <VideoIcon className="w-4 h-4 text-gray-400 mb-0.5" />
                      ) : post.tipo_post === "historia" ? (
                        <Smartphone className="w-4 h-4 text-gray-400 mb-0.5" />
                      ) : (
                        <Layers className="w-4 h-4 text-gray-400 mb-0.5" />
                      )}
                      <span className="text-[7px] font-sora font-extrabold uppercase">Sin Medios</span>
                    </div>
                  )}

                  {firstFile?.tipo === "video" && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {formatTimeHHMM(post.hora_programada)} hrs
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase ${statusMeta.lightBadgeClass || "bg-gray-100 text-gray-700"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-sora font-bold text-gray-800 truncate max-w-[160px]">
                      {clienteNombre}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] font-sora font-bold text-brand-magenta uppercase flex items-center gap-1">
                      {formatMeta.label}
                    </span>
                  </div>

                  {post.caption ? (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Sin copy redactado aún...
                    </p>
                  )}
                </div>

                {/* Edit Icon */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-brand-magenta">
                  <Edit className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

