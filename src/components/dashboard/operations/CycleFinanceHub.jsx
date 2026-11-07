import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Receipt,
  CheckCircle2,
  FileCheck2,
  XCircle,
  CreditCard
} from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import CycleApprovedReceiptsBadges from "./subcomponents/CycleApprovedReceiptsBadges";
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
 * Subcomponente para la Columna 3 (Logística de Pago).
 * Enfocado en fechas de corte/vencimiento y validación ágil de comprobantes,
 * manteniendo las métricas contables discretas y subordinadas a la operación.
 */
export default function CycleFinanceHub({
  ciclo = {},
  cliente = {},
  isDosPagos = false,
  firstPaymentSessions = 1,
  estaCompletamentePagado = false,
  tieneComprobantePorRevisar = false,
  isSegundoTramoPendiente = false,
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
  const [localStatus, setLocalStatus] = useState(ciclo.estado_pago || "pendiente");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    setLocalStatus(ciclo.estado_pago || "pendiente");
  }, [ciclo.estado_pago]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === localStatus) return;
    const previousStatus = localStatus;
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
      cicloId: ciclo.id, cliente, produccionPrincipal: prodParaNotificar,
      montoCobrado: ciclo.monto_cobrado, mes: ciclo.mes, anio: ciclo.anio, nuevoEstado: targetStatus
    });
    setIsUnlocking(false);

    if (res.success) {
      setLocalStatus(targetStatus);
      toast.success(targetStatus === "primer_pago" ? "1er Abono confirmado." : "Pago completo acreditado.");
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo desbloquear el ciclo.");
    }
  };

  const handleRejectReceipt = async () => {
    if (isRejecting) return;
    setIsRejecting(true);
    const res = await rechazarComprobanteCiclo(ciclo.id, isDosPagos && localStatus === "primer_pago");
    setIsRejecting(false);
    if (res.success) {
      toast.info("Comprobante descartado.");
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo rechazar.");
    }
  };

  const corteLabel = isDosPagos
    ? `Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
    : `Día ${cliente.dia_corte_pago || 1} del mes`;

  return (
    <div className="lg:col-span-3 flex flex-col justify-between space-y-3 font-inter text-left">
      <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-2.5 shadow-2xs">
        {/* Cabecera: Fecha de Corte y Próximo Pago */}
        <div className="flex items-center justify-between gap-1.5 border-b border-gray-200/60 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block font-semibold leading-tight">
                Fecha de Pago / Corte
              </span>
              <span className="text-xs font-sora font-bold text-gray-900 truncate block">
                {corteLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenFinanceModal?.(ciclo, cliente.nombre)}
            className="h-7 px-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-sora font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Registrar o editar costos y comprobantes"
          >
            <Receipt className="w-3 h-3 text-gray-400" />
            <span>Costos</span>
          </button>
        </div>

        {/* Selector de Estado Discreto */}
        <div className="flex items-center gap-2">
          <select
            value={localStatus}
            disabled={isUpdatingStatus || isUnlocking}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`w-full h-8 px-2.5 rounded-xl text-[11px] font-sora font-semibold border cursor-pointer focus:outline-none transition-colors truncate ${
              STATUS_BADGES[localStatus] || STATUS_BADGES.pendiente
            }`}
          >
            <option value="pendiente">Pago Pendiente</option>
            {isDosPagos && <option value="primer_pago">1er Abono (50%) Acreditado</option>}
            <option value="pagado">{isDosPagos ? "100% Pagado Completo" : "Pagado"}</option>
            <option value="vencido">Pago Vencido</option>
          </select>
        </div>

        {/* Bloque de Comprobante por Revisar */}
        {tieneComprobantePorRevisar ? (
          <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-sora font-bold text-gray-900 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                {isSegundoTramoPendiente ? "2do Abono recibido" : "Comprobante recibido"}
              </span>
              {onOpenReviewReceipt && (
                <button
                  type="button"
                  onClick={() => onOpenReviewReceipt(ciclo)}
                  className="text-[10px] font-sora font-bold text-brand-blue hover:underline cursor-pointer"
                >
                  Ver
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isUnlocking}
                onClick={handleQuickUnlock}
                className="flex-1 h-7.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-sora font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Aprobar</span>
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleRejectReceipt}
                className="h-7.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-sora font-bold text-[10px] flex items-center justify-center cursor-pointer active:scale-95"
                title="Rechazar comprobante"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          !estaCompletamentePagado && (
            <button
              type="button"
              disabled={isUnlocking}
              onClick={handleQuickUnlock}
              className="w-full h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-sora font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isDosPagos && localStatus === "pendiente"
                  ? `Validar 1er Abono (${firstPaymentSessions} ses.)`
                  : "Acreditar Pago"}
              </span>
            </button>
          )
        )}

        {/* Comprobantes históricos validados */}
        {hasApprovedReceipts && (
          <CycleApprovedReceiptsBadges
            isComp1Aprobado={isComp1Aprobado}
            isComp2Aprobado={isComp2Aprobado}
            comprobante1={comprobante1}
            comprobante2={comprobante2}
            extraApprovedReceipts={extraApprovedReceipts}
          />
        )}

        {/* Métricas contables subordinadas (secundarias) */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 text-gray-500">
          <span>
            Cobrado: <strong className="text-gray-900 font-semibold">{formatPrice(ciclo.monto_cobrado)}</strong>
          </span>
          <span>
            Costo: <strong className="text-gray-700 font-medium">{formatPrice(ciclo.costo_operativo)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
