import { Link2, ExternalLink, LockKeyhole, AlertTriangle, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";
import { checkSesionDesbloqueada } from "@/services/operationsService";
import { checkProductionPaymentRisk } from "@/utils/bookingHelpers";

/**
 * ProductionSessionCapsule
 * Atomic capsule item displaying session status, gatekeeper lock, 24h payment risk, and quick actions.
 */
export default function ProductionSessionCapsule({
  prod,
  ciclo,
  clienteNombre,
  totalSessions,
  onOpenModal
}) {
  const isScheduled = prod.estado === "agendada";
  const isPreReserved = prod.estado === "pre_reservada";
  const isProposedByAgency = prod.estado === "fecha_propuesta";
  const isCompleted = ["rodaje_completado", "en_edicion", "finalizada"].includes(prod.estado);
  const sessionTitle = getSessionDisplayName(prod, ciclo.mes, totalSessions);

  const check = checkSesionDesbloqueada(prod, ciclo, ciclo?.cliente || {}, totalSessions);
  const estaDesbloqueada = check.estaDesbloqueada;
  const isEsperandoSegundoPago = check.motivoBloqueo === "esperando_segundo_pago";

  const riskInfo = checkProductionPaymentRisk(prod, ciclo, ciclo?.cliente || {}, totalSessions);
  const enRiesgoPago = riskInfo.enRiesgo;

  const dateText = prod.fecha_produccion
    ? new Date(prod.fecha_produccion).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!prod.token_reserva) return toast.error("Esta sesión no cuenta con token de reserva.");
    navigator.clipboard.writeText(getBookingUrl(prod.token_reserva));
    toast.success("Enlace de reserva copiado al portapapeles.");
  };

  const handleOpenLink = (e) => {
    e.stopPropagation();
    if (!prod.token_reserva) return toast.error("Esta sesión no cuenta con token de reserva.");
    window.open(getBookingUrl(prod.token_reserva), "_blank");
  };

  const capsuleTitle = enRiesgoPago
    ? `${sessionTitle} • [⚠️ EN RIESGO: Menos de 24h sin pago acreditado]`
    : isPreReserved
    ? `${sessionTitle} • [Pre-Reserva Temporal: Revisar comprobante de pago]`
    : isProposedByAgency
    ? `${sessionTitle} • [Fecha propuesta por agencia: Pago permitido hasta 24h antes]`
    : isEsperandoSegundoPago
    ? `${sessionTitle} • [🔒 Bloqueada: Esperando 2do Pago]`
    : !estaDesbloqueada
    ? `${sessionTitle} • [🔒 Bloqueada: Pago Inicial Pendiente]`
    : `${sessionTitle} • Clic para gestionar detalles`;

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(prod, clienteNombre, ciclo)}
      className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
        enRiesgoPago
          ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-2xs"
          : isCompleted
          ? "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
          : isPreReserved
          ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          : isProposedByAgency
          ? "bg-sky-50 text-brand-blue border-sky-200 hover:bg-sky-100"
          : isScheduled
          ? "bg-blue-50 text-brand-blue border-blue-200 hover:bg-blue-100"
          : !estaDesbloqueada
          ? "bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100"
          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
      }`}
      title={capsuleTitle}
    >
      {enRiesgoPago ? (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
      ) : isPreReserved ? (
        <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
      ) : isProposedByAgency ? (
        <Sparkles className="w-3 h-3 text-brand-blue shrink-0" />
      ) : (
        !isScheduled &&
        !estaDesbloqueada && <LockKeyhole className="w-3 h-3 text-amber-500 shrink-0" />
      )}

      <span className="font-sora font-bold text-[11px] truncate max-w-[130px]">
        {sessionTitle}
      </span>

      {dateText ? (
        <span className="font-inter text-[10px] opacity-80 truncate max-w-[85px]">
          • {dateText}
        </span>
      ) : (
        <span className="font-inter text-[10px] opacity-75">
          • {prod.tipo === "profesional" || prod.duracion_horas === 6 ? "6h" : "4h"}
        </span>
      )}

      {enRiesgoPago && (
        <span className="font-mono text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-full border border-rose-200 shrink-0">
          En riesgo &lt;24h
        </span>
      )}

      {!enRiesgoPago && isPreReserved && (
        <span className="font-mono text-[9px] font-semibold text-indigo-700 bg-indigo-100/90 px-1.5 py-0.5 rounded-full border border-indigo-200 shrink-0">
          Pre-reserva
        </span>
      )}

      {!enRiesgoPago && isProposedByAgency && (
        <span className="font-mono text-[9px] font-semibold text-brand-blue bg-white/90 px-1.5 py-0.5 rounded-full border border-sky-200 shrink-0">
          Propuesta
        </span>
      )}

      {!enRiesgoPago && !isPreReserved && !isProposedByAgency && isEsperandoSegundoPago && (
        <span className="font-mono text-[9px] font-semibold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">
          2do Pago
        </span>
      )}

      {prod.token_reserva && (
        <div className="flex items-center gap-0.5 ml-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copiar link de reserva"
            className="p-1 rounded-full hover:bg-white/80 text-gray-500 hover:text-brand-blue transition-colors cursor-pointer"
          >
            <Link2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleOpenLink}
            title="Abrir auto-reserva en nueva pestaña"
            className="p-1 rounded-full hover:bg-white/80 text-gray-500 hover:text-brand-blue transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
