import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { getLocalDateString } from "@/utils/formatters";

/**
 * Format a YYYY-MM-DD date into a friendly Spanish title
 */
function formatFriendlySpanishDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return `${days[date.getDay()]}, ${d} de ${months[m - 1]} ${y}`;
}

/**
 * Helper to offset date by N days
 */
function offsetDateString(dateStr, offsetDays) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function HomeDateNavigator({
  selectedDate,
  onSelectDate,
  onRefresh,
  loading = false
}) {
  const todayStr = getLocalDateString();
  const yesterdayStr = offsetDateString(todayStr, -1);
  const tomorrowStr = offsetDateString(todayStr, 1);

  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === yesterdayStr;
  const isTomorrow = selectedDate === tomorrowStr;

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-inter">
      {/* Title & Date display */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-brand-magenta font-bold tracking-widest uppercase text-[10px] sm:text-xs font-sora">
          <Sparkles className="w-4 h-4 text-brand-blue" />
          <span>AGENDA DIARIA • MISSION CONTROL</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight capitalize">
            {formatFriendlySpanishDate(selectedDate)}
          </h2>
          {isToday && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sora font-bold uppercase tracking-wider bg-pink-50 text-brand-magenta border border-pink-100 shadow-2xs">
              Día Actual
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons & Date Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Quick pills: Ayer, Hoy, Mañana */}
        <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
          <button
            type="button"
            onClick={() => onSelectDate(yesterdayStr)}
            className={`h-8 px-3 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
              isYesterday
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`h-8 px-4 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
              isToday
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`h-8 px-3 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
              isTomorrow
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mañana
          </button>
        </div>

        {/* Step Prev / Next Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectDate(offsetDateString(selectedDate, -1))}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(offsetDateString(selectedDate, 1))}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Native Calendar Picker Input */}
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-full text-xs font-sora font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Reload button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer disabled:opacity-50"
          title="Recargar agenda del día"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-magenta" : ""}`} />
        </button>
      </div>
    </div>
  );
}

