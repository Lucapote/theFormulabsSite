import {
  Video as VideoIcon,
  Calendar as CalendarIcon,
  Clock,
  Layers
} from "lucide-react";
import { POST_STATUS_LIST, getPostStatusMeta } from "@/utils/postStatusHelpers";

/**
 * PostModalScheduleFields
 * Campos de formato, fecha, hora y estado de la publicación.
 */
export default function PostModalScheduleFields({
  tipoPost,
  onFormatChange,
  fechaProgramada,
  onFechaChange,
  horaProgramada,
  onHoraChange,
  estado,
  onEstadoChange
}) {
  return (
    <div className="space-y-4">
      {/* Selector de Formato */}
      <div>
        <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-2">
          Formato de Publicación *
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onFormatChange("reel")}
            className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98] ${
              tipoPost === "reel"
                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <VideoIcon
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                tipoPost === "reel" ? "text-brand-magenta" : "text-gray-400"
              }`}
            />
            <span className="truncate">Reel (1 Video)</span>
          </button>

          <button
            type="button"
            onClick={() => onFormatChange("carrousel")}
            className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border font-sora text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98] ${
              tipoPost === "carrousel"
                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Layers
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                tipoPost === "carrousel" ? "text-brand-blue" : "text-gray-400"
              }`}
            />
            <span className="truncate">Carrusel (Múltiple)</span>
          </button>
        </div>
      </div>

      {/* Fecha, Hora y Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" /> Fecha Programada *
          </label>
          <input
            type="date"
            required
            value={fechaProgramada}
            onChange={(e) => onFechaChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-gray-900 font-medium bg-gray-50/50 transition-all cursor-pointer font-inter"
          />
        </div>

        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue" /> Hora Programada *
          </label>
          <input
            type="time"
            required
            value={horaProgramada}
            onChange={(e) => onHoraChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-gray-900 font-medium bg-gray-50/50 transition-all cursor-pointer font-inter"
          />
        </div>

        <div>
          <label className="block text-xs font-sora font-bold uppercase text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${getPostStatusMeta(estado).dotClass}`} />
            Estado Publicación
          </label>
          <select
            value={estado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-xs font-sora font-bold text-gray-900 bg-gray-50/50 cursor-pointer transition-all"
          >
            {POST_STATUS_LIST.map((st) => (
              <option key={st.key} value={st.key}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

