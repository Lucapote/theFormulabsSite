import { Link2, ExternalLink, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";
import { checkSesionDesbloqueada } from "@/services/operationsService";

/**
 * ProductionSessionCapsule
 * Atomic capsule item displaying session status, gatekeeper lock, and quick actions.
 */
export default function ProductionSessionCapsule({
  prod,
  ciclo,
  clienteNombre,
  totalSessions,
  estaPagado,
  onOpenModal
}) {
  const isScheduled = prod.estado === "agendada";
  const isCompleted = ["rodaje_completado", "en_edicion", "finalizada"].includes(prod.estado);
  const sessionTitle = getSessionDisplayName(prod, ciclo.mes, totalSessions);

  const check = checkSesionDesbloqueada(prod, ciclo, ciclo?.cliente || {}, totalSessions);
  const estaDesbloqueada = check.estaDesbloqueada;
  const isEsperandoSegundoPago = check.motivoBloqueo === "esperando_segundo_pago";

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

  const capsuleTitle = isEsperandoSegundoPago
    ? `${sessionTitle} • [🔒 Bloqueada: Esperando 2do Pago]`
    : !estaDesbloqueada
    ? `${sessionTitle} • [🔒 Bloqueada: Pago Inicial Pendiente]`
    : `${sessionTitle} • Clic para gestionar detalles`;

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(prod, clienteNombre, ciclo)}
      className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
        isCompleted
          ? "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
          : isScheduled
          ? "bg-blue-50 text-brand-blue border-blue-200 hover:bg-blue-100"
          : !estaDesbloqueada
          ? "bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100"
          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
      }`}
      title={capsuleTitle}
    >
      {!isScheduled && !estaDesbloqueada && (
        <LockKeyhole className="w-3 h-3 text-amber-500 shrink-0" />
      )}
      <span className="font-sora font-bold text-[11px] truncate max-w-[130px]">
        {sessionTitle}
      </span>
      {dateText ? (
        <span className="font-inter text-[10px] opacity-75 truncate max-w-[80px]">
          • {dateText}
        </span>
      ) : (
        <span className="font-inter text-[10px] opacity-75">
          • {prod.tipo === "profesional" || prod.duracion_horas === 6 ? "6h" : "4h"}
        </span>
      )}

      {isEsperandoSegundoPago && (
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
