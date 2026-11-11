import {
  Film,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Layers,
  Smartphone,
  Play,
  Edit,
  Plus,
  Eye
} from "lucide-react";
import { getPostStatusMeta, getPostFormatMeta } from "@/utils/postStatusHelpers";
import { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

export default function HomePostsAgenda({
  posts = [],
  onSelectPost,
  onPreviewPost,
  onNavigateToCalendars
}) {
  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-gray-100 flex flex-col justify-between h-full min-h-[290px] sm:min-h-[310px] font-inter">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-brand-magenta shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
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
          <div className="py-6 sm:py-8 text-center my-auto flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-2.5">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <h4 className="font-sora font-bold text-gray-800 text-xs sm:text-sm mb-1">
              Sin publicaciones para esta fecha
            </h4>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-3.5">
              No hay posts programados ni borradores con entrega pactada para este día.
            </p>
            <button
              type="button"
              onClick={onNavigateToCalendars}
              className="h-8 px-4 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" /> Programar en Calendario
            </button>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
            {posts.map((post) => {
              const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
              const statusMeta = getPostStatusMeta(post.estado);
              const formatMeta = getPostFormatMeta(post.tipo_post, post.archivos?.length || 0);
              const clienteNombre = post.calendario?.cliente?.nombre || post.calendario?.nombre || "Cliente";

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-pink-200 bg-gray-50/50 hover:bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group"
                >
                  {/* Header Row: time, platform, status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                        {formatTimeHHMM(post.hora_programada)} hrs
                      </span>
                      <span className="text-[10px] font-sora font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full uppercase">
                        Instagram
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[9px] font-sora font-bold px-2.5 py-0.5 rounded-full uppercase ${statusMeta.lightBadgeClass || "bg-gray-100 text-gray-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Body: Thumbnail + Title & Copy */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-100 flex items-center justify-center">
                      {firstFile ? (
                        firstFile.tipo === "video" ? (
                          firstFile.thumbnail_url ? (
                            <img src={firstFile.thumbnail_url} alt="Post" className="w-full h-full object-cover" />
                          ) : (
                            <VideoIcon className="w-5 h-5 text-pink-400" />
                          )
                        ) : (
                          <img src={firstFile.url} alt="Post" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 text-center p-1">
                          {post.tipo_post === "reel" ? <VideoIcon className="w-4 h-4 text-gray-400 mb-0.5" /> : post.tipo_post === "historia" ? <Smartphone className="w-4 h-4 text-gray-400 mb-0.5" /> : <Layers className="w-4 h-4 text-gray-400 mb-0.5" />}
                          <span className="text-[7px] font-sora font-extrabold uppercase">Sin Medios</span>
                        </div>
                      )}

                      {firstFile?.tipo === "video" && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-sora font-extrabold text-gray-900 truncate">
                          {clienteNombre}
                        </h4>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-sora font-extrabold text-brand-magenta uppercase">
                          {formatMeta.label}
                        </span>
                      </div>

                      {post.caption ? (
                        <p className="text-xs text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {post.caption}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Sin copy redactado aún...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-[11px] font-medium text-gray-400 truncate max-w-[180px]">
                      {post.calendario?.nombre || "Calendario"}
                    </span>
                    <div className="flex items-center gap-3">
                      {onPreviewPost && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewPost(post);
                          }}
                          className="text-xs font-sora font-bold text-gray-600 hover:text-brand-magenta flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Vista Previa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPost(post);
                        }}
                        className="text-xs font-sora font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
