import { AlertTriangle, MessageCircle } from "lucide-react";
import useBookingFormManager from "@/hooks/useBookingFormManager";
import BookingStepTracker from "./BookingStepTracker";
import BookingAgencyStep1 from "./BookingAgencyStep1";
import BookingAgencyStep2 from "./BookingAgencyStep2";
import BookingStandardFields from "./BookingStandardFields";
import BookingChecklistSection from "./BookingChecklistSection";
import ProductionSlaWarningDialog from "./ProductionSlaWarningDialog";

/**
 * BookingFormCard
 * Componente orquestador del formulario de reserva de producciones.
 * Soporta propuestas de fecha de agencia y reservas estándar, integrando el 3er paso [Requerimientos].
 * Ancho unificado y diseño modularizado bajo 250 líneas por GEMINI.md Regla 5.
 */
export default function BookingFormCard(props) {
  const { initialData = {}, onRequerimientosUpdated = null } = props;

  const {
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
  } = useBookingFormManager(props);

  const steps = isPropuestaAgencia
    ? [
        { key: 1, label: "Comprobante", shortLabel: "Comprobante" },
        {
          key: 2,
          label: "Locación y Brief",
          shortLabel: "Brief",
          disabled: !pagoAcreditado && !hasReceiptAttached
        },
        { key: 3, label: "Requerimientos", shortLabel: "Requerimientos", disabled: false }
      ]
    : [
        { key: 1, label: "Comprobante", shortLabel: "Comprobante", disabled: false },
        { key: 2, label: "Reserva de Sesión", shortLabel: "Reserva", disabled: false },
        { key: 3, label: "Requerimientos", shortLabel: "Requerimientos", disabled: false }
      ];

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden w-full max-w-xl mx-auto font-inter text-left">
      {/* Selector Clínico de 3 Pasos The Formulab (#ef18d6) */}
      <BookingStepTracker
        steps={steps}
        currentStep={currentStep}
        canGoToStep2={isPropuestaAgencia ? pagoAcreditado || hasReceiptAttached : true}
        onStepClick={(stepKey) => {
          if (stepKey === 2 && isPropuestaAgencia && !pagoAcreditado && !hasReceiptAttached) {
            handleProceedToStep2();
          } else {
            setCurrentStep(stepKey);
          }
        }}
      />

      {currentStep === 3 ? (
        <BookingChecklistSection
          requerimientos={initialData?.requerimientos || []}
          token={initialData?.token_reserva}
          onRequerimientosUpdated={onRequerimientosUpdated}
          onBack={() => setCurrentStep(2)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4">
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
                formatTimeRange={(s) => `${s} hrs`}
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
                formatTimeRange={(s) => `${s} hrs`}
                locacion={locacion}
                notasBrief={notasBrief}
                onBackToStep1={() => setCurrentStep(1)}
                isSubmitting={props.isSubmitting}
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
              isSubmitting={props.isSubmitting}
              isBusy={isBusy}
            />
          )}

          <ProductionSlaWarningDialog
            isOpen={showSlaDialog}
            onConfirm={handleConfirmSla}
            onCancel={() => setShowSlaDialog(false)}
            tipoProduccion={props.tipo}
            fechaSeleccionada={fecha}
            isSubmitting={isBusy}
            duracionHoras={sessionHours}
          />

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
      )}
    </div>
  );
}
