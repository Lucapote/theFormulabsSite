import { Calendar, Clock, Activity, AlertTriangle, Info, XCircle, CheckCircle2, FileCheck2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const STATUS_CONFIG = {
  pendiente_agendamiento: { label: "Pendiente de agendamiento", color: "bg-amber-500" },
  fecha_propuesta: {
    label: "Fecha propuesta por agencia (Requiere comprobante)",
    color: "bg-sky-500"
  },
  pre_reservada: {
    label: "Pre-reservada por cliente (Validando comprobante)",
    color: "bg-indigo-500"
  },
  agendada: { label: "Agendada (Fecha confirmada)", color: "bg-blue-500" },
  rodaje_completado: { label: "Rodaje completado", color: "bg-purple-500" },
  en_edicion: { label: "En edición / post-producción", color: "bg-brand-magenta" },
  finalizada: { label: "Finalizada y entregada", color: "bg-emerald-500" }
};

/**
 * ProductionScheduleFields
 * Manages schedule status, date/time, hours, and payment risk alerts.
 */
export default function ProductionScheduleFields({
  formData,
  setFormData,
  defaultSuggestedName,
  riskInfo,
  associatedReceiptUrl,
  esSegundoTramo,
  loading,
  handleCancelDate
}) {
  return (
    <div className="space-y-4">
      {/* ALERTA OPERATIVA: Menos de 24h sin pago acreditado */}
      {riskInfo.enRiesgo && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-rose-950 space-y-0.5">
              <span className="font-sora font-bold block">
                Alerta Operativa: Rodaje en menos de 24h sin pago acreditado
              </span>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                El cliente aún no tiene validado el pago correspondiente a esta sesión. Puedes liberar el cupo de agenda ahora o mantener la fecha bajo tu autorización.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleCancelDate}
              className="flex-1 h-8 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-sora font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancelar y Liberar Fecha</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setFormData((prev) => ({ ...prev, estado: "agendada" }));
                toast.info("Manteniendo fecha activa. Pulsa Guardar Cambios para confirmar.");
              }}
              className="h-8 px-3 rounded-full bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 text-[11px] font-sora font-semibold inline-flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mantener</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPROBANTE ASOCIADO A ESTE TRAMO (SI EXISTE) */}
      {associatedReceiptUrl && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="w-4 h-4 text-brand-blue shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-sora font-bold text-gray-900 block truncate">
                Comprobante de Pago ({esSegundoTramo ? "2do Abono" : "1er Abono"})
              </span>
              <span className="text-[11px] font-inter text-gray-500 block truncate">
                Registrado en el ciclo mensual
              </span>
            </div>
          </div>
          <a
            href={associatedReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2.5 rounded-md bg-white hover:bg-gray-50 text-brand-blue border border-blue-200 text-[11px] font-sora font-semibold inline-flex items-center gap-1 shrink-0 transition-all active:scale-[0.98]"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Ver Comprobante</span>
          </a>
        </div>
      )}

      {/* BLOQUE A — Cronograma y Estado */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider block">
            A. Cronograma y Estado
          </span>
          {formData.fecha_produccion && (
            <button
              type="button"
              disabled={loading}
              onClick={handleCancelDate}
              className="inline-flex items-center gap-1 text-[11px] font-sora font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer transition-all active:scale-[0.98]"
              title="Elimina la fecha asignada y deja la sesión en pendiente"
            >
              <XCircle className="w-3 h-3" />
              <span>Cancelar Fecha</span>
            </button>
          )}
        </div>

        <div>
          <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 block">
            Nombre de la Sesión
          </label>
          <input
            type="text"
            placeholder={defaultSuggestedName}
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-magenta" /> Estado de la Producción
            </label>
            <span className="flex items-center gap-1.5 text-[11px] font-sora font-semibold text-gray-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  STATUS_CONFIG[formData.estado]?.color || "bg-gray-400"
                }`}
              />
              {STATUS_CONFIG[formData.estado]?.label.split(" ")[0]}
            </span>
          </div>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            className="w-full h-10 px-3 text-xs font-inter bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0] cursor-pointer"
          >
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full min-w-0">
          <div className="sm:col-span-2 min-w-0">
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Fecha y Hora
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_produccion}
              onChange={(e) => {
                const newDateVal = e.target.value;
                const nextEstado =
                  newDateVal && formData.estado === "pendiente_agendamiento"
                    ? "fecha_propuesta"
                    : formData.estado;
                setFormData({
                  ...formData,
                  fecha_produccion: newDateVal,
                  estado: nextEstado
                });
              }}
              className="w-full min-w-0 h-10 px-2.5 sm:px-3 text-xs font-mono bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
            />
          </div>
          <div className="min-w-0">
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" /> Duración
            </label>
            <div className="relative w-full min-w-0">
              <input
                type="number"
                min="1"
                max="24"
                value={formData.duracion_horas}
                onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
                className="w-full min-w-0 h-10 pl-3 pr-8 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 pointer-events-none">
                hrs
              </span>
            </div>
          </div>
        </div>

        {formData.estado === "fecha_propuesta" && (
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span>
              El cliente verá esta fecha propuesta y deberá <strong>adjuntar obligatoriamente su comprobante de pago</strong> para confirmarla en agenda.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

