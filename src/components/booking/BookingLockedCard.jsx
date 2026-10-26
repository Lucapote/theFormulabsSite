import { useState, useRef } from "react";
import { toast } from "sonner";
import { MessageCircle, ArrowRight } from "lucide-react";
import { uploadComprobantePublico } from "@/services/r2Service";
import { MESES_ANIO } from "@/utils/formatters";
import BookingHeader from "./BookingHeader";
import BookingStepTracker from "./BookingStepTracker";
import BookingBankDetailsCard from "./BookingBankDetailsCard";
import BookingReceiptDropzone from "./BookingReceiptDropzone";

/**
 * BookingLockedCard
 * Pantalla de pre-reserva cuando la sesión requiere comprobante de pago previo.
 * Reutiliza BookingBankDetailsCard y BookingReceiptDropzone para máxima coherencia DRY.
 */
export default function BookingLockedCard({
  produccion = null,
  cliente = {},
  ciclo = {},
  numeroSesion = 1,
  motivoBloqueo = "pago_pendiente",
  tokenReserva = "",
  onReceiptUploaded
}) {
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

  const esExtraSession = Boolean(
    produccion?.tipo === "extra" || produccion?.precio_extra
  );
  const mesIndex = ciclo?.mes ? Number(ciclo.mes) - 1 : new Date().getMonth();
  const mesNombre = MESES_ANIO[mesIndex] || "Ciclo Actual";

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
  const waMessage = encodeURIComponent(
    isSegundoPago
      ? `Hola The Formulab, ya realicé el segundo abono de mi ciclo (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la sesión #${numeroSesion}.`
      : `Hola The Formulab, ya realicé el pago de mi ciclo (${clientName}${displayCompany ? ` - ${displayCompany}` : ""}). Les comparto mi comprobante para desbloquear la reserva de rodaje.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden max-w-xl mx-auto font-inter text-left">
      {/* Encabezado Clínico Unificado */}
      <BookingHeader
        sessionTitle={
          produccion?.nombre ||
          (esExtraSession
            ? `${mesNombre} Extra`
            : `Sesión #${produccion?.numero_sesion || numeroSesion || 1}`)
        }
        numeroSesion={produccion?.numero_sesion || numeroSesion || 1}
        clienteNombre={clientName}
        empresa={displayCompany || ""}
        tipo={produccion?.tipo || cliente?.tipo_sesion_default || "organica"}
        duracionHoras={produccion?.duracion_horas}
        isExtraSession={esExtraSession}
        precioExtra={produccion?.precio_extra}
        valorMostrar={montoAbono}
        pagoAcreditado={false}
      />

      {/* Tracker Clínico The Formulab (#ef18d6) */}
      <BookingStepTracker
        steps={[
          { key: 1, label: "Comprobante" },
          { key: 2, label: "Reserva de Sesión" }
        ]}
        currentStep={uploadStats ? 2 : 1}
        canGoToStep2={Boolean(uploadStats)}
        onStepClick={(stepKey) => {
          if (stepKey === 2 && uploadStats?.publicUrl && onReceiptUploaded) {
            onReceiptUploaded(uploadStats.publicUrl);
          }
        }}
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Ficha Bancaria Quirúrgica Reutilizable */}
        <BookingBankDetailsCard
          clientName={clientName}
          montoAbono={montoAbono}
          abonoBadgeLabel={abonoBadgeLabel}
        />

        {/* Dropzone de Comprobante Reutilizable */}
        <BookingReceiptDropzone
          fileInputRef={fileInputRef}
          uploading={uploading}
          uploadStats={uploadStats}
          comprobanteUrl={null}
          onFileChange={handleFileChange}
          isRequired={true}
        />

        {/* Botón de Transición a Selección de Fecha */}
        <div className="pt-2">
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
      </div>
    </div>
  );
}
