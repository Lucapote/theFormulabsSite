import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  Clock,
  Upload,
  Loader2,
  FileCheck2,
  AlertTriangle
} from "lucide-react";
import { isSessionPaymentSatisfied } from "@/utils/bookingHelpers";
import { uploadComprobantePublico } from "@/services/r2Service";
import { confirmarReservaProduccion } from "@/services/operationsService";
import { formatBytes } from "@/utils/mediaCompressor";

export default function BookingSuccessCard({
  produccion = {},
  onReschedule,
  onProduccionUpdated
}) {
  const fileInputRef = useRef(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState(null);

  const isPreReserva = produccion.estado === "pre_reservada" || Boolean(produccion.ciclo?.comprobante_en_revision);
  const { pagoAcreditado } = isSessionPaymentSatisfied(
    produccion,
    produccion.ciclo,
    produccion.cliente
  );
  const faltaPago24h = !pagoAcreditado && !isPreReserva;

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

  const handleUploadReceiptAfterConfirm = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !produccion.token_reserva) return;

    setUploadingReceipt(true);
    const uploadRes = await uploadComprobantePublico({
      file,
      tokenReserva: produccion.token_reserva
    });

    if (!uploadRes.success) {
      setUploadingReceipt(false);
      toast.error(uploadRes.error || "No se pudo subir el comprobante.");
      return;
    }

    const confirmRes = await confirmarReservaProduccion(produccion.token_reserva, {
      fecha_produccion: produccion.fecha_produccion,
      locacion: produccion.locacion,
      notas_brief: produccion.notas_brief,
      comprobante_url: uploadRes.publicUrl
    });
    setUploadingReceipt(false);

    if (confirmRes.success) {
      setUploadedInfo({
        compressedSize: uploadRes.compressedSize,
        savedPercentage: uploadRes.savedPercentage
      });
      toast.success("Comprobante comprimido y enviado para validación de la agencia.");
      if (onProduccionUpdated) onProduccionUpdated(confirmRes.data);
    } else {
      toast.error(confirmRes.error || "Error al vincular el comprobante.");
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-xl mx-auto text-center space-y-5 font-inter">
      {/* Icono de Éxito / Pre-Reserva */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full blur-md ${
            isPreReserva ? "bg-blue-400/20" : "bg-emerald-400/20"
          }`}
        />
        <div
          className={`relative w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg ${
            isPreReserva
              ? "bg-gradient-to-tr from-[#188ff0] to-indigo-500 shadow-blue-200"
              : "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-200"
          }`}
        >
          {isPreReserva ? <Clock className="w-7 h-7" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>
      </div>

      <div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium border mb-2 ${
            isPreReserva
              ? "bg-blue-50 text-brand-blue border-blue-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>
            {isPreReserva
              ? "Pre-Reserva Temporal • Validando Comprobante"
              : pagoAcreditado
              ? "Estado: Agendada y Confirmada"
              : "Fecha Confirmada • Pago hasta 24h antes"}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-sora font-bold text-gray-900 tracking-tight mb-2">
          {isPreReserva
            ? "¡Pre-Reserva Registrada!"
            : "¡Fecha de Rodaje Agendada!"}
        </h2>

        <p className="text-xs sm:text-sm font-inter text-gray-500 max-w-md mx-auto">
          {isPreReserva
            ? "Recibimos tu comprobante de pago y hemos bloqueado temporalmente tu horario. Una vez validado por administración, tu sesión quedará 100% confirmada."
            : "El equipo de producción de The Formulab ya tiene tu fecha en calendario. Nos vemos pronto para crear contenido increíble."}
        </p>
      </div>

      {/* Aviso de límite de pago 24h antes si la fecha fue propuesta por la agencia y aún no sube comprobante */}
      {faltaPago24h && !uploadedInfo && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <span className="font-sora font-bold block">
                Recordatorio: Pago límite hasta 24 horas antes
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Para mantener tu equipo de grabación asignado sin contratiempos, recuerda subir aquí tu comprobante de pago a más tardar el día anterior a la sesión.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleUploadReceiptAfterConfirm}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploadingReceipt}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-10 px-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-sora font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {uploadingReceipt ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comprimiendo y subiendo...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Subir Comprobante de Pago Ahora</span>
              </>
            )}
          </button>
        </div>
      )}

      {uploadedInfo && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-xs text-emerald-800 font-sora font-semibold">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>
            Comprobante enviado ({formatBytes(uploadedInfo.compressedSize)}) • En revisión
          </span>
        </div>
      )}

      {/* Tarjeta Resumen */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
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

        <div className="flex items-start gap-3 pt-2 border-t border-gray-200/60">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Locación Confirmada
            </span>
            <span className="text-xs sm:text-sm font-inter text-gray-800">
              {produccion.locacion || "Locación a convenir con el equipo"}
            </span>
          </div>
        </div>
      </div>

      {onReschedule && (
        <button
          type="button"
          onClick={onReschedule}
          className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>¿Necesitas modificar la fecha o locación?</span>
        </button>
      )}
    </div>
  );
}
