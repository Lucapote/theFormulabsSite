import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  getRecordingShifts,
  getSessionTypeInfo,
  getMinBusinessBookingDate,
  formatLocalDateToYMD,
  isSessionPaymentSatisfied
} from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { MESES_ANIO } from "@/utils/formatters";

/**
 * useBookingFormManager
 * Hook reactivo puro para la gestión de estados y mutaciones en BookingFormCard.
 * Cumple con GEMINI.md Regla 4.G y 5 (SRP).
 */
export default function useBookingFormManager({
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
  const isPropuestaAgencia = initialData.estado === "fecha_propuesta";

  const proposedDateObj = initialData.fecha_produccion
    ? new Date(initialData.fecha_produccion)
    : null;

  const proposedDateStr = proposedDateObj
    ? proposedDateObj.toISOString().split("T")[0]
    : "";

  const proposedTimeStr = proposedDateObj
    ? `${String(proposedDateObj.getHours()).padStart(2, "0")}:${String(
        proposedDateObj.getMinutes()
      ).padStart(2, "0")}`
    : "09:00";

  const minDate = useMemo(() => getMinBusinessBookingDate(), []);
  const minDateStr = useMemo(() => formatLocalDateToYMD(minDate), [minDate]);

  const [fecha, setFecha] = useState(
    proposedDateStr ||
      (initialData.fecha_produccion
        ? initialData.fecha_produccion.split("T")[0]
        : minDateStr)
  );

  const [hora, setHora] = useState(proposedTimeStr || "09:00");
  const [locacion] = useState(
    initialData.locacion ||
      cliente?.locacion_frecuente ||
      "Locación acordada con la agencia"
  );
  const [notasBrief] = useState(initialData.notas_brief || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSlaDialog, setShowSlaDialog] = useState(false);

  const receiptInputRef = useRef(null);
  const [pendingReceiptFile, setPendingReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [localReceiptUrl, setLocalReceiptUrl] = useState(comprobanteSubidoUrl || null);
  const [uploadStats, setUploadStats] = useState(null);

  const esExtraSession = Boolean(initialData.tipo === "extra" || initialData.precio_extra);
  const precioExtra = initialData.precio_extra;
  const mesIndex = ciclo?.mes ? Number(ciclo.mes) - 1 : new Date().getMonth();
  const mesNombre = MESES_ANIO[mesIndex] || "Mes Corriente";

  const totalSesiones = Math.max(1, cliente?.producciones_por_mes || 1);
  const sesionesPrimerPago =
    cliente?.sesiones_primer_pago || Math.max(1, Math.floor(totalSesiones / 2));
  const esDosPagos =
    cliente?.esquema_pago === "quincenal" ||
    cliente?.esquema_pago === "dos_pagos" ||
    Boolean(cliente?.dia_corte_pago_2);

  const esSegundoTramo =
    esDosPagos && totalSesiones >= 2 && initialData.numero_sesion > sesionesPrimerPago;

  const paymentCheck = useMemo(
    () => isSessionPaymentSatisfied(initialData, ciclo || initialData?.ciclo, cliente || initialData?.cliente),
    [initialData, ciclo, cliente]
  );
  const pagoAcreditado = paymentCheck.pagoAcreditado;
  const hasReceiptAttached = Boolean(pendingReceiptFile || localReceiptUrl);

  const [currentStep, setCurrentStep] = useState(isPropuestaAgencia ? 1 : 2);
  const [showAlternateDate, setShowAlternateDate] = useState(false);

  const sessionHours = duracionHoras || (tipo === "institucional" ? 6 : 4);
  const shifts = useMemo(() => getRecordingShifts(sessionHours), [sessionHours]);
  const typeInfo = useMemo(() => getSessionTypeInfo(tipo, sessionHours), [tipo, sessionHours]);

  const clientName = cliente?.nombre || initialData?.cliente?.nombre || "Cliente Estimado";
  const displayCompany = cliente?.empresa && cliente.empresa !== clientName ? cliente.empresa : null;

  const montoTotalCiclo = Number(ciclo?.monto_cobrado || cliente?.monto_retainer) || 0;
  const valorAbonoRegular = esDosPagos ? Math.round(montoTotalCiclo / 2) : montoTotalCiclo;
  const valorSesion = esExtraSession
    ? Number(precioExtra || 0)
    : valorAbonoRegular > 0
    ? valorAbonoRegular
    : null;

  const abonoBadgeLabel = esExtraSession
    ? "Sesión Extra"
    : esDosPagos
    ? esSegundoTramo
      ? "2do ABONO (50%)"
      : "1er ABONO (50%)"
    : "TOTAL CICLO";

  const formatProposedDateLong = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFecha(val);
    setErrorMsg("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no soportado. Sube una imagen (JPG, PNG, WebP) o un PDF.");
      if (receiptInputRef.current) receiptInputRef.current.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("El archivo excede el límite de 25MB.");
      if (receiptInputRef.current) receiptInputRef.current.value = "";
      return;
    }

    setPendingReceiptFile(file);
    toast.success("Comprobante adjuntado.");
  };

  const handleProceedToStep2 = async () => {
    setErrorMsg("");

    if (!pagoAcreditado && !hasReceiptAttached) {
      toast.error("Por favor adjunta tu comprobante de pago para continuar.");
      return;
    }

    if (pendingReceiptFile && !localReceiptUrl) {
      setUploadingReceipt(true);
      const res = await uploadComprobantePublico({
        file: pendingReceiptFile,
        tokenReserva: initialData.token_reserva
      });
      setUploadingReceipt(false);

      if (!res.success) {
        toast.error(res.error || "No se pudo subir el comprobante. Intenta de nuevo.");
        return;
      }

      setLocalReceiptUrl(res.publicUrl);
      setUploadStats({
        fileName: pendingReceiptFile.name,
        compressedSize: res.compressedSize,
        savedPercentage: res.savedPercentage,
        publicUrl: res.publicUrl
      });
      if (onComprobanteUploaded) onComprobanteUploaded(res.publicUrl);
    }

    setCurrentStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fecha) {
      setErrorMsg("Debes seleccionar una fecha de grabación.");
      return;
    }

    if (!pagoAcreditado && !hasReceiptAttached) {
      setErrorMsg("Es necesario adjuntar el comprobante de pago para procesar la reserva.");
      return;
    }

    setShowSlaDialog(true);
  };

  const handleConfirmSla = async () => {
    setShowSlaDialog(false);

    let finalReceiptUrl = localReceiptUrl || null;

    if (pendingReceiptFile && !finalReceiptUrl) {
      setUploadingReceipt(true);
      const res = await uploadComprobantePublico({
        file: pendingReceiptFile,
        tokenReserva: initialData.token_reserva
      });
      setUploadingReceipt(false);

      if (!res.success) {
        toast.error(res.error || "Error al subir comprobante. Intenta nuevamente.");
        return;
      }
      finalReceiptUrl = res.publicUrl;
      setLocalReceiptUrl(res.publicUrl);
      if (onComprobanteUploaded) onComprobanteUploaded(res.publicUrl);
    }

    const [hours, minutes] = hora.split(":").map(Number);
    const [year, month, day] = fecha.split("-").map(Number);
    const combinedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    onSubmit({
      fecha_produccion: combinedDate.toISOString(),
      locacion,
      notas_brief: notasBrief,
      comprobante_url: finalReceiptUrl
    });
  };

  const isBusy = isSubmitting || uploadingReceipt;
  const cleanPhone = "529982148831";
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola The Formulab, tengo dudas sobre mi reserva de rodaje (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}).`
  )}`;

  return {
    isPropuestaAgencia,
    fecha,
    hora,
    setHora,
    locacion,
    notasBrief,
    errorMsg,
    showSlaDialog,
    setShowSlaDialog,
    receiptInputRef,
    pendingReceiptFile,
    uploadingReceipt,
    localReceiptUrl,
    uploadStats,
    esExtraSession,
    precioExtra,
    mesNombre,
    esDosPagos,
    esSegundoTramo,
    pagoAcreditado,
    hasReceiptAttached,
    currentStep,
    setCurrentStep,
    showAlternateDate,
    setShowAlternateDate,
    sessionHours,
    shifts,
    typeInfo,
    clientName,
    displayCompany,
    valorAbonoRegular,
    valorSesion,
    abonoBadgeLabel,
    formatProposedDateLong,
    handleDateChange,
    handleFileSelect,
    handleProceedToStep2,
    handleSubmit,
    handleConfirmSla,
    isBusy,
    waUrl,
    proposedDateStr,
    minDateStr
  };
}

