import { useState } from "react";
import { getDefaultFirstPaymentSessions, checkProductionPaymentRisk } from "@/utils/bookingHelpers";
import CycleClientHeader from "./CycleClientHeader";
import CycleSessionsTrack from "./CycleSessionsTrack";
import CycleFinanceHub from "./CycleFinanceHub";
import CreateProductionModal from "./CreateProductionModal";

/**
 * OperationsCycleCard
 * Tarjeta de ciclo mensual operativa modularizada bajo SRP.
 * Ensambla CycleClientHeader, CycleSessionsTrack y CycleFinanceHub.
 */
export default function OperationsCycleCard({
  ciclo,
  onOpenProductionModal,
  onOpenFinanceModal,
  onStatusUpdated,
  onOpenCreateCalendar,
  onEditClient = null,
  onOpenReviewReceipt = null,
  onGoToCalendar = null
}) {
  const [showCreateProdModal, setShowCreateProdModal] = useState(false);

  const cliente = ciclo.cliente || {};
  const isDosPagos =
    cliente.esquema_pago === "quincenal" ||
    cliente.esquema_pago === "dos_pagos" ||
    Boolean(cliente.dia_corte_pago_2);
  const estaCompletamentePagado = ciclo.estado_pago === "pagado";
  const producciones = Array.isArray(ciclo.producciones)
    ? [...ciclo.producciones].sort((a, b) => a.numero_sesion - b.numero_sesion)
    : [];

  const totalSessions = Math.max(1, producciones.length || Number(cliente.producciones_por_mes) || 1);
  const firstPaymentSessions =
    isDosPagos && totalSessions >= 2
      ? Number(cliente.sesiones_primer_pago) || getDefaultFirstPaymentSessions(totalSessions)
      : totalSessions;
  const secondPaymentSessions = Math.max(0, totalSessions - firstPaymentSessions);

  // Comprobantes por tramo
  const comprobante1 = ciclo.comprobante_url || null;
  const comprobante2 = ciclo.comprobante_2_url || null;

  // Comprobante activo para el tramo pendiente actual
  const preReservedSession = producciones.find((p) => p.estado === "pre_reservada");
  const hasPreReservedSession = Boolean(preReservedSession);
  const isSegundoTramoPendiente = isDosPagos && ciclo.estado_pago === "primer_pago";
  const activeComprobanteUrl = preReservedSession?.comprobante_url
    ? preReservedSession.comprobante_url
    : isSegundoTramoPendiente
    ? comprobante2
    : comprobante1;

  // Hay comprobante por revisar si no está completamente pagado o hay sesión pre-reservada
  const tieneComprobantePorRevisar =
    Boolean(activeComprobanteUrl) &&
    (Boolean(ciclo.comprobante_en_revision) || hasPreReservedSession);

  // Estados de comprobantes históricos acreditados
  const isComp1Aprobado =
    Boolean(comprobante1) && ["primer_pago", "pagado"].includes(ciclo.estado_pago);
  const isComp2Aprobado =
    Boolean(comprobante2) && ciclo.estado_pago === "pagado";
  const extraApprovedReceipts = producciones.filter(
    (p) =>
      Boolean(p.comprobante_url) &&
      p.comprobante_url !== comprobante1 &&
      p.comprobante_url !== comprobante2 &&
      p.estado === "agendada"
  );
  const hasApprovedReceipts = isComp1Aprobado || isComp2Aprobado || extraApprovedReceipts.length > 0;

  // Detectar si alguna sesión está en riesgo (<24h sin pago acreditado)
  const sesionesEnRiesgo = producciones.filter(
    (p) => checkProductionPaymentRisk(p, ciclo, cliente, totalSessions).enRiesgo
  );

  const cortesLabel = isDosPagos
    ? `Cortes: Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
    : `Corte: Día ${cliente.dia_corte_pago || 1}`;

  return (
    <div
      className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border transition-all mb-4 ${
        sesionesEnRiesgo.length > 0
          ? "border-rose-300 ring-2 ring-rose-100 shadow-rose-100"
          : tieneComprobantePorRevisar
          ? "border-blue-300 ring-2 ring-blue-100 shadow-blue-50"
          : estaCompletamentePagado
          ? "border-emerald-200"
          : "border-gray-200"
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* COL 1: Metadata del Cliente & Calendario */}
        <CycleClientHeader
          cliente={cliente}
          ciclo={ciclo}
          cortesLabel={cortesLabel}
          isDosPagos={isDosPagos}
          firstPaymentSessions={firstPaymentSessions}
          secondPaymentSessions={secondPaymentSessions}
          onEditClient={onEditClient}
          onOpenCreateCalendar={onOpenCreateCalendar}
          onGoToCalendar={onGoToCalendar}
        />

        {/* COL 2: Producciones del Mes & Gatekeeper */}
        <CycleSessionsTrack
          producciones={producciones}
          ciclo={ciclo}
          cliente={cliente}
          firstPaymentSessions={firstPaymentSessions}
          totalSessions={totalSessions}
          isDosPagos={isDosPagos}
          sesionesEnRiesgo={sesionesEnRiesgo}
          tieneComprobantePorRevisar={tieneComprobantePorRevisar}
          isSegundoTramoPendiente={isSegundoTramoPendiente}
          estaCompletamentePagado={estaCompletamentePagado}
          onOpenProductionModal={onOpenProductionModal}
          onOpenCreateProdModal={() => setShowCreateProdModal(true)}
        />

        {/* COL 3: Finanzas, Optimistic UI & Hub de Comprobantes */}
        <CycleFinanceHub
          ciclo={ciclo}
          cliente={cliente}
          isDosPagos={isDosPagos}
          firstPaymentSessions={firstPaymentSessions}
          estaCompletamentePagado={estaCompletamentePagado}
          tieneComprobantePorRevisar={tieneComprobantePorRevisar}
          isSegundoTramoPendiente={isSegundoTramoPendiente}
          activeComprobanteUrl={activeComprobanteUrl}
          hasApprovedReceipts={hasApprovedReceipts}
          isComp1Aprobado={isComp1Aprobado}
          isComp2Aprobado={isComp2Aprobado}
          extraApprovedReceipts={extraApprovedReceipts}
          comprobante1={comprobante1}
          comprobante2={comprobante2}
          producciones={producciones}
          onOpenFinanceModal={onOpenFinanceModal}
          onOpenReviewReceipt={onOpenReviewReceipt}
          onStatusUpdated={onStatusUpdated}
        />
      </div>

      {/* Modal para agregar nueva sesión de rodaje */}
      <CreateProductionModal
        isOpen={showCreateProdModal}
        onClose={() => setShowCreateProdModal(false)}
        ciclo={ciclo}
        cliente={cliente}
        onCreated={() => {
          if (onStatusUpdated) onStatusUpdated();
        }}
      />
    </div>
  );
}
