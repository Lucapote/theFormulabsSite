import { useState, useEffect, useMemo } from "react";
import { FileCheck2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { validarPagoYDesbloquear, rechazarComprobanteCiclo } from "@/services/operationsService";
import ReceiptCycleSelectorList from "./subcomponents/ReceiptCycleSelectorList";
import ReceiptPreviewActionPanel from "./subcomponents/ReceiptPreviewActionPanel";

/**
 * PendingReceiptsReviewModal
 * Modal centralizado en dos columnas (Split View) para revisar y dictaminar
 * los comprobantes de pago subidos por los clientes en sus ciclos mensuales.
 * Estandarizado sobre BaseFormModal con alto estático de 95vh según GEMINI.md.
 */
export default function PendingReceiptsReviewModal({
  isOpen,
  onClose,
  pendingCycles = [],
  initialSelectedCicloId = null,
  onCycleUpdated
}) {
  const [selectedCicloId, setSelectedCicloId] = useState(initialSelectedCicloId);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialSelectedCicloId) {
      setSelectedCicloId(initialSelectedCicloId);
    } else if (pendingCycles.length > 0) {
      setSelectedCicloId(pendingCycles[0].id);
    }
  }, [initialSelectedCicloId, isOpen, pendingCycles]);

  const activeCiclo = useMemo(() => {
    if (!pendingCycles.length) return null;
    const found = pendingCycles.find((c) => c.id === selectedCicloId);
    return found || pendingCycles[0];
  }, [pendingCycles, selectedCicloId]);

  const cliente = activeCiclo?.cliente || {};
  const isDosPagos = cliente.esquema_pago === "dos_pagos";
  const producciones = activeCiclo?.producciones || [];
  const totalSessions = Math.max(1, cliente.producciones_por_mes || producciones.length || 1);
  const firstPaymentSessions = isDosPagos
    ? Math.min(
        totalSessions - 1,
        Math.max(1, cliente.sesiones_primer_pago || Math.floor(totalSessions / 2))
      )
    : totalSessions;

  const activeComprobanteUrl =
    isDosPagos && activeCiclo?.estado_pago === "primer_pago"
      ? activeCiclo.comprobante_2_url || activeCiclo.comprobante_url
      : activeCiclo?.comprobante_url || activeCiclo?.comprobante_2_url;

  const isPdf = Boolean(
    activeComprobanteUrl &&
    (activeComprobanteUrl.toLowerCase().includes(".pdf") || activeComprobanteUrl.toLowerCase().includes("pdf"))
  );
  const targetStatus = isDosPagos && activeCiclo?.estado_pago === "pendiente" ? "primer_pago" : "pagado";
  const labelAprobacion =
    targetStatus === "primer_pago"
      ? `Aprobar 1er Abono (${firstPaymentSessions} ses.)`
      : "Aprobar Pago Completo";

  const handleApprove = async () => {
    if (!activeCiclo || isProcessing) return;
    setIsProcessing(true);

    const prodParaNotificar =
      targetStatus === "pagado" && isDosPagos && producciones[firstPaymentSessions]
        ? producciones[firstPaymentSessions]
        : producciones[0] || null;

    const res = await validarPagoYDesbloquear({
      cicloId: activeCiclo.id,
      cliente,
      produccionPrincipal: prodParaNotificar,
      montoCobrado: activeCiclo.monto_cobrado,
      mes: activeCiclo.mes,
      anio: activeCiclo.anio,
      nuevoEstado: targetStatus
    });

    setIsProcessing(false);

    if (res.success) {
      toast.success(
        targetStatus === "primer_pago"
          ? `1er Abono validado. Se habilitaron ${firstPaymentSessions} sesión(es) para ${cliente.nombre || "el cliente"}.`
          : `Pago completo acreditado. Se confirmaron todas las sesiones de ${cliente.nombre || "el cliente"}.`
      );
      if (onCycleUpdated) onCycleUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo validar el pago.");
    }
  };

  const handleReject = async () => {
    if (!activeCiclo || isProcessing) return;
    setIsProcessing(true);

    const esSegundo = isDosPagos && activeCiclo.estado_pago === "primer_pago";
    const res = await rechazarComprobanteCiclo(activeCiclo.id, esSegundo);
    setIsProcessing(false);

    if (res.success) {
      toast.info(`Comprobante descartado para ${cliente.nombre || "el cliente"}. Pre-reserva liberada.`);
      if (onCycleUpdated) onCycleUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo rechazar el comprobante.");
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      icon={FileCheck2}
      title="Bandeja de Pagos por Validar"
      description="Auditoría y acreditación directa de comprobantes subidos por los clientes"
      badge={
        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[#188ff0] border border-blue-400/30 text-[11px] font-mono">
          {pendingCycles.length} {pendingCycles.length === 1 ? "pendiente" : "pendientes"}
        </span>
      }
      maxWidth="max-w-5xl"
      className="h-[95vh] max-h-[95vh] p-0"
      bodyClassName="p-0 max-h-none flex-1 overflow-hidden min-h-0 flex flex-col"
      showFooter={false}
    >
      {pendingCycles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/60">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-sora font-bold text-gray-900 text-base mb-1">
            ¡Al día! No hay comprobantes pendientes
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mb-6">
            Todos los comprobantes subidos por tus clientes para este periodo han sido validados o dictaminados.
          </p>
          <Button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-semibold uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all"
          >
            Cerrar Bandeja
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          <ReceiptCycleSelectorList
            pendingCycles={pendingCycles}
            activeCicloId={activeCiclo?.id}
            onSelectCiclo={setSelectedCicloId}
          />
          <ReceiptPreviewActionPanel
            activeCiclo={activeCiclo}
            activeComprobanteUrl={activeComprobanteUrl}
            isPdf={isPdf}
            labelAprobacion={labelAprobacion}
            isProcessing={isProcessing}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      )}
    </BaseFormModal>
  );
}
