import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { AlertTriangle, MessageCircle } from "lucide-react";
import {
  getRecordingShifts,
  formatTimeRange,
  getSessionTypeInfo,
  getMinBusinessBookingDate,
  formatLocalDateToYMD,
  isSessionPaymentSatisfied
} from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { MESES_ANIO } from "@/utils/formatters";
import BookingHeader from "./BookingHeader";
import BookingStepTracker from "./BookingStepTracker";
import BookingAgencyStep1 from "./BookingAgencyStep1";
import BookingAgencyStep2 from "./BookingAgencyStep2";
import BookingStandardFields from "./BookingStandardFields";
import ProductionSlaWarningDialog from "./ProductionSlaWarningDialog";

/**
 * BookingFormCard
 * Componente orquestador del formulario de reserva de producciones.
 * Soporta propuestas de fecha de agencia (flujo de 2 pasos) y reservas estándar.
 */
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
  const isPropuestaAgencia = initialData.estado === "fecha_propuesta";

  // Descomposición de la fecha inicial propuesta si existe
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

  // Fecha mínima: Hoy + 3 días hábiles
  const minDate = useMemo(() => getMinBusinessBookingDate(), []);
  const minDateStr = useMemo(() => formatLocalDateToYMD(minDate), [minDate]);

  // Estados del Formulario
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

  // Comprobante
  const receiptInputRef = useRef(null);
  const [pendingReceiptFile, setPendingReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [localReceiptUrl, setLocalReceiptUrl] = useState(comprobanteSubidoUrl || null);
  const [uploadStats, setUploadStats] = useState(null);

  // Estados financieros y de tramo
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

  const [currentStep, setCurrentStep] = useState(1);
  const [showAlternateDate, setShowAlternateDate] = useState(false);

  // Cálculos de tipo y turnos
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

  const montoAbonoTexto = esExtraSession
    ? `$${Number(precioExtra || 0).toLocaleString("es-MX")} MXN`
    : valorAbonoRegular > 0
    ? `$${Number(valorAbonoRegular).toLocaleString("es-MX")} MXN`
    : "Sin costo adicional";

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

  return (
    <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden max-w-xl mx-auto font-inter text-left">
      {/* Encabezado de Sesión */}
      <BookingHeader
        sessionTitle={
          initialData?.nombre ||
          (esExtraSession
            ? `${mesNombre} Extra`
            : `Sesión #${initialData?.numero_sesion || 1}`)
        }
        numeroSesion={initialData?.numero_sesion || 1}
        clienteNombre={clientName}
        empresa={displayCompany || ""}
        tipo={tipo}
        duracionHoras={sessionHours}
        isExtraSession={esExtraSession}
        precioExtra={precioExtra}
        valorMostrar={valorSesion}
        pagoAcreditado={pagoAcreditado}
      />

      {/* Tracker Clínico The Formulab (#ef18d6) */}
      <BookingStepTracker
        steps={
          isPropuestaAgencia
            ? [
                { key: 1, label: "Comprobante" },
                { key: 2, label: "Locación y Brief" }
              ]
            : [
                { key: 1, label: "Comprobante" },
                { key: 2, label: "Reserva de Sesión" }
              ]
        }
        currentStep={isPropuestaAgencia ? currentStep : 2}
        canGoToStep2={isPropuestaAgencia ? pagoAcreditado || hasReceiptAttached : true}
        onStepClick={(stepKey) => {
          if (isPropuestaAgencia) {
            if (stepKey === 1) setCurrentStep(1);
            else if (pagoAcreditado || hasReceiptAttached) handleProceedToStep2();
          }
        }}
      />

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-inter text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isPropuestaAgencia ? (
          currentStep === 1 ? (
            <BookingAgencyStep1
              fecha={fecha}
              hora={hora}
              shifts={shifts}
              sessionHours={sessionHours}
              typeInfo={typeInfo}
              proposedDateStr={proposedDateStr}
              formatProposedDateLong={formatProposedDateLong}
              formatTimeRange={formatTimeRange}
              showAlternateDate={showAlternateDate}
              setShowAlternateDate={setShowAlternateDate}
              minDateStr={minDateStr}
              onDateChange={handleDateChange}
              onTimeChange={setHora}
              clientName={clientName}
              montoAbono={valorSesion || 0}
              abonoBadgeLabel={abonoBadgeLabel}
              fileInputRef={receiptInputRef}
              uploadingReceipt={uploadingReceipt}
              uploadStats={uploadStats}
              comprobanteUrl={localReceiptUrl}
              pendingReceiptFile={pendingReceiptFile}
              onReceiptFileChange={handleFileSelect}
              onProceedToStep2={handleProceedToStep2}
              isBusy={isBusy}
            />
          ) : (
            <BookingAgencyStep2
              fecha={fecha}
              hora={hora}
              shifts={shifts}
              sessionHours={sessionHours}
              formatProposedDateLong={formatProposedDateLong}
              formatTimeRange={formatTimeRange}
              locacion={locacion}
              notasBrief={notasBrief}
              onBackToStep1={() => setCurrentStep(1)}
              isSubmitting={isSubmitting}
              isBusy={isBusy}
            />
          )
        ) : (
          <BookingStandardFields
            pagoAcreditado={pagoAcreditado}
            esExtraSession={esExtraSession}
            precioExtra={precioExtra}
            esSegundoTramo={esSegundoTramo}
            valorAbonoRegular={valorAbonoRegular}
            esDosPagos={esDosPagos}
            minDateStr={minDateStr}
            fecha={fecha}
            onDateChange={handleDateChange}
            hora={hora}
            setHora={setHora}
            shifts={shifts}
            locacion={locacion}
            notasBrief={notasBrief}
            fileInputRef={receiptInputRef}
            uploadingReceipt={uploadingReceipt}
            uploadStats={uploadStats}
            comprobanteUrl={localReceiptUrl}
            pendingReceiptFile={pendingReceiptFile}
            onReceiptFileChange={handleFileSelect}
            isSubmitting={isSubmitting}
            isBusy={isBusy}
          />
        )}

        {/* Modal de Políticas SLA */}
        <ProductionSlaWarningDialog
          isOpen={showSlaDialog}
          onConfirm={handleConfirmSla}
          onCancel={() => setShowSlaDialog(false)}
          tipoProduccion={tipo}
          fechaSeleccionada={fecha}
          isSubmitting={isBusy}
          duracionHoras={sessionHours}
        />

        {/* Soporte por WhatsApp en el pie */}
        <div className="pt-3 border-t border-gray-100 text-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              ¿Dudas con tu facturación o transferencia?{" "}
              <span className="font-semibold text-gray-700 underline decoration-gray-300">
                Contactar por WhatsApp
              </span>
            </span>
          </a>
        </div>
      </form>
    </div>
  );
}
