import { Calendar, Clock, MapPin, Lock, FileText, Loader2, Check, Info } from "lucide-react";
import AutoLinkedText from "@/components/common/AutoLinkedText";
import BookingReceiptDropzone from "./BookingReceiptDropzone";

/**
 * BookingStandardFields
 * Campos de reserva para modo estándar (sin propuesta de agencia).
 * Permite seleccionar fecha, horario, locación acordada, brief y comprobante si el pago está pendiente.
 */
export default function BookingStandardFields({
  pagoAcreditado = false,
  esExtraSession = false,
  precioExtra = 0,
  esSegundoTramo = false,
  valorAbonoRegular = 0,
  esDosPagos = false,
  minDateStr = "",
  fecha = "",
  onDateChange,
  hora = "",
  setHora,
  shifts = [],
  locacion = "Locación acordada",
  notasBrief = "",
  fileInputRef,
  uploadingReceipt = false,
  uploadStats = null,
  comprobanteUrl = null,
  pendingReceiptFile = null,
  onReceiptFileChange,
  isSubmitting = false,
  isBusy = false
}) {
  return (
    <div className="space-y-4">
      {/* Banner de pre-reserva si el pago aún no está acreditado */}
      {!pagoAcreditado && (
        <div className="p-3.5 rounded-2xl space-y-2 text-left border bg-blue-50/80 border-blue-200">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5 text-blue-950">
              <span className="font-sora font-bold block text-[11px] sm:text-xs">
                {esExtraSession
                  ? "Pre-Reserva de Sesión Extra con Comprobante"
                  : "Pre-Reserva con Comprobante"}
              </span>
              <p className="text-[11px] leading-snug text-blue-800">
                {esExtraSession
                  ? `Para apartar tu fecha en agenda, adjunta el comprobante de transferencia por el valor de tu sesión extra ($${Number(
                      precioExtra || 0
                    ).toLocaleString()}).`
                  : esSegundoTramo
                  ? valorAbonoRegular > 0
                    ? `Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu segundo abono del mes ($${Number(
                        valorAbonoRegular
                      ).toLocaleString()}).`
                    : "Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu segundo abono del mes."
                  : valorAbonoRegular > 0
                  ? `Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu ${
                      esDosPagos ? "primer abono del mes" : "ciclo"
                    } ($${Number(valorAbonoRegular).toLocaleString()}).`
                  : "Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu ciclo."}
              </p>
            </div>
          </div>

          <BookingReceiptDropzone
            fileInputRef={fileInputRef}
            uploading={uploadingReceipt}
            uploadStats={uploadStats}
            comprobanteUrl={comprobanteUrl}
            pendingReceiptFile={pendingReceiptFile}
            onFileChange={onReceiptFileChange}
            isRequired={true}
            disabled={isBusy}
          />
        </div>
      )}

      {/* Selector de Fecha y Turno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-blue" />
            <span>Fecha del Rodaje</span>
            <span className="text-[#ef18d6]">*</span>
          </label>
          <input
            type="date"
            min={minDateStr}
            required
            value={fecha}
            onChange={onDateChange}
            className="w-full text-xs sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
          />
          <p className="text-[10px] text-gray-400 font-inter mt-1">
            Lun a Vie con mín. 3 días hábiles de anticipación.
          </p>
        </div>

        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            <span>Turno de Grabación</span>
            <span className="text-[#ef18d6]">*</span>
          </label>
          <select
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full text-xs sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer font-medium"
          >
            {shifts.map((shift) => (
              <option key={shift.value} value={shift.value}>
                {shift.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Locación */}
      <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-sora font-bold text-gray-500 uppercase tracking-wider">
              Locación del Rodaje
            </span>
            <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Fijada por agencia
            </span>
          </div>
          <p className="text-xs font-inter font-medium text-gray-800 mt-0.5 leading-snug">
            {locacion}
          </p>
        </div>
      </div>

      {/* Requerimientos */}
      <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
        <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-sora font-bold text-gray-500 uppercase tracking-wider">
              Requerimientos & Brief de Grabación
            </span>
            <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Fijado por agencia
            </span>
          </div>
          <div className="text-xs font-inter text-gray-700 mt-0.5 leading-relaxed whitespace-pre-line">
            {notasBrief ? (
              <AutoLinkedText text={notasBrief} />
            ) : (
              <span className="text-gray-400 italic">
                Sin requerimientos o notas adicionales registradas por la agencia.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botón CTA Estándar */}
      <div className="pt-1.5">
        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploadingReceipt ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Subiendo Comprobante...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando Reserva...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Confirmar Fecha de Grabación</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
