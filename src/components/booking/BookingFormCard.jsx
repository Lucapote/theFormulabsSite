import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2,
  Check,
  Video,
  Info,
  Sparkles,
  Upload,
  FileCheck2,
  AlertTriangle
} from "lucide-react";
import {
  getRecordingShifts,
  formatHour12,
  getSessionTypeInfo,
  getMinBusinessBookingDate,
  formatLocalDateToYMD,
  isSessionPaymentSatisfied
} from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { formatBytes } from "@/utils/mediaCompressor";
import ProductionSlaWarningDialog from "./ProductionSlaWarningDialog";

export default function BookingFormCard({
  initialData = {},
  cliente = null,
  ciclo = null,
  onSubmit,
  isSubmitting = false,
  tipo = "organica",
  duracionHoras = null,
  comprobanteSubidoUrl = null,
  onComprobanteUploaded = null
}) {
  const minDateStr = useMemo(() => formatLocalDateToYMD(getMinBusinessBookingDate(new Date(), 3)), []);
  const [showSlaDialog, setShowSlaDialog] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [localReceiptUrl, setLocalReceiptUrl] = useState(comprobanteSubidoUrl || "");
  const [receiptSizeInfo, setReceiptSizeInfo] = useState(null);
  const receiptInputRef = useRef(null);

  const isPropuestaAgencia = initialData?.estado === "fecha_propuesta";
  const paymentCheck = useMemo(
    () => isSessionPaymentSatisfied(initialData, ciclo || initialData?.ciclo, cliente || initialData?.cliente),
    [initialData, ciclo, cliente]
  );
  const pagoAcreditado = paymentCheck.pagoAcreditado;
  const activeComprobanteUrl = comprobanteSubidoUrl || localReceiptUrl || "";
  const isModoPreReserva = !pagoAcreditado && Boolean(activeComprobanteUrl);

  const typeInfo = useMemo(() => getSessionTypeInfo(tipo, duracionHoras), [tipo, duracionHoras]);
  const sessionHours = typeInfo.hours;

  const shifts = useMemo(() => {
    const list = getRecordingShifts(sessionHours);
    const initialHour = initialData.fecha_produccion
      ? new Date(initialData.fecha_produccion).toTimeString().slice(0, 5)
      : null;
    if (initialHour && !list.some((s) => s.value === initialHour)) {
      const hNum = parseInt(initialHour.split(":")[0], 10);
      if (!isNaN(hNum)) {
        const endH = hNum + sessionHours;
        const customShift = {
          value: initialHour,
          label: `${formatHour12(hNum)} - ${formatHour12(endH)}`,
          startHour: hNum,
          endHour: endH
        };
        return [...list, customShift].sort((a, b) => a.value.localeCompare(b.value));
      }
    }
    return list;
  }, [sessionHours, initialData.fecha_produccion]);

  const proposedDateStr = useMemo(() => {
    if (!initialData.fecha_produccion) return "";
    const d = new Date(initialData.fecha_produccion);
    return !isNaN(d.getTime()) ? formatLocalDateToYMD(d) : "";
  }, [initialData.fecha_produccion]);

  const [fecha, setFecha] = useState(() => proposedDateStr);

  const [hora, setHora] = useState(() => {
    const d = initialData.fecha_produccion ? new Date(initialData.fecha_produccion) : null;
    const h = d && !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : "";
    const list = getRecordingShifts(duracionHoras || (tipo === "profesional" ? 6 : 4));
    return list.some((s) => s.value === h) ? h : h || "09:00";
  });

  const [locacion, setLocacion] = useState(
    () =>
      initialData.locacion ||
      cliente?.locacion_default ||
      initialData?.cliente?.locacion_default ||
      "En las instalaciones del cliente"
  );
  const [notasBrief, setNotasBrief] = useState(initialData.notas_brief || "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return setFecha("");

    // Si es la misma fecha que propuso la agencia, permitirla aunque sea < 3 días hábiles
    if (isPropuestaAgencia && val === proposedDateStr) {
      setFecha(val);
      setErrorMsg("");
      return;
    }

    const [y, m, d] = val.split("-").map(Number);
    const selectedDate = new Date(y, m - 1, d, 12, 0, 0);
    const day = selectedDate.getDay();

    if (day === 0 || day === 6) {
      setFecha("");
      toast.error("Las grabaciones se realizan únicamente de Lunes a Viernes.");
      return;
    }

    if (val < minDateStr) {
      setFecha("");
      toast.error("Las reservas por cuenta propia deben realizarse con al menos 3 días hábiles de anticipación.");
      return;
    }

    setFecha(val);
    setErrorMsg("");
  };

  const handleOptionalReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !initialData?.token_reserva) return;

    setUploadingReceipt(true);
    const res = await uploadComprobantePublico({
      file,
      tokenReserva: initialData.token_reserva
    });
    setUploadingReceipt(false);

    if (!res.success) {
      toast.error(res.error || "No se pudo subir el comprobante.");
      return;
    }

    setLocalReceiptUrl(res.publicUrl);
    setReceiptSizeInfo({
      compressedSize: res.compressedSize,
      savedPercentage: res.savedPercentage
    });
    if (onComprobanteUploaded) onComprobanteUploaded(res.publicUrl);
    toast.success("Comprobante comprimido y adjuntado a tu reserva.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fecha) return setErrorMsg("Por favor, selecciona una fecha hábil para el rodaje.");
    if (!hora) return setErrorMsg("Por favor, selecciona un turno para la sesión.");
    if (!locacion.trim()) return setErrorMsg("Por favor, ingresa la dirección o locación de la grabación.");

    setShowSlaDialog(true);
  };

  const handleConfirmSla = () => {
    setShowSlaDialog(false);
    onSubmit({
      fecha_produccion: new Date(`${fecha}T${hora}:00`).toISOString(),
      locacion: locacion.trim(),
      notas_brief: notasBrief.trim(),
      comprobante_url: activeComprobanteUrl || null
    });
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-xl mx-auto font-inter">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-inter text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Banner cuando la Agencia propuso la fecha (Regla de pago hasta 24h antes) */}
        {isPropuestaAgencia && !pagoAcreditado && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-left">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <span className="font-sora font-bold block">
                  Fecha propuesta por The Formulab
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Puedes confirmar esta propuesta ahora mismo. Recuerda que el pago correspondiente debe realizarse a más tardar <strong>el día anterior (24 horas antes)</strong> a la grabación para mantener el equipo asignado.
                </p>
              </div>
            </div>

            {/* Opción de adjuntar comprobante de una vez */}
            <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between gap-2 flex-wrap">
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleOptionalReceiptUpload}
                className="hidden"
              />
              {activeComprobanteUrl ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-sora font-semibold text-emerald-700">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Comprobante adjunto
                  {receiptSizeInfo?.compressedSize ? ` (${formatBytes(receiptSizeInfo.compressedSize)})` : ""}
                </span>
              ) : (
                <span className="text-[11px] text-amber-800">
                  ¿Ya realizaste el pago? Adjúntalo aquí (opcional hoy):
                </span>
              )}
              <button
                type="button"
                disabled={uploadingReceipt}
                onClick={() => receiptInputRef.current?.click()}
                className="h-7 px-3 rounded-full bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 text-[10px] font-sora font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {uploadingReceipt ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3" />
                )}
                <span>{activeComprobanteUrl ? "Cambiar comprobante" : "Subir Comprobante"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner cuando viene en Modo Pre-Reserva con comprobante recién subido */}
        {isModoPreReserva && !isPropuestaAgencia && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-sora font-semibold">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Comprobante cargado • Modo Pre-Reserva habilitado</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
              En validación
            </span>
          </div>
        )}

        {/* Banner de Tipo de Sesión y Horas de Cobertura */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-sora">
          <div className="flex items-center gap-2 text-brand-blue font-semibold">
            <Video className="w-4 h-4" />
            <span>Tipo de Sesión</span>
          </div>
          <span className="font-bold text-gray-900">
            {typeInfo.title} ({typeInfo.hours} horas)
          </span>
        </div>

        {/* 1. Fecha y Turno de Grabación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>Fecha del Rodaje</span>
              <span className="text-pink-500">*</span>
            </label>
            <input
              type="date"
              min={isPropuestaAgencia && proposedDateStr && proposedDateStr < minDateStr ? proposedDateStr : minDateStr}
              required
              value={fecha}
              onChange={handleDateChange}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
            />
            <p className="text-[11px] text-gray-400 font-inter mt-1.5">
              {isPropuestaAgencia
                ? "Fecha propuesta por la agencia (o elige otra con 3 días hábiles)."
                : "Lun a Vie con mín. 3 días hábiles de anticipación."}
            </p>
          </div>

          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>Turno de Grabación</span>
              <span className="text-pink-500">*</span>
            </label>
            <select
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer font-medium"
            >
              {shifts.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Locación */}
        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Locación / Dirección</span>
            <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej. En nuestro local (Av. Bonampak 123) / Estudio The Formulab"
            value={locacion}
            onChange={(e) => setLocacion(e.target.value)}
            className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
          <p className="text-[11px] text-gray-500 font-inter mt-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span>Sujeto a disponibilidad del espacio en el local de la marca.</span>
          </p>
        </div>

        {/* 3. Notas y Brief */}
        <div>
          <label className="text-xs font-sora font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>Notas o Requerimientos de Grabación</span>
          </label>
          <textarea
            rows={3}
            placeholder="Prendas a utilizar, platos o productos listos, personal disponible para hablar en cámara, ideas clave..."
            value={notasBrief}
            onChange={(e) => setNotasBrief(e.target.value)}
            className="w-full text-base sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Botón CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando Reserva...</span>
              </>
            ) : isModoPreReserva ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solicitar Pre-Reserva (Con Comprobante)</span>
              </>
            ) : isPropuestaAgencia ? (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar Fecha Propuesta</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar Fecha de Grabación</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Clínico de Políticas SLA y Términos Operativos */}
        <ProductionSlaWarningDialog
          isOpen={showSlaDialog}
          onConfirm={handleConfirmSla}
          onCancel={() => setShowSlaDialog(false)}
          tipoProduccion={tipo}
          fechaSeleccionada={fecha}
          isSubmitting={isSubmitting}
          duracionHoras={sessionHours}
        />
      </form>
    </div>
  );
}
