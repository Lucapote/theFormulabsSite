import { Calendar, MapPin, FileText } from "lucide-react";
import AutoLinkedText from "@/components/common/AutoLinkedText";

/**
 * CreateProductionLogisticsFields
 * Subcomponente para la fecha de reserva y logística de rodaje en CreateProductionModal.
 */
export default function CreateProductionLogisticsFields({ formData, setFormData, cliente }) {
  return (
    <>
      {/* BLOQUE B — Fecha y Agendamiento */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
        <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
          B. Fecha y Modalidad de Reserva
        </span>

        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
          <input
            type="checkbox"
            id="toggle-proponer-fecha"
            checked={formData.proponerFecha}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                proponerFecha: e.target.checked
              }))
            }
            className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
          />
          <label
            htmlFor="toggle-proponer-fecha"
            className="text-xs font-sora font-semibold text-gray-800 cursor-pointer select-none"
          >
            Proponer fecha de inmediato desde la agencia
          </label>
        </div>

        {formData.proponerFecha ? (
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora Propuesta
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_produccion}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha_produccion: e.target.value }))}
              className="w-full h-10 px-3 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
            />
            <p className="text-[11px] text-sky-800 bg-sky-50 border border-sky-200 p-2 rounded-lg leading-relaxed">
              La sesión quedará en estado <strong>Fecha Propuesta</strong>. El cliente podrá confirmar este horario o ajustarlo desde su enlace público.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-gray-500 leading-relaxed">
            La sesión se creará en estado <strong>Pendiente de agendamiento</strong>. Se generará un enlace de auto-reserva para que el cliente elija el día y turno que prefiera.
          </p>
        )}
      </div>

      {/* BLOQUE C — Logística y Notas */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
        <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
          C. Logística de Rodaje
        </span>

        <div>
          <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección
          </label>
          <input
            type="text"
            placeholder={cliente?.locacion_default || "Instalaciones del cliente / Dirección de rodaje"}
            value={formData.locacion}
            onChange={(e) => setFormData((prev) => ({ ...prev, locacion: e.target.value }))}
            className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
          />
        </div>

        <div>
          <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" /> Brief Inicial o Notas
          </label>
          <textarea
            rows={2}
            placeholder="Objetivos, guiones o requerimientos para este rodaje extra..."
            value={formData.notas_brief}
            onChange={(e) => setFormData((prev) => ({ ...prev, notas_brief: e.target.value }))}
            className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0] resize-none"
          />
          {Boolean(formData.notas_brief) && (
            <div className="pt-1.5">
              <AutoLinkedText text={formData.notas_brief} onlyLinks className="flex flex-wrap gap-1" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

