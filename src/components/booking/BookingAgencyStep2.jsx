import { Calendar, Check, MapPin, Lock, FileText, Loader2, ArrowLeft } from "lucide-react";
import AutoLinkedText from "@/components/common/AutoLinkedText";

/**
 * BookingAgencyStep2
 * Paso 2 del flujo de reserva para propuesta de agencia.
 * Muestra el resumen de lo acordado, locación y requerimientos fijados por la agencia,
 * y el botón de confirmación definitiva de rodaje.
 */
export default function BookingAgencyStep2({
  fecha,
  hora,
  shifts = [],
  sessionHours = 4,
  formatProposedDateLong,
  formatTimeRange,
  locacion = "Locación acordada",
  notasBrief = "",
  onBackToStep1,
  isSubmitting = false,
  isBusy = false
}) {
  return (
    <div className="space-y-4">
      {/* Resumen de lo acordado en Paso 1 */}
      <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              FECHA ACORDADA
            </span>
            <span className="text-xs font-sora font-bold text-gray-900 truncate block">
              {formatProposedDateLong(fecha)} •{" "}
              {shifts.find((s) => s.value === hora)?.label ||
                formatTimeRange(hora, sessionHours)}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sora font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Comprobante cargado</span>
        </span>
      </div>

      <div className="space-y-3">
        {/* Ficha 1: Locación del Rodaje */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-sora font-bold text-gray-400 uppercase tracking-wider">
                LOCACIÓN DEL RODAJE
              </span>
              <span className="text-[10px] font-mono text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Fijado por agencia
              </span>
            </div>
            <p className="text-xs font-inter font-bold text-gray-900 leading-snug">
              {locacion}
            </p>
          </div>
        </div>

        {/* Ficha 2: Requerimientos & Brief de Grabación */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-sora font-bold text-gray-400 uppercase tracking-wider">
                REQUERIMIENTOS & BRIEF DE GRABACIÓN
              </span>
              <span className="text-[10px] font-mono text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Fijado por agencia
              </span>
            </div>
            <div className="text-xs font-inter text-gray-700 leading-relaxed whitespace-pre-line mt-1">
              {notasBrief ? (
                <AutoLinkedText text={notasBrief} />
              ) : (
                <span className="text-gray-400 italic">
                  Sin notas o requerimientos adicionales fijados por la agencia para esta sesión.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción Paso 2 */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmando Reserva Definitiva...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Confirmar Reserva Definitiva</span>
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToStep1}
            disabled={isBusy}
            className="text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer transition-colors py-1 active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Paso 1 (Comprobante)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
