import { CheckCircle2, FileCheck2, XCircle } from "lucide-react";
import CycleApprovedReceiptsBadges from "./CycleApprovedReceiptsBadges";

const STATUS_BADGES = {
  pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  primer_pago: "bg-blue-50 text-brand-blue border-blue-200",
  vencido: "bg-rose-50 text-rose-700 border-rose-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200"
};

/**
 * CyclePaymentVerificationBlock
 * Subcomponente atómico para el selector de estado y validación ágil de pagos.
 */
export default function CyclePaymentVerificationBlock({
  localStatus,
  isUpdatingStatus,
  isUnlocking,
  isRejecting,
  isDosPagos,
  firstPaymentSessions,
  estaCompletamentePagado,
  tieneComprobantePorRevisar,
  isSegundoTramoPendiente,
  hasApprovedReceipts,
  isComp1Aprobado,
  isComp2Aprobado,
  extraApprovedReceipts,
  comprobante1,
  comprobante2,
  ciclo,
  onStatusChange,
  onQuickUnlock,
  onRejectReceipt,
  onOpenReviewReceipt
}) {
  return (
    <div className="pt-1 space-y-2">
      <select
        value={localStatus}
        disabled={isUpdatingStatus || isUnlocking}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`w-full h-8 px-2.5 rounded-xl text-[11px] font-sora font-semibold border cursor-pointer focus:outline-none transition-colors truncate ${
          STATUS_BADGES[localStatus] || STATUS_BADGES.pendiente
        }`}
      >
        <option value="pendiente">Pago Pendiente</option>
        {isDosPagos && <option value="primer_pago">1er Abono (50%) Acreditado</option>}
        <option value="pagado">{isDosPagos ? "100% Pagado Completo" : "Pagado"}</option>
        <option value="vencido">Pago Vencido</option>
      </select>

      {/* Bloque Contextual de Comprobante o Acreditación */}
      {tieneComprobantePorRevisar ? (
        <div className="p-2 rounded-xl bg-blue-50/90 border border-blue-200 space-y-1.5">
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
              onClick={onQuickUnlock}
              className="flex-1 h-7 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-sora font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Aprobar</span>
            </button>
            <button
              type="button"
              disabled={isRejecting}
              onClick={onRejectReceipt}
              className="h-7 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-sora font-bold text-[10px] flex items-center justify-center cursor-pointer active:scale-95"
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
            onClick={onQuickUnlock}
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

      {/* Insignias de Comprobantes Históricos Acreditados */}
      {hasApprovedReceipts && (
        <CycleApprovedReceiptsBadges
          isComp1Aprobado={isComp1Aprobado}
          isComp2Aprobado={isComp2Aprobado}
          comprobante1={comprobante1}
          comprobante2={comprobante2}
          extraApprovedReceipts={extraApprovedReceipts}
        />
      )}
    </div>
  );
}

