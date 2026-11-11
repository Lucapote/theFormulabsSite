import {
  CalendarRange,
  ChevronUp,
  Film,
  Clapperboard,
  Sparkles
} from "lucide-react";
import { getLocalDateString } from "@/utils/formatters";

/**
 * Format a YYYY-MM-DD date to a compact string (e.g. "10 Nov")
 */
function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];
  return `${d} ${months[m - 1]}`;
}

export default function HomeWeekStrip({
  weekData,
  selectedDate,
  onSelectDate,
  onClose
}) {
  const {
    days = [],
    weekStart,
    weekEnd,
    totalWeekActivities = 0
  } = weekData || {};

  const todayStr = getLocalDateString();

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-purple-100/80 bg-gradient-to-br from-purple-50/20 via-white to-white font-inter space-y-4 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-purple-600 font-bold tracking-widest uppercase text-[10px] font-sora">
              <Sparkles className="w-3 h-3" />
              <span>PANORAMA DE ESTA SEMANA</span>
            </div>
            <h4 className="font-sora font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
              {formatShortDate(weekStart)} — {formatShortDate(weekEnd)} ({totalWeekActivities} actividades)
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-8 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-sora font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
          title="Contraer vista semanal"
        >
          <span>Contraer</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7-Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const isToday = day.dateStr === todayStr;
          const hasActivity = day.totalActivities > 0;

          return (
            <div
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-center group active:scale-[0.98] ${
                isSelected
                  ? "bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-purple-400/40"
                  : isToday
                  ? "bg-pink-50/40 border-pink-200 hover:border-pink-300 text-gray-900 hover:bg-white shadow-2xs"
                  : hasActivity
                  ? "bg-gray-50/70 border-gray-200 hover:border-purple-300 hover:bg-white text-gray-900 shadow-2xs"
                  : "bg-gray-50/30 border-gray-100 hover:border-gray-200 hover:bg-white text-gray-700 opacity-80"
              }`}
              title={`Ver agenda para ${day.dayName} ${day.dayNumber}`}
            >
              {/* Day Name & Date Number */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-sora font-extrabold uppercase tracking-wider ${
                      isSelected
                        ? "text-purple-300"
                        : isToday
                        ? "text-brand-magenta"
                        : "text-gray-400"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  {isToday && (
                    <span
                      className={`text-[8px] font-sora font-black px-1.5 py-0.2 rounded-full uppercase ${
                        isSelected
                          ? "bg-brand-magenta text-white"
                          : "bg-pink-100 text-brand-magenta"
                      }`}
                    >
                      Hoy
                    </span>
                  )}
                </div>

                <div
                  className={`text-2xl font-sora font-black tracking-tight ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {day.dayNumber}
                </div>
              </div>

              {/* Event Indicators */}
              <div className="space-y-1 pt-1 border-t border-gray-100/20">
                {day.postsCount > 0 && (
                  <div
                    className={`inline-flex items-center justify-center gap-1 text-[10px] font-sora font-bold px-2 py-0.5 rounded-full w-full ${
                      isSelected
                        ? "bg-pink-500/30 text-pink-200 border border-pink-400/30"
                        : "bg-pink-50 text-brand-magenta border border-pink-100"
                    }`}
                  >
                    <Film className="w-2.5 h-2.5 shrink-0" />
                    <span>
                      {day.postsCount} {day.postsCount === 1 ? "post" : "posts"}
                    </span>
                  </div>
                )}

                {day.productionsCount > 0 && (
                  <div
                    className={`inline-flex items-center justify-center gap-1 text-[10px] font-sora font-bold px-2 py-0.5 rounded-full w-full ${
                      isSelected
                        ? "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                        : "bg-blue-50 text-brand-blue border border-blue-100"
                    }`}
                  >
                    <Clapperboard className="w-2.5 h-2.5 shrink-0" />
                    <span>
                      {day.productionsCount} {day.productionsCount === 1 ? "rodaje" : "rodajes"}
                    </span>
                  </div>
                )}

                {!hasActivity && (
                  <span
                    className={`text-[10px] font-medium block truncate ${
                      isSelected ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    Despejado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

