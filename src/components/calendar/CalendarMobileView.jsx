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
import { getPostStatusMeta, POST_STATUS_LIST } from "@/utils/postStatusHelpers";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * CalendarMobileView
 * Mobile view component featuring native agenda drawer and compact monthly grid.
 * En mobile el click en un día solo actualiza la agenda superior sin abrir el modal.
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
    <div className="block lg:hidden space-y-4 font-inter">
      {/* MOBILE & TABLET SELECTED DAY AGENDA DRAWER */}
      {selectedMobileDate && (
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-sora font-bold text-pink-500 uppercase tracking-widest block">
                PUBLICACIONES DEL DÍA
              </span>
              <h4 className="font-sora font-extrabold text-gray-900 text-base">
                {selectedMobileDate}
              </h4>
            </div>

            {!readOnly && onDayClick && (
              <button
                type="button"
                onClick={() => onDayClick(selectedMobileDate)}
                className="h-9 px-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-pink-500/25 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Post</span>
              </button>
            )}
          </div>

          {activeDayPosts.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-medium">
                No hay publicaciones programadas para este día.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
              {activeDayPosts.map((post) => {
                const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;
                const statusMeta = getPostStatusMeta(post.estado);

                return (
                  <div
                    key={post.id}
                    onClick={(e) => handlePostCardClick(post, e)}
                    className="p-3 bg-gray-50 hover:bg-blue-50/40 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
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
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
                                  <VideoIcon className="w-4 h-4 text-pink-400" />
                                </div>
                              )}
                              <Play className="w-3 h-3 text-white absolute fill-current drop-shadow-xs" />
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
                              <VideoIcon className="w-4 h-4 text-pink-400" />
                            ) : (
                              <Layers className="w-4 h-4 text-[#188ff0]" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info & Badges */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
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

                          {/* Status Badge */}
                          <span className={`text-[9px] font-sora font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${statusMeta.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-xs font-sora font-bold text-gray-900 truncate">
                          {post.caption || "Sin caption asignado"}
                        </p>
                      </div>
                    </div>

                    {!readOnly && onPostClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onPostClick) onPostClick(post);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors shrink-0 active:scale-[0.98]"
                        title="Editar publicación"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOBILE COMPACT CALENDAR GRID */}
      <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-3">
        <div className="grid grid-cols-7 text-gray-500 font-sora text-[11px] font-extrabold text-center">
          {WEEKDAYS.map((w, idx) => (
            <div key={idx} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    // Al tocar en mobile, SOLO actualiza el día seleccionado arriba sin abrir el modal
                    setSelectedMobileDate(cell.dateString);
                  }
                }}
                className={`h-11 sm:h-14 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative transition-all cursor-pointer active:scale-[0.98] ${
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

                {/* Puntos de estado de las publicaciones */}
                {hasPosts && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {dayPosts.slice(0, 3).map((p, pIdx) => {
                      const meta = getPostStatusMeta(p.estado);
                      return (
                        <span
                          key={pIdx}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : meta.dotClass} shadow-xs ring-0.5 ring-white/40`}
                        />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* LEYENDA CROMÁTICA DE PROGRESO */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-1.5 font-sora text-[10px] font-bold text-gray-600">
          {POST_STATUS_LIST.map((st) => (
            <div key={st.key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200">
              <span className={`w-2 h-2 rounded-full ${st.dotClass}`} />
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
