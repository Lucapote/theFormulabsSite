import { Video as VideoIcon, Layers, Plus, Play } from "lucide-react";
import { formatTimeHHMM } from "./CalendarGridView";
import { getPostStatusMeta, POST_STATUS_LIST } from "@/utils/postStatusHelpers";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * CalendarDesktopGrid
 * Cuadrícula mensual de escritorio (>= 1024px) con puntos indicadores cromáticos
 * por estado de publicación, leyenda de progreso de 5 estados y auto-ajuste al viewport.
 */
export default function CalendarDesktopGrid({
  gridCells = [],
  posts = [],
  readOnly = false,
  onDayClick,
  handlePostCardClick
}) {
  const rowCount = Math.ceil(gridCells.length / 7) || 5;

  return (
    <div className="hidden lg:flex flex-col justify-between bg-white rounded-[2rem] p-3 lg:p-3.5 xl:p-4 shadow-xl border border-gray-100 font-inter w-full flex-1 min-h-0 overflow-hidden">
      {/* Weekday Header Columns */}
      <div className="grid grid-cols-7 text-gray-900 font-sora text-xs font-black text-center mb-1 shrink-0">
        {WEEKDAYS.map((w, idx) => (
          <div key={idx} className="py-0.5 uppercase tracking-wider">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days (Equal fractional height per row) */}
      <div
        className={`grid grid-cols-7 gap-1.5 xl:gap-2 flex-1 min-h-0 ${
          rowCount > 5 ? "grid-rows-6" : "grid-rows-5"
        }`}
      >
        {gridCells.map((cell, idx) => {
          const dayPosts = cell.isCurrentMonth
            ? posts.filter((p) => p.fecha_programada === cell.dateString)
            : [];
          const hasPosts = dayPosts.length > 0;

          return (
            <div
              key={idx}
              onClick={(e) => {
                if (hasPosts && dayPosts.length > 0) {
                  handlePostCardClick(dayPosts[0], e);
                } else if (!readOnly && cell.isCurrentMonth && onDayClick) {
                  onDayClick(cell.dateString);
                }
              }}
              className={`h-full min-h-0 p-1.5 xl:p-2 rounded-xl transition-all flex flex-col justify-between relative group ${
                !cell.isCurrentMonth
                  ? "bg-gray-100/40 text-gray-300 opacity-30 pointer-events-none"
                  : hasPosts
                  ? "bg-gradient-to-tr from-pink-500 to-pink-600 text-white shadow-md shadow-pink-500/20 border border-pink-400 hover:scale-[1.01] cursor-pointer"
                  : "bg-sky-50/70 border border-sky-200/70 hover:bg-sky-100/80 text-sky-900 cursor-pointer"
              }`}
            >
              {/* Day Number & Status Indicators Header */}
              <div className="flex items-center justify-between z-10 leading-none">
                <span
                  className={`font-sora text-xs font-black ${
                    cell.isToday
                      ? "w-5 h-5 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-xs text-[11px]"
                      : hasPosts
                      ? "text-white"
                      : "text-sky-900"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {/* Puntos de estado de las publicaciones del día */}
                  {hasPosts && (
                    <div className="flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
                      {dayPosts.slice(0, 3).map((p, pIdx) => {
                        const meta = getPostStatusMeta(p.estado);
                        return (
                          <span
                            key={pIdx}
                            className={`w-1.5 h-1.5 rounded-full ${meta.dotClass} shadow-xs`}
                            title={`${meta.label}`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {!readOnly && cell.isCurrentMonth && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDayClick) onDayClick(cell.dateString);
                      }}
                      className={`w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xs ${
                        hasPosts
                          ? "bg-white text-pink-600 hover:bg-pink-100"
                          : "bg-pink-500 text-white hover:bg-pink-600"
                      }`}
                      title="Programar post para este día"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Posts Cards inside Cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[58px] xl:max-h-[68px] mt-1 pr-0.5 no-scrollbar">
                {dayPosts.map((post) => {
                  const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
                  const statusMeta = getPostStatusMeta(post.estado);

                  return (
                    <div
                      key={post.id}
                      onClick={(e) => handlePostCardClick(post, e)}
                      className="p-1 rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border border-white/20 shadow-2xs"
                    >
                      {/* Thumbnail or Icon */}
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-gray-900 shrink-0 relative">
                        {firstFile ? (
                          firstFile.tipo === "video" ? (
                            <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                              {firstFile.thumbnail_url ? (
                                <img
                                  src={firstFile.thumbnail_url}
                                  alt="Video thumbnail"
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
                                  <VideoIcon className="w-2.5 h-2.5 text-pink-400" />
                                </div>
                              )}
                              <Play className="w-2.5 h-2.5 text-white absolute fill-current drop-shadow-xs" />
                            </div>
                          ) : (
                            <img
                              src={firstFile.url}
                              alt="Media"
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            {post.tipo_post === "reel" ? (
                              <VideoIcon className="w-2.5 h-2.5 text-white" />
                            ) : (
                              <Layers className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Format, Time & Status Dot */}
                      <div className="min-w-0 flex-1 leading-none flex items-center justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <span className="font-sora font-extrabold text-[9px] truncate block text-white">
                            {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                          </span>
                          <span className="text-[8px] font-mono text-white/90 font-semibold">
                            {formatTimeHHMM(post.hora_programada)}
                          </span>
                        </div>

                        {/* Punto de estado individual en tarjeta */}
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dotClass} shadow-xs ring-1 ring-white/50`}
                          title={`Estado: ${statusMeta.label}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* COLOR LEGEND BAR - 6 ESTADOS DE PROGRESO */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2 font-sora text-[11px] font-bold shrink-0">
        <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider mr-1">
          Progreso:
        </span>
        {POST_STATUS_LIST.map((st) => (
          <div
            key={st.key}
            className="h-6 px-2.5 rounded-full bg-gray-50 border border-gray-200/90 text-gray-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-gray-100 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${st.dotClass} shadow-xs`} />
            <span className="text-[10px] font-sora">{st.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
