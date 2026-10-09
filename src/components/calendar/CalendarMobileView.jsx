import {
  Video as VideoIcon,
  Layers,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Play,
  Edit2
} from "lucide-react";
import { formatTimeHHMM } from "./CalendarGridView";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * CalendarMobileView
 * Mobile view component featuring native agenda drawer and compact monthly grid.
 */
export default function CalendarMobileView({
  gridCells = [],
  posts = [],
  readOnly = false,
  selectedMobileDate,
  setSelectedMobileDate,
  onDayClick,
  onPostClick,
  handlePostCardClick
}) {
  const activeDayPosts = posts.filter((p) => p.fecha_programada === selectedMobileDate);

  return (
    <div className="block md:hidden space-y-4 font-inter">
      {/* MOBILE SELECTED DAY AGENDA DRAWER */}
      {selectedMobileDate && (
        <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-sora font-bold text-pink-500 uppercase tracking-widest block">
                PUBLICACIONES DEL DÍA
              </span>
              <h4 className="font-sora font-extrabold text-gray-900 text-base">
                {selectedMobileDate}
              </h4>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  if (onDayClick) onDayClick(selectedMobileDate);
                }}
                className="h-8 px-3.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full font-sora font-bold text-xs inline-flex items-center gap-1 cursor-pointer border border-pink-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar</span>
              </button>
            )}
          </div>

          {activeDayPosts.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-sora font-bold text-gray-700">
                Sin publicaciones para este día
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
                No hay nada programado aún para esta fecha.
              </p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    if (onDayClick) onDayClick(selectedMobileDate);
                  }}
                  className="h-9 px-4 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Programar Post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDayPosts.map((post) => {
                const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;

                return (
                  <div
                    key={post.id}
                    onClick={(e) => handlePostCardClick(post, e)}
                    className="p-3 bg-gray-50 hover:bg-blue-50/40 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-200">
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
                              <Play className="w-3 h-3 text-white absolute fill-current" />
                            </div>
                          ) : (
                            <img src={firstFile.url} alt="Media" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            {post.tipo_post === "reel" ? (
                              <VideoIcon className="w-4 h-4 text-pink-400" />
                            ) : (
                              <Layers className="w-4 h-4 text-[#188ff0]" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[9px] font-sora font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              post.tipo_post === "reel"
                                ? "bg-pink-100 text-pink-600"
                                : "bg-blue-100 text-[#188ff0]"
                            }`}
                          >
                            {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {formatTimeHHMM(post.hora_programada)}
                          </span>
                        </div>
                        <p className="text-xs font-sora font-bold text-gray-900 truncate">
                          {post.caption || "Sin caption asignado"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPostClick) onPostClick(post);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
                      title="Editar publicación"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOBILE COMPACT CALENDAR GRID */}
      <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 space-y-3">
        <div className="grid grid-cols-7 text-gray-500 font-sora text-[11px] font-extrabold text-center">
          {WEEKDAYS.map((w, idx) => (
            <div key={idx} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {gridCells.map((cell, idx) => {
            const dayPosts = cell.isCurrentMonth
              ? posts.filter((p) => p.fecha_programada === cell.dateString)
              : [];
            const hasPosts = dayPosts.length > 0;
            const isSelected = cell.isCurrentMonth && cell.dateString === selectedMobileDate;

            return (
              <button
                key={idx}
                type="button"
                disabled={!cell.isCurrentMonth}
                onClick={(e) => {
                  if (cell.isCurrentMonth) {
                    setSelectedMobileDate(cell.dateString);
                    if (hasPosts && dayPosts.length > 0) {
                      handlePostCardClick(dayPosts[0], e);
                    }
                  }
                }}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  !cell.isCurrentMonth
                    ? "text-gray-300 opacity-20 cursor-default"
                    : isSelected
                    ? "bg-[#188ff0] text-white font-sora font-extrabold shadow-md scale-105 z-10"
                    : cell.isToday
                    ? "bg-pink-100 text-pink-700 font-sora font-extrabold border border-pink-300"
                    : hasPosts
                    ? "bg-pink-500 text-white font-sora font-extrabold shadow-xs"
                    : "bg-sky-50/60 text-sky-900 font-sora font-bold hover:bg-sky-100"
                }`}
              >
                <span className="text-xs leading-none">{cell.dayNumber}</span>

                {hasPosts && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-xs" />
                )}
                {hasPosts && isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-around font-sora text-[10px] font-bold text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>Con publicaciones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#188ff0]" />
            <span>Seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
