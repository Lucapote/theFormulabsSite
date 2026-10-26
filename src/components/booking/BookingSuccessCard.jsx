import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  Clock,
  Loader2,
  FileCheck2,
  ExternalLink,
  FileText
} from "lucide-react";
import AutoLinkedText from "@/components/common/AutoLinkedText";
import { isSessionPaymentSatisfied } from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { confirmarReservaProduccion } from "@/services/operationsService";

export default function BookingSuccessCard({
  produccion = {},
  onReschedule,
  onProduccionUpdated
}) {
  const replacementInputRef = useRef(null);
  const [uploadingReplacement, setUploadingReplacement] = useState(false);

  const { pagoAcreditado } = isSessionPaymentSatisfied(
    produccion,
    produccion.ciclo,
    produccion.cliente
  );

  const receiptUrl =
    produccion.ciclo?.comprobante_url ||
    produccion.ciclo?.comprobante_2_url ||
    produccion.comprobante_url ||
    null;

  const isPreReserva =
    !pagoAcreditado &&
    (produccion.estado === "pre_reservada" ||
      Boolean(produccion.ciclo?.comprobante_en_revision) ||
      Boolean(receiptUrl));

  const formatDateTime = (isoStr) => {
    if (!isoStr) return "Fecha confirmada";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(isoStr);
    }
  };

  const handleReplaceReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !produccion.token_reserva) return;

    // Validación de tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no soportado. Por favor sube una imagen (PNG, JPG, WebP) o PDF.");
      if (replacementInputRef.current) replacementInputRef.current.value = "";
      return;
    }

    setUploadingReplacement(true);
    const loadingToast = toast.loading("Actualizando comprobante en el servidor...");

    const uploadRes = await uploadComprobantePublico({
      file,
      tokenReserva: produccion.token_reserva
    });

    if (!uploadRes.success) {
      toast.dismiss(loadingToast);
      setUploadingReplacement(false);
      toast.error(uploadRes.error || "No se pudo actualizar el comprobante.");
      return;
    }

    const confirmRes = await confirmarReservaProduccion(produccion.token_reserva, {
      fecha_produccion: produccion.fecha_produccion,
      locacion: produccion.locacion,
      notas_brief: produccion.notas_brief,
      comprobante_url: uploadRes.publicUrl
    });

    toast.dismiss(loadingToast);
    setUploadingReplacement(false);

    if (confirmRes.success) {
      toast.success("Comprobante actualizado y enviado para revisión.");
      if (onProduccionUpdated) onProduccionUpdated(confirmRes.data);
    } else {
      toast.error(confirmRes.error || "Error al actualizar el comprobante.");
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-5 sm:p-7 max-w-xl mx-auto text-center space-y-4 font-inter">
      {/* Icono de Estado Clínico (Azul Eléctrico / Índigo para Pre-Aprobado vs Esmeralda para Confirmado) */}
      <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full blur-md ${
            isPreReserva ? "bg-blue-400/25" : "bg-emerald-400/25"
          }`}
        />
        <div
          className={`relative w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg ${
            isPreReserva
              ? "bg-gradient-to-tr from-[#188ff0] to-indigo-600 shadow-blue-200"
              : "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-200"
          }`}
        >
          {isPreReserva ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-7 h-7" />}
        </div>
      </div>

      <div className="space-y-1">
        {/* Badge de Estado */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border mb-1.5 ${
            isPreReserva
              ? "bg-blue-50 text-brand-blue border-blue-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}
        >
          {isPreReserva ? <Clock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>
            {isPreReserva
              ? "Pre-Aprobado • Comprobante en Revisión"
              : "Estado: Agendada y Confirmada"}
          </span>
        </div>

        {/* Título de Pantalla */}
        <h2 className="text-lg sm:text-xl font-sora font-bold text-gray-900 tracking-tight">
          {isPreReserva
            ? "¡Sesión Pre-Aprobada!"
            : "¡Fecha de Rodaje Agendada!"}
        </h2>

        {/* Mensaje descriptivo */}
        <p className="text-xs font-inter text-gray-500 max-w-md mx-auto leading-relaxed">
          {isPreReserva
            ? "Recibimos tu comprobante de pago y tu horario se encuentra apartado en agenda. Nuestro equipo de administración está validando la transferencia para confirmar 100% tu fecha."
            : "El equipo de producción de The Formulab ya tiene tu fecha en calendario. Nos vemos pronto para crear contenido increíble."}
        </p>
      </div>

      {/* Input oculto para cambiar comprobante si el cliente se equivocó de archivo */}
      <input
        ref={replacementInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleReplaceReceipt}
        className="hidden"
      />

      {/* Tarjeta de Comprobante Recibido (Modo Pre-Aprobado en Revisión) */}
      {isPreReserva && (
        <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-left flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-sora font-bold text-gray-900 block truncate">
                Comprobante Recibido
              </span>
              <span className="text-[11px] font-inter text-gray-500 block truncate">
                En proceso de validación por administración
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-3 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[11px] font-sora font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver</span>
              </a>
            )}
            <button
              type="button"
              disabled={uploadingReplacement}
              onClick={() => replacementInputRef.current?.click()}
              className="h-7 px-3 rounded-full bg-white hover:bg-gray-50 text-brand-blue border border-blue-200 text-[11px] font-sora font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98]"
              title="Cambiar comprobante solo si subiste el archivo equivocado"
            >
              {uploadingReplacement ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>Cambiar</span>
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta Resumen de Fecha y Locación */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-3.5 text-left space-y-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Día y Hora del Rodaje
            </span>
            <span className="text-xs sm:text-sm font-sora font-bold text-gray-900 capitalize">
              {formatDateTime(produccion.fecha_produccion)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Locación Confirmada
            </span>
            <span className="text-xs sm:text-sm font-inter text-gray-800">
              {produccion.locacion || "Locación fijada por la agencia"}
            </span>
          </div>
        </div>

        {produccion.notas_brief && (
          <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
                Requerimientos & Brief de Grabación
              </span>
              <div className="text-xs font-inter text-gray-800 mt-0.5 leading-relaxed whitespace-pre-line">
                <AutoLinkedText text={produccion.notas_brief} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opción para reprogramar fecha o locación */}
      {onReschedule && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onReschedule}
            className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>¿Necesitas modificar la fecha o locación?</span>
          </button>
        </div>
      )}
    </div>
  );
}
