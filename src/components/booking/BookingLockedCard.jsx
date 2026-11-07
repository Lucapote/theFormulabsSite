import { useState, useRef } from "react";
import { toast } from "sonner";
import { MessageCircle, ArrowRight, Lock } from "lucide-react";
import { uploadComprobantePublico } from "@/services/r2Service";
import BookingStepTracker from "./BookingStepTracker";
import BookingBankDetailsCard from "./BookingBankDetailsCard";
import BookingReceiptDropzone from "./BookingReceiptDropzone";
import BookingChecklistSection from "./BookingChecklistSection";

/**
 * BookingLockedCard
 * Pantalla de pre-reserva cuando la sesión requiere comprobante de pago previo.
 * Soporta los 3 pasos: [Comprobante] [Reserva de Sesión] [Requerimientos].
 * Todas las secciones residen en la misma tarjeta con ancho unificado.
 */
export default function BookingLockedCard({
  produccion = null,
  cliente = {},
  ciclo = {},
  numeroSesion = 1,
  motivoBloqueo = "pago_pendiente",
  tokenReserva = "",
  onReceiptUploaded,
  onRequerimientosUpdated = null
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const fileInputRef = useRef(null);

  const isSegundoPago = motivoBloqueo === "esperando_segundo_pago";
  const isDosPagos =
    cliente?.esquema_pago === "quincenal" ||
    cliente?.esquema_pago === "dos_pagos" ||
    Boolean(cliente?.dia_corte_pago_2);

  const montoTotal = Number(ciclo?.monto_cobrado || cliente?.monto_retainer) || 0;
  const montoAbono = isDosPagos ? Math.round(montoTotal / 2) : montoTotal;
  const abonoBadgeLabel = isDosPagos
    ? isSegundoPago
      ? "2do ABONO (50%)"
      : "1er ABONO (50%)"
    : "TOTAL CICLO";

  const clientName = cliente?.nombre || produccion?.cliente?.nombre || "Cliente Estimado";
  const displayCompany =
    cliente?.empresa && cliente.empresa !== clientName ? cliente.empresa : null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!tokenReserva) {
      toast.error("Token de reserva no encontrado.");
      return;
    }

    setUploading(true);
    const res = await uploadComprobantePublico({ file, tokenReserva });
    setUploading(false);

    if (!res.success) {
      toast.error(res.error || "No se pudo subir el comprobante.");
      return;
    }

    setUploadStats({
      publicUrl: res.publicUrl,
      fileName: file.name,
      originalSize: res.originalSize,
      compressedSize: res.compressedSize,
      savedPercentage: res.savedPercentage
    });

    toast.success("Comprobante registrado. Ya puedes seleccionar tu fecha de rodaje.");
  };

  const cleanPhone = "529982148831";
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    isSegundoPago
      ? `Hola The Formulab, ya realicé el segundo abono de mi ciclo (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la sesión #${numeroSesion}.`
      : `Hola The Formulab, ya realicé el pago de mi ciclo (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la reserva de rodaje.`
  )}`;

  const steps = [
    { key: 1, label: "Comprobante", shortLabel: "Comprobante" },
    { key: 2, label: "Reserva de Sesión", shortLabel: "Reserva", disabled: !uploadStats },
    { key: 3, label: "Requerimientos", shortLabel: "Requerimientos", disabled: false }
  ];

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden w-full max-w-xl mx-auto font-inter text-left">
      {/* Selector de 3 pasos clínico The Formulab (#ef18d6) */}
      <BookingStepTracker
        steps={steps}
        currentStep={currentStep}
        canGoToStep2={Boolean(uploadStats)}
        onStepClick={(stepKey) => {
          if (stepKey === 2) {
            if (uploadStats?.publicUrl && onReceiptUploaded) {
              onReceiptUploaded(uploadStats.publicUrl);
            } else {
              setCurrentStep(2);
            }
          } else {
            setCurrentStep(stepKey);
          }
        }}
      />

      {currentStep === 1 && (
        <div className="p-3.5 sm:p-5 space-y-3">
          <BookingBankDetailsCard
            clientName={clientName}
            montoAbono={montoAbono}
            abonoBadgeLabel={abonoBadgeLabel}
          />

          <BookingReceiptDropzone
            fileInputRef={fileInputRef}
            uploading={uploading}
            uploadStats={uploadStats}
            comprobanteUrl={null}
            onFileChange={handleFileChange}
            isRequired={true}
          />

          <div className="pt-1">
            <button
              type="button"
              disabled={!uploadStats || uploading}
              onClick={() => {
                if (uploadStats?.publicUrl && onReceiptUploaded) {
                  onReceiptUploaded(uploadStats.publicUrl);
                }
              }}
              className="w-full py-3.5 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Continuar a Selección de Fecha (Paso 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 text-center">
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
        </div>
      )}

      {currentStep === 2 && (
        <div className="p-5 sm:p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-sora font-bold text-gray-900">
              Paso 2: Selección de Fecha
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Adjunta tu comprobante en el paso 1 para desbloquear el calendario y agendar tu fecha de filmación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-sora font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            Ir al Paso 1 (Comprobante)
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <BookingChecklistSection
          requerimientos={produccion?.requerimientos || []}
          token={tokenReserva}
          onRequerimientosUpdated={onRequerimientosUpdated}
          onBack={() => setCurrentStep(1)}
        />
      )}
    </div>
  );
}
