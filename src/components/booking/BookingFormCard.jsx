import { useState, useEffect, useMemo, useRef } from "react";
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
  AlertTriangle,
  X,
  Lock
} from "lucide-react";
import {
  getRecordingShifts,
  formatTimeRange,
  getSessionTypeInfo,
  getMinBusinessBookingDate,
  formatLocalDateToYMD,
  isSessionPaymentSatisfied
} from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { formatBytes } from "@/utils/mediaCompressor";
import { MESES_ANIO } from "@/utils/formatters";
import BookingHeader from "./BookingHeader";
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
  const [pendingReceiptFile, setPendingReceiptFile] = useState(null);
  const esDosPagos =
    cliente?.esquema_pago === "dos_pagos" ||
    initialData?.cliente?.esquema_pago === "dos_pagos";
  const totalSesiones = Math.max(
    1,
    cliente?.producciones_por_mes || initialData?.cliente?.producciones_por_mes || 1
  );
  const sesionesPrimerPago =
    cliente?.sesiones_primer_pago ||
    initialData?.cliente?.sesiones_primer_pago ||
    Math.max(1, Math.floor(totalSesiones / 2));
  const esSegundoTramo =
    esDosPagos && totalSesiones >= 2 && (initialData?.numero_sesion || 1) > sesionesPrimerPago;

  const esExtraSession =
    Boolean(initialData?.precio_extra) ||
    (initialData?.numero_sesion || 1) > totalSesiones ||
    Boolean(initialData?.nombre && initialData.nombre.toLowerCase().includes("extra"));

  const precioExtra = initialData?.precio_extra;
  const mesCiclo = ciclo?.mes || initialData?.ciclo?.mes;
  const mesNombre = mesCiclo && MESES_ANIO[mesCiclo - 1] ? MESES_ANIO[mesCiclo - 1] : "Sesión";

  const existingReceipt =
    comprobanteSubidoUrl ||
    initialData?.comprobante_url ||
    (esExtraSession
      ? initialData?.comprobante_url || ""
      : esSegundoTramo
      ? ciclo?.comprobante_2_url || initialData?.ciclo?.comprobante_2_url || ""
      : ciclo?.comprobante_url || initialData?.ciclo?.comprobante_url || "");
  const [localReceiptUrl, setLocalReceiptUrl] = useState(existingReceipt);
  const receiptInputRef = useRef(null);

  useEffect(() => {
    setLocalReceiptUrl(existingReceipt);
  }, [existingReceipt]);

  const isPropuestaAgencia = initialData?.estado === "fecha_propuesta";
  const paymentCheck = useMemo(
    () => isSessionPaymentSatisfied(initialData, ciclo || initialData?.ciclo, cliente || initialData?.cliente),
    [initialData, ciclo, cliente]
  );
  const pagoAcreditado = paymentCheck.pagoAcreditado;
  const hasReceiptAttached = Boolean(pendingReceiptFile || localReceiptUrl);
  const isModoPreReserva = !pagoAcreditado && hasReceiptAttached;

  const typeInfo = useMemo(() => getSessionTypeInfo(tipo, duracionHoras), [tipo, duracionHoras]);
  const sessionHours = typeInfo.hours;

  const shifts = useMemo(() => {
    const list = getRecordingShifts(sessionHours);
    const initialHour = initialData.fecha_produccion
      ? new Date(initialData.fecha_produccion).toTimeString().slice(0, 5)
      : null;
    if (initialHour && !list.some((s) => s.value === initialHour)) {
      const customShift = {
        value: initialHour,
        label: formatTimeRange(initialHour, sessionHours),
        startHour: parseInt(initialHour.split(":")[0], 10),
        endHour: parseInt(initialHour.split(":")[0], 10) + sessionHours
      };
      return [customShift, ...list].sort((a, b) => a.value.localeCompare(b.value));
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

  const locacion =
    initialData.locacion ||
    cliente?.locacion_default ||
    initialData?.cliente?.locacion_default ||
    "En las instalaciones del cliente";
  const notasBrief = initialData.notas_brief || "";
  const [errorMsg, setErrorMsg] = useState("");

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return setFecha("");

    // Si es la misma fecha propuesta por la agencia, permitirla aunque sea < 3 días hábiles
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

  // Selección local del comprobante en memoria (NO sube al bucket hasta confirmar)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no soportado. Por favor sube una imagen (PNG, JPG, WebP) o PDF.");
      if (receiptInputRef.current) receiptInputRef.current.value = "";
      return;
    }

    // Validación de tamaño (máximo 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 15MB.");
      if (receiptInputRef.current) receiptInputRef.current.value = "";
      return;
    }

    // Guardar en memoria (reemplazando cualquier archivo previo)
    setPendingReceiptFile(file);
    setLocalReceiptUrl("");
    setErrorMsg("");
    toast.info("Comprobante seleccionado. Se adjuntará al confirmar tu reserva.");
  };

  const handleRemoveReceipt = () => {
    setPendingReceiptFile(null);
    setLocalReceiptUrl("");
    if (receiptInputRef.current) receiptInputRef.current.value = "";
    toast.info("Comprobante removido.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fecha) return setErrorMsg("Por favor, selecciona una fecha hábil para el rodaje.");
    if (!hora) return setErrorMsg("Por favor, selecciona un turno para la sesión.");

    if (!pagoAcreditado && !hasReceiptAttached) {
      setErrorMsg(
        esExtraSession
          ? "Para confirmar esta fecha de rodaje es necesario adjuntar el comprobante de pago de tu sesión extra."
          : "Para confirmar esta fecha de rodaje es necesario adjuntar el comprobante de pago de tu ciclo."
      );
      receiptInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setShowSlaDialog(true);
  };

  const handleConfirmSla = async () => {
    setShowSlaDialog(false);
    let finalComprobanteUrl = localReceiptUrl || null;

    // Si hay un comprobante seleccionado en memoria, subirlo ahora a Cloudflare R2
    if (pendingReceiptFile) {
      setUploadingReceipt(true);
      const loadingToast = toast.loading("Subiendo comprobante al almacenamiento seguro...");
      const res = await uploadComprobantePublico({
        file: pendingReceiptFile,
        tokenReserva: initialData.token_reserva
      });
      toast.dismiss(loadingToast);
      setUploadingReceipt(false);

      if (!res.success) {
        toast.error(res.error || "No se pudo subir el comprobante. Por favor intenta de nuevo.");
        return;
      }

      finalComprobanteUrl = res.publicUrl;
      setLocalReceiptUrl(res.publicUrl);
      setPendingReceiptFile(null);
      if (onComprobanteUploaded) onComprobanteUploaded(res.publicUrl);
    }

    onSubmit({
      fecha_produccion: new Date(`${fecha}T${hora}:00`).toISOString(),
      locacion: locacion,
      notas_brief: notasBrief,
      comprobante_url: finalComprobanteUrl
    });
  };

  const isBusy = isSubmitting || uploadingReceipt;

  return (
    <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden max-w-xl mx-auto font-inter text-left">
      <BookingHeader
        sessionTitle={
          initialData?.nombre ||
          (esExtraSession
            ? `${mesNombre} Extra`
            : `Sesión #${initialData?.numero_sesion || 1}`)
        }
        numeroSesion={initialData?.numero_sesion || 1}
        clienteNombre={cliente?.nombre || initialData?.cliente?.nombre || ""}
        empresa={cliente?.empresa || initialData?.cliente?.empresa || ""}
        tipo={tipo}
        duracionHoras={duracionHoras}
        isExtraSession={esExtraSession}
        precioExtra={precioExtra}
      />

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-inter text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* BANNER ÚNICO DE COMPROBANTE Y PRE-RESERVA (Exclusión mutua absoluta) */}
        {!pagoAcreditado && (
          <div
            className={`p-3.5 rounded-2xl space-y-2 text-left border ${
              isPropuestaAgencia && !esExtraSession
                ? "bg-amber-50/80 border-amber-200"
                : "bg-blue-50/80 border-blue-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isPropuestaAgencia && !esExtraSession ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
              )}
              <div
                className={`text-xs space-y-0.5 ${
                  isPropuestaAgencia && !esExtraSession ? "text-amber-950" : "text-blue-950"
                }`}
              >
                <span className="font-sora font-bold block text-[11px] sm:text-xs">
                  {esExtraSession
                    ? isPropuestaAgencia
                      ? "Fecha propuesta para Sesión Extra"
                      : "Pre-Reserva de Sesión Extra con Comprobante"
                    : isPropuestaAgencia
                    ? "Fecha propuesta por The Formulab"
                    : "Pre-Reserva con Comprobante"}
                </span>
                <p
                  className={`text-[11px] leading-snug ${
                    isPropuestaAgencia && !esExtraSession ? "text-amber-800" : "text-blue-800"
                  }`}
                >
                  {esExtraSession
                    ? isPropuestaAgencia
                      ? `The Formulab ha propuesto esta fecha. Para confirmarla en agenda, adjunta el comprobante de transferencia por el valor de tu sesión extra ($${Number(
                          precioExtra || 0
                        ).toLocaleString()}).`
                      : `Para apartar tu fecha en agenda, adjunta el comprobante de transferencia por el valor de tu sesión extra ($${Number(
                          precioExtra || 0
                        ).toLocaleString()}).`
                    : isPropuestaAgencia
                    ? "The Formulab ha propuesto esta fecha. Para confirmarla y asegurar al crew en agenda, adjunta tu comprobante de pago abajo."
                    : esSegundoTramo
                    ? "Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu segundo abono del mes."
                    : "Para apartar tu fecha en agenda, adjunta el comprobante de pago de tu ciclo."}
                </p>
              </div>
            </div>

            {/* Input oculto único para adjuntar archivo */}
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Visualización del archivo o botón para subirlo */}
            <div
              className={`pt-1.5 border-t ${
                isPropuestaAgencia && !esExtraSession
                  ? "border-amber-200/60"
                  : "border-blue-200/60"
              }`}
            >
              {pendingReceiptFile ? (
                <div
                  className={`flex items-center justify-between gap-2 bg-white/90 rounded-lg p-2 text-xs border ${
                    isPropuestaAgencia && !esExtraSession ? "border-amber-300" : "border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-sora font-semibold text-gray-800 text-[11px] truncate max-w-[200px] sm:max-w-[260px]">
                        {pendingReceiptFile.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-inter">
                        {formatBytes(pendingReceiptFile.size)} • Listo para adjuntar
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="h-6 px-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-sora font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Quitar</span>
                  </button>
                </div>
              ) : localReceiptUrl ? (
                <div className="flex items-center justify-between gap-2 bg-white/90 border border-emerald-300 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-sora font-semibold text-emerald-800 text-[11px]">
                      Comprobante registrado • En revisión
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="h-6 px-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-sora font-semibold cursor-pointer transition-colors"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="h-6 px-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-sora font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-sora font-semibold flex items-center gap-1 ${
                      isPropuestaAgencia && !esExtraSession ? "text-amber-900" : "text-blue-900"
                    }`}
                  >
                    <span className="text-rose-600">*</span>
                    {esExtraSession ? "Comprobante de sesión extra:" : "Comprobante de pago requerido:"}
                  </span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => receiptInputRef.current?.click()}
                    className="h-7 px-3 rounded-full text-[11px] font-sora font-bold inline-flex items-center gap-1.5 bg-[#188ff0] hover:bg-blue-600 text-white shadow-xs cursor-pointer transition-colors active:scale-[0.98]"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir Comprobante *</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1. Fecha y Turno de Grabación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
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
              className="w-full text-xs sm:text-sm font-inter bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer"
            />
            <p className="text-[10px] text-gray-400 font-inter mt-1">
              {isPropuestaAgencia
                ? "Fecha propuesta por la agencia (o selecciona otra con 3 días hábiles)."
                : "Lun a Vie con mín. 3 días hábiles de anticipación."}
            </p>
          </div>

          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              <span>Turno de Grabación</span>
              <span className="text-pink-500">*</span>
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

        {/* 2. Locación (No editable por el cliente en esta etapa) */}
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

        {/* 3. Notas y Brief de Grabación (No editable por el cliente en esta etapa) */}
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
            <p className="text-xs font-inter text-gray-700 mt-0.5 leading-relaxed whitespace-pre-line">
              {notasBrief ? (
                notasBrief
              ) : (
                <span className="text-gray-400 italic">
                  Sin requerimientos o notas adicionales registradas por la agencia.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Botón CTA de Confirmación */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-3 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
            ) : isModoPreReserva ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solicitar Reserva con Comprobante</span>
              </>
            ) : isPropuestaAgencia ? (
              pagoAcreditado ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirmar Fecha Propuesta</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirmar Fecha Propuesta con Comprobante</span>
                </>
              )
            ) : !pagoAcreditado ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solicitar Reserva con Comprobante</span>
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
          isSubmitting={isBusy}
          duracionHoras={sessionHours}
        />
      </form>
    </div>
  );
}
