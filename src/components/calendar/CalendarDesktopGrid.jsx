import { Video as VideoIcon, Layers, Plus, Play } from "lucide-react";
import { formatTimeHHMM } from "./CalendarGridView";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * CalendarDesktopGrid
 * Desktop grid view layout for monthly calendar posts.
 */
export default function CalendarDesktopGrid({
  gridCells = [],
  posts = [],
  readOnly = false,
  onDayClick,
  handlePostCardClick
}) {
  return (
    <div className="hidden md:block bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-4 font-inter">
      {/* Weekday Header Columns */}
      <div className="grid grid-cols-7 text-gray-900 font-sora text-xs font-black text-center mb-1">
        {WEEKDAYS.map((w, idx) => (
          <div key={idx} className="py-1 uppercase tracking-wider">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-2">
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
              className={`min-h-[90px] sm:min-h-[110px] p-2.5 rounded-2xl transition-all flex flex-col justify-between relative group ${
                !cell.isCurrentMonth
                  ? "bg-gray-100/50 text-gray-300 opacity-40 pointer-events-none"
                  : hasPosts
                  ? "bg-gradient-to-tr from-pink-500 to-pink-600 text-white shadow-md shadow-pink-500/25 border-2 border-pink-400 hover:scale-[1.02] cursor-pointer"
                  : "bg-sky-50/70 border border-sky-200/70 hover:bg-sky-100/80 text-sky-900 cursor-pointer"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between z-10">
                <span
                  className={`font-sora text-xs font-black ${
                    cell.isToday
                      ? "w-6 h-6 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-xs"
                      : hasPosts
                      ? "text-white"
                      : "text-sky-900"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {!readOnly && cell.isCurrentMonth && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDayClick) onDayClick(cell.dateString);
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xs ${
                      hasPosts
                        ? "bg-white text-pink-600 hover:bg-pink-100"
                        : "bg-pink-500 text-white hover:bg-pink-600"
                    }`}
                    title="Programar post para este día"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Posts Cards inside Cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px] mt-1 pr-0.5">
                {dayPosts.map((post) => {
                  const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;

                  return (
                    <div
                      key={post.id}
                      onClick={(e) => handlePostCardClick(post, e)}
                      className="p-1 rounded-xl text-left transition-all cursor-pointer flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border border-white/20 shadow-2xs"
                    >
                      {/* Thumbnail */}
                      <div className="w-5 h-5 rounded-lg overflow-hidden bg-gray-900 shrink-0 relative">
                        {firstFile ? (
                          firstFile.tipo === "video" ? (
                            <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                              {firstFile.thumbnail_url ? (
                                <img
                                  src={firstFile.thumbnail_url}
                                  alt="Video thumbnail"
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
                              <Play className="w-2.5 h-2.5 text-white absolute fill-current" />
                            </div>
                          ) : (
                            <img src={firstFile.url} alt="Media" className="w-full h-full object-cover" />
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

                      {/* Format & Time */}
                      <div className="min-w-0 flex-1 leading-none">
                        <span className="font-sora font-extrabold text-[9px] truncate block text-white">
                          {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                        </span>
                        <span className="text-[8px] font-mono text-white/90 font-semibold">
                          {formatTimeHHMM(post.hora_programada)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* COLOR LEGEND BAR */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 font-sora text-xs font-extrabold">
        <div className="h-9 px-5 rounded-full bg-pink-500 text-white shadow-md shadow-pink-500/20 inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span>Días que se publica</span>
        </div>

        <div className="h-9 px-5 rounded-full bg-[#188ff0] text-white shadow-md shadow-blue-500/20 inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/60" />
          <span>Días que no se publica</span>
        </div>
      </div>
    </div>
  );
}
