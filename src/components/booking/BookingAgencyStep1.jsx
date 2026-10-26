import { Clock, ChevronDown, ChevronUp, ArrowRight, Loader2 } from "lucide-react";
import BookingBankDetailsCard from "./BookingBankDetailsCard";
import BookingReceiptDropzone from "./BookingReceiptDropzone";

/**
 * BookingAgencyStep1
 * Paso 1 del flujo de reserva para propuesta de agencia.
 * Muestra la fecha y turno apartados, opción de cambio alternativo,
 * ficha bancaria oficial y dropzone de comprobante.
 */
export default function BookingAgencyStep1({
  fecha,
  hora,
  shifts = [],
  sessionHours = 4,
  typeInfo = {},
  proposedDateStr,
  formatProposedDateLong,
  formatTimeRange,
  showAlternateDate,
  setShowAlternateDate,
  minDateStr,
  onDateChange,
  onTimeChange,
  clientName,
  montoAbono,
  abonoBadgeLabel,
  fileInputRef,
  uploadingReceipt,
  uploadStats,
  comprobanteUrl,
  pendingReceiptFile,
  onReceiptFileChange,
  onProceedToStep2,
  isBusy = false
}) {
  return (
    <div className="space-y-4">
      {/* Tarjeta de Fecha Apartada por The Formulab */}
      <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-blue-50/80 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sora font-bold bg-blue-100/90 text-brand-blue border border-blue-200">
            Fecha Reservada por la Agencia
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
            PROPUESTA DE RODAJE
          </span>
        </div>

        <div className="space-y-1 mb-2.5">
          <h2 className="text-lg sm:text-xl font-sora font-extrabold text-gray-900 tracking-tight">
            {formatProposedDateLong(fecha || proposedDateStr)}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-sky-800 bg-white border border-sky-200 px-3 py-1 rounded-full shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>
                {shifts.find((s) => s.value === hora)?.label ||
                  formatTimeRange(hora, sessionHours)}
              </span>
            </span>
            {typeInfo?.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50/80 border border-pink-200 text-[#ef18d6] text-[11px] font-sora font-semibold">
                <span>{typeInfo.badge}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs font-inter text-gray-600 leading-relaxed">
          The Formulab ha apartado este horario exclusivo para tu producción. Realiza tu anticipo y adjunta tu comprobante a continuación para confirmar definitivamente al crew de filmación.
        </p>

        {/* Toggle para cambiar fecha si no le acomoda al cliente */}
        <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAlternateDate(!showAlternateDate)}
            className="text-xs font-sora font-semibold text-brand-blue hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer transition-colors active:scale-[0.98]"
          >
            <span>
              {showAlternateDate
                ? "Ocultar selector de fecha"
                : "¿Necesitas otra fecha? Elegir fecha alternativa"}
            </span>
            {showAlternateDate ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showAlternateDate && (
          <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/80 p-3 rounded-xl border border-blue-100">
            <div>
              <label className="text-[11px] font-sora font-semibold text-gray-700 mb-1 block">
                Seleccionar Otra Fecha
              </label>
              <input
                type="date"
                min={minDateStr}
                value={fecha}
                onChange={onDateChange}
                className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Mín. 3 días hábiles
              </span>
            </div>
            <div>
              <label className="text-[11px] font-sora font-semibold text-gray-700 mb-1 block">
                Turno de Grabación
              </label>
              <select
                value={hora}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer font-medium"
              >
                {shifts.map((shift) => (
                  <option key={shift.value} value={shift.value}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Ficha Bancaria de Transferencia */}
      <BookingBankDetailsCard
        clientName={clientName}
        montoAbono={montoAbono}
        abonoBadgeLabel={abonoBadgeLabel}
      />

      {/* Dropzone de Comprobante Requerido */}
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

      {/* Botón de Transición a Paso 2 */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={onProceedToStep2}
          className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploadingReceipt ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Subiendo comprobante a almacenamiento seguro...</span>
            </>
          ) : (
            <>
              <span>Continuar a Especificaciones (Paso 2)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
