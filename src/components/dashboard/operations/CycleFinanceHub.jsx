import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Receipt,
  ExternalLink,
  CheckCircle2,
  FileCheck2,
  FileText,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatters";
import {
  updateCicloFinanzas,
  validarPagoYDesbloquear,
  rechazarComprobanteCiclo
} from "@/services/operationsService";

const STATUS_BADGES = {
  pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  primer_pago: "bg-blue-50 text-brand-blue border-blue-200",
  vencido: "bg-rose-50 text-rose-700 border-rose-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200"
};

/**
 * CycleFinanceHub
 * Subcomponente atómico para la Columna 3 de OperationsCycleCard.
 * Renderiza métricas financieras, selector de estado con Optimistic UI, hub permanente
 * de comprobantes y validaciones rápidas de acreditación.
 */
export default function CycleFinanceHub({
  ciclo = {},
  cliente = {},
  isDosPagos = false,
  firstPaymentSessions = 1,
  estaCompletamentePagado = false,
  tieneComprobantePorRevisar = false,
  isSegundoTramoPendiente = false,
  activeComprobanteUrl = null,
  hasApprovedReceipts = false,
  isComp1Aprobado = false,
  isComp2Aprobado = false,
  extraApprovedReceipts = [],
  comprobante1 = null,
  comprobante2 = null,
  producciones = [],
  onOpenFinanceModal = null,
  onOpenReviewReceipt = null,
  onStatusUpdated = null
}) {
  // Optimistic UI state para el selector de estado
  const [localStatus, setLocalStatus] = useState(ciclo.estado_pago || "pendiente");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Sincronizar estado local si el prop cambia desde el servidor
  useEffect(() => {
    setLocalStatus(ciclo.estado_pago || "pendiente");
  }, [ciclo.estado_pago]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === localStatus) return;

    const previousStatus = localStatus;
    // 1. Optimistic Update (0ms percepción de latencia)
    setLocalStatus(newStatus);
    setIsUpdatingStatus(true);

    const res = await updateCicloFinanzas(ciclo.id, {
      estado_pago: newStatus,
      comprobante_en_revision: false
    });

    setIsUpdatingStatus(false);

    if (res.success) {
      toast.success(`Estado de cobro actualizado a "${newStatus}".`);
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      // 2. Rollback defensivo ante fallo de red o backend
      setLocalStatus(previousStatus);
      toast.error(res.error || "No se pudo actualizar el estado de pago.");
    }
  };

  const handleQuickUnlock = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    const targetStatus = isDosPagos && localStatus === "pendiente" ? "primer_pago" : "pagado";
    const prodParaNotificar =
      targetStatus === "pagado" && isDosPagos && producciones[firstPaymentSessions]
        ? producciones[firstPaymentSessions]
        : producciones[0] || null;

    const res = await validarPagoYDesbloquear({
      cicloId: ciclo.id,
      cliente,
      produccionPrincipal: prodParaNotificar,
      montoCobrado: ciclo.monto_cobrado,
      mes: ciclo.mes,
      anio: ciclo.anio,
      nuevoEstado: targetStatus
    });
    setIsUnlocking(false);

    if (res.success) {
      setLocalStatus(targetStatus);
      toast.success(
        targetStatus === "primer_pago"
          ? `1er Abono confirmado. Se habilitaron ${firstPaymentSessions} ${
              firstPaymentSessions === 1 ? "sesión" : "sesiones"
            }.`
          : "Pago completo acreditado. Todas las sesiones han sido confirmadas."
      );
      if (onStatusUpdated) {
        onStatusUpdated(res.data);
      }
    } else {
      toast.error(res.error || "No se pudo desbloquear el ciclo.");
    }
  };

  const handleRejectReceipt = async () => {
    if (isRejecting) return;
    setIsRejecting(true);
    const esSegundo = isDosPagos && localStatus === "primer_pago";
    const res = await rechazarComprobanteCiclo(ciclo.id, esSegundo);
    setIsRejecting(false);

    if (res.success) {
      toast.info("Comprobante descartado y pre-reserva liberada.");
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo rechazar el comprobante.");
    }
  };

  return (
    <div className="lg:col-span-3 flex flex-col justify-center">
      <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex flex-col gap-2.5 shadow-2xs">
        {/* Monto Cobrado y Costo */}
        <div className="flex items-baseline justify-between gap-2 border-b border-gray-200/60 pb-2">
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Cobrado
            </span>
            <span className="text-base font-sora font-bold text-gray-900 tracking-tight">
              {formatPrice(ciclo.monto_cobrado)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Costo Op.
            </span>
            <span className="text-xs font-inter font-semibold text-gray-700">
              {formatPrice(ciclo.costo_operativo)}
            </span>
          </div>
        </div>

        {/* Selector de Estado de Cobro (Optimistic UI) + Botón Costos */}
        <div className="flex items-center gap-1.5 w-full">
          <select
            value={localStatus}
            disabled={isUpdatingStatus || isUnlocking}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`flex-1 h-8 px-2.5 rounded-full text-[11px] font-sora font-semibold border cursor-pointer focus:outline-none transition-colors truncate ${
              STATUS_BADGES[localStatus] || STATUS_BADGES.pendiente
            }`}
          >
            <option value="pendiente">Pendiente</option>
            {isDosPagos && <option value="primer_pago">1er Abono (50%)</option>}
            <option value="pagado">{isDosPagos ? "Pagado Completo" : "Pagado"}</option>
            <option value="vencido">Vencido</option>
          </select>

          <button
            type="button"
            onClick={() => onOpenFinanceModal && onOpenFinanceModal(ciclo, cliente.nombre)}
            className="h-8 px-3 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-[0.98]"
            title="Registrar o editar costos y comprobantes"
          >
            <Receipt className="w-3.5 h-3.5 text-gray-500" />
            <span>Costos</span>
          </button>
        </div>

        {/* HUB PERMANENTE DE COMPROBANTES HISTÓRICOS ACREDITADOS */}
        {hasApprovedReceipts && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {isComp1Aprobado && (
              <a
                href={comprobante1}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-all active:scale-[0.98]"
                title="Ver comprobante del 1er abono validado"
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                <span>1er Abono: Ver</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            {isComp2Aprobado && (
              <a
                href={comprobante2}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-all active:scale-[0.98]"
                title="Ver comprobante del 2do abono validado"
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                <span>2do Abono: Ver</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            {extraApprovedReceipts.map((p) => (
              <a
                key={p.id}
                href={p.comprobante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-all active:scale-[0.98]"
                title={`Ver comprobante de ${p.nombre || `Sesión #${p.numero_sesion}`}`}
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                <span>{p.nombre ? `${p.nombre}: Ver` : `Extra #${p.numero_sesion}: Ver`}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* Bloque de Verificación de Comprobante en Revisión o Desbloqueo */}
        {tieneComprobantePorRevisar ? (
          <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-sora font-bold text-gray-900 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                {isSegundoTramoPendiente ? "2do Abono recibido" : "Comprobante recibido"}
              </span>
              {onOpenReviewReceipt ? (
                <button
                  type="button"
                  onClick={() => onOpenReviewReceipt(ciclo)}
                  className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-brand-blue hover:underline cursor-pointer active:scale-[0.98] transition-all"
                >
                  <span>Revisar</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              ) : (
                activeComprobanteUrl && (
                  <a
                    href={activeComprobanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-brand-blue hover:underline active:scale-[0.98] transition-all"
                  >
                    <span>Ver archivo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                onClick={handleQuickUnlock}
                disabled={isUnlocking || isRejecting}
                className="flex-1 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-[10px] uppercase tracking-wider px-2 cursor-pointer shadow-none active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {isUnlocking ? "Validando..." : "Aprobar"}
              </Button>
              <button
                type="button"
                onClick={handleRejectReceipt}
                disabled={isUnlocking || isRejecting}
                title="Rechazar comprobante y liberar pre-reserva"
                className="h-7 px-2.5 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-sora font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
              >
                <XCircle className="w-3 h-3" />
                <span>Rechazar</span>
              </button>
            </div>
          </div>
        ) : (
          !estaCompletamentePagado && (
            <Button
              type="button"
              onClick={handleQuickUnlock}
              disabled={isUnlocking}
              className="w-full h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-[10px] uppercase tracking-wider px-3 shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate">
                {isUnlocking
                  ? "Desbloqueando..."
                  : isDosPagos
                  ? localStatus === "primer_pago"
                    ? "Validar 2do Abono (100%)"
                    : `Validar 1er Abono (${firstPaymentSessions} ses.)`
                  : "Validar Pago & Desbloquear"}
              </span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}
