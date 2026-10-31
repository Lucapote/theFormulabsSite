import { MapPin, FileText, ExternalLink } from "lucide-react";
import AutoLinkedText from "@/components/common/AutoLinkedText";

/**
 * ProductionLogisticsFields
 * Renders location input, map launcher button, and brief/notes field with autolinked URLs.
 */
export default function ProductionLogisticsFields({
  formData,
  setFormData,
  ciclo,
  produccion,
  handleOpenMaps
}) {
  return (
    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3 w-full min-w-0">
      <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
        B. Logística de Grabación
      </span>
      <div>
        <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              ciclo?.cliente?.locacion_default ||
              produccion?.cliente?.locacion_default ||
              "En las instalaciones del cliente / Dirección de rodaje"
            }
            value={formData.locacion}
            onChange={(e) => setFormData({ ...formData, locacion: e.target.value })}
            className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
          />
          {formData.locacion.trim() && (
            <button
              type="button"
              onClick={handleOpenMaps}
              title="Abrir en Google Maps"
              className="h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief y Notas de Rodaje
        </label>
        <textarea
          rows={3}
          placeholder="Objetivos de la sesión, equipo requerido, guiones a rodar..."
          value={formData.notas_brief}
          onChange={(e) => setFormData({ ...formData, notas_brief: e.target.value })}
          className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0] resize-none"
        />
        {Boolean(formData.notas_brief) && (
          <div className="pt-1.5">
            <AutoLinkedText text={formData.notas_brief} onlyLinks className="flex flex-wrap gap-1" />
          </div>
        )}
      </div>
    </div>
  );
}

