import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  ExternalLink,
  Plus,
  Settings,
  Receipt
} from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import CyclePaymentVerificationBlock from "./subcomponents/CyclePaymentVerificationBlock";
import {
  updateCicloFinanzas,
  validarPagoYDesbloquear,
  rechazarComprobanteCiclo
} from "@/services/operationsService";

/**
 * CycleClientPanel
 * Columna 1 consolidada (Administración, Identidad y Finanzas) de OperationsCycleCard.
 * Unifica la información del cliente, selector de estado de pago, validación ágil y acceso al calendario.
 */
export default function CycleClientPanel({
  cliente = {},
  ciclo = {},
  cortesLabel = "",
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
  onEditClient = null,
  onOpenFinanceModal = null,
  onOpenReviewReceipt = null,
  onStatusUpdated = null,
  onOpenCreateCalendar = null,
  onGoToCalendar = null
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
      toast.success(`Estado de pago actualizado a ${newStatus}`);
      onStatusUpdated?.();
    } else {
      setLocalStatus(previousStatus);
      toast.error(res.error || "Error al actualizar estado");
    }
  };

  const handleQuickUnlock = async () => {
    setIsUnlocking(true);
    const res = await validarPagoYDesbloquear(ciclo.id, ciclo);
    setIsUnlocking(false);

    if (res.success) {
      toast.success(res.message || "Pago acreditado correctamente");
      onStatusUpdated?.();
    } else {
      toast.error(res.error || "No se pudo acreditar el pago");
    }
  };

  const handleRejectReceipt = async () => {
    if (!window.confirm("¿Rechazar comprobante y solicitar nuevo al cliente?")) return;
    setIsRejecting(true);
    const res = await rechazarComprobanteCiclo(ciclo.id);
    setIsRejecting(false);

    if (res.success) {
      toast.success("Comprobante rechazado");
      onStatusUpdated?.();
    } else {
      toast.error(res.error || "Error al rechazar comprobante");
    }
  };

  const handleCalendarClick = (e) => {
    if (onGoToCalendar) {
      e.preventDefault();
      onGoToCalendar(ciclo.calendario);
    }
  };

  return (
    <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-5 flex flex-col justify-between space-y-3 font-inter text-left">
      <div className="space-y-2.5">
        {/* Cabecera: Nombre de la Empresa, Configuración y Botón de Costos */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-sora font-extrabold text-base md:text-lg text-gray-900 tracking-tight truncate">
              {cliente.nombre || "Cliente Sin Nombre"}
            </h3>
            {onEditClient && (
              <button
                type="button"
                onClick={() => onEditClient(cliente)}
                title="Configurar cliente (fechas de corte, esquema de pagos, locación)"
                className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer active:scale-[0.98] shrink-0"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onOpenFinanceModal && (
            <button
              type="button"
              onClick={() => onOpenFinanceModal(ciclo)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Ver desglose financiero y costos operativos"
            >
              <Receipt className="w-3 h-3 text-gray-500" />
              <span>Costos</span>
            </button>
          )}
        </div>

        {/* Datos Ordenados: Fecha de Corte y Modalidad de Sesión */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-gray-600">
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
            {cortesLabel}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-brand-blue font-semibold">
            {cliente.tipo_sesion_default === "profesional"
              ? "Profesional (6h)"
              : "Orgánica (4h)"}
          </span>
        </div>

        {/* Selector de Estado y Validación Ágil de Pagos */}
        <CyclePaymentVerificationBlock
          localStatus={localStatus}
          isUpdatingStatus={isUpdatingStatus}
          isUnlocking={isUnlocking}
          isRejecting={isRejecting}
          isDosPagos={isDosPagos}
          firstPaymentSessions={firstPaymentSessions}
          estaCompletamentePagado={estaCompletamentePagado}
          tieneComprobantePorRevisar={tieneComprobantePorRevisar}
          isSegundoTramoPendiente={isSegundoTramoPendiente}
          hasApprovedReceipts={hasApprovedReceipts}
          isComp1Aprobado={isComp1Aprobado}
          isComp2Aprobado={isComp2Aprobado}
          extraApprovedReceipts={extraApprovedReceipts}
          comprobante1={comprobante1}
          comprobante2={comprobante2}
          ciclo={ciclo}
          onStatusChange={handleStatusChange}
          onQuickUnlock={handleQuickUnlock}
          onRejectReceipt={handleRejectReceipt}
          onOpenReviewReceipt={onOpenReviewReceipt}
        />
      </div>

      {/* Pie: Métricas Contables Discretas y Acceso al Calendario */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-inter">
          <span>
            Cobrado: <strong className="text-gray-900 font-semibold">{formatPrice(ciclo.monto_cobrado)}</strong>
          </span>
          <span>
            Costo Op: <strong className="text-gray-700 font-medium">{formatPrice(ciclo.costo_operativo)}</strong>
          </span>
        </div>

        {ciclo.calendario ? (
          <button
            type="button"
            onClick={handleCalendarClick}
            className="w-full px-3 py-1.5 rounded-xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100 text-brand-blue text-xs font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span className="truncate">Ver calendario mensual</span>
            <ExternalLink className="w-3 h-3 ml-auto text-brand-blue/70 shrink-0" />
          </button>
        ) : (
          onOpenCreateCalendar && (
            <button
              type="button"
              onClick={() => onOpenCreateCalendar(ciclo)}
              className="w-full px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-sora font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear calendario mensual</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
