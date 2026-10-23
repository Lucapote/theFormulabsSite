import { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Receipt,
  Download,
  ExternalLink,
  Plus,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  Settings,
  FileCheck2,
  FileText,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateCicloFinanzas,
  validarPagoYDesbloquear,
  rechazarComprobanteCiclo
} from "@/services/operationsService";
import { formatPrice } from "@/utils/formatters";
import {
  getDefaultFirstPaymentSessions,
  checkProductionPaymentRisk
} from "@/utils/bookingHelpers";
import ProductionSessionCapsule from "./ProductionSessionCapsule";
import CreateProductionModal from "./CreateProductionModal";

const STATUS_BADGES = {
  pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  primer_pago: "bg-blue-50 text-brand-blue border-blue-200",
  vencido: "bg-rose-50 text-rose-700 border-rose-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200"
};

/**
 * OperationsCycleCard
 * Displays monthly operational cycle with client metadata, production sessions,
 * Gatekeeper status, persistent receipt hub, 24h risk alert, and financial metrics.
 */
export default function OperationsCycleCard({
  ciclo,
  onOpenProductionModal,
  onOpenFinanceModal,
  onStatusUpdated,
  onOpenCreateCalendar,
  onEditClient = null,
  onOpenReviewReceipt = null
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
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
  // Detectar si hay sesión en pre_reservada
  const preReservedSession = producciones.find((p) => p.estado === "pre_reservada");
  const hasPreReservedSession = Boolean(preReservedSession);

  // Comprobante activo para el tramo pendiente actual o sesión extra
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
    (p) => Boolean(p.comprobante_url) && p.comprobante_url !== comprobante1 && p.comprobante_url !== comprobante2 && p.estado === "agendada"
  );
  const hasApprovedReceipts = isComp1Aprobado || isComp2Aprobado || extraApprovedReceipts.length > 0;

  // Detectar si alguna sesión está en riesgo (<24h sin pago acreditado)
  const sesionesEnRiesgo = producciones.filter(
    (p) => checkProductionPaymentRisk(p, ciclo, cliente, totalSessions).enRiesgo
  );

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ciclo.estado_pago) return;
    setUpdatingStatus(true);
    const res = await updateCicloFinanzas(ciclo.id, {
      estado_pago: newStatus,
      comprobante_en_revision: false
    });
    setUpdatingStatus(false);
    if (res.success) {
      toast.success(`Estado de cobro actualizado a "${newStatus}".`);
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo actualizar el estado de pago.");
    }
  };

  const handleQuickUnlock = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    const targetStatus = isDosPagos && ciclo.estado_pago === "pendiente" ? "primer_pago" : "pagado";
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
    const esSegundo = isDosPagos && ciclo.estado_pago === "primer_pago";
    const res = await rechazarComprobanteCiclo(ciclo.id, esSegundo);
    setIsRejecting(false);

    if (res.success) {
      toast.info("Comprobante descartado y pre-reserva liberada.");
      if (onStatusUpdated) onStatusUpdated(res.data);
    } else {
      toast.error(res.error || "No se pudo rechazar el comprobante.");
    }
  };

  const cortesLabel = isDosPagos
    ? `Cortes: Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
    : `Corte: Día ${cliente.dia_corte_pago || 1}`;

  return (
    <div
      className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border transition-all ${
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
        {/* COL 1: Metadata del Cliente & Calendario (lg: col-span-4) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sora font-extrabold text-base md:text-lg text-gray-900 tracking-tight">
                {cliente.nombre || "Cliente Sin Nombre"}
              </h3>
              {onEditClient && (
                <button
                  type="button"
                  onClick={() => onEditClient(cliente)}
                  title="Configurar cliente (fechas de corte, esquema de pagos, locación)"
                  className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Badges operativos compactos */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-gray-600">
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                {cortesLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-brand-blue font-semibold">
                {cliente.tipo_sesion_default === "profesional"
                  ? "Profesional (6h)"
                  : "Orgánica (4h)"}
              </span>
              {isDosPagos && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                  Pagos: {firstPaymentSessions} + {secondPaymentSessions} ses.
                </span>
              )}
            </div>
          </div>

          {/* Calendario mensual asignado */}
          <div className="pt-1">
            {ciclo.calendario ? (
              <a
                href="/calendarios"
                className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-brand-blue hover:text-blue-700 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">
                  {ciclo.calendario.nombre || "Calendario Asignado"}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onOpenCreateCalendar && onOpenCreateCalendar(cliente)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear calendario mensual</span>
              </button>
            )}
          </div>
        </div>

        {/* COL 2: Producciones del Mes (lg: col-span-5) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  Rodajes ({producciones.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateProdModal(true)}
                  className="h-6 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-[10px] font-sora font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Agregar sesión de rodaje extra o reposición"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar Rodaje</span>
                </button>
              </div>

              {sesionesEnRiesgo.length > 0 ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">
                  <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                  <span>En riesgo (&lt;24h)</span>
                </div>
              ) : tieneComprobantePorRevisar ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold">
                  <FileCheck2 className="w-3 h-3 text-indigo-600" />
                  <span>
                    {isSegundoTramoPendiente ? "2do Abono en Revisión" : "Comprobante en Revisión"}
                  </span>
                </div>
              ) : ciclo.estado_pago === "pendiente" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-semibold">
                  <LockKeyhole className="w-3 h-3 text-amber-500" />
                  <span>Reserva Bloqueada</span>
                </div>
              ) : (
                isDosPagos &&
                ciclo.estado_pago === "primer_pago" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-[10px] font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    <span>
                      1er Pago Acreditado ({firstPaymentSessions}/{totalSessions} ses.)
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {producciones.map((prod) => (
                <ProductionSessionCapsule
                  key={prod.id}
                  prod={prod}
                  ciclo={ciclo}
                  clienteNombre={cliente.nombre}
                  totalSessions={producciones.length}
                  estaPagado={estaCompletamentePagado}
                  onOpenModal={onOpenProductionModal}
                />
              ))}

              {producciones.length === 0 && (
                <span className="text-xs text-gray-400 italic font-inter">
                  Sin sesiones configuradas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* COL 3: Finanzas, Hub de Comprobantes & Margen (lg: col-span-3) */}
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

            {/* Selector de Estado de Cobro + Botón Costos */}
            <div className="flex items-center gap-1.5 w-full">
              <select
                value={ciclo.estado_pago || "pendiente"}
                disabled={updatingStatus || isUnlocking}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`flex-1 h-8 px-2.5 rounded-full text-[11px] font-sora font-semibold border cursor-pointer focus:outline-none transition-colors truncate ${
                  STATUS_BADGES[ciclo.estado_pago] || STATUS_BADGES.pendiente
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
                className="h-8 px-3 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-sora font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Registrar o editar costos y comprobantes"
              >
                <Receipt className="w-3.5 h-3.5 text-gray-500" />
                <span>Costos</span>
              </button>
            </div>

            {/* HUB PERMANENTE DE COMPROBANTES HISTÓRICOS ACREDITADOS (Sin emojis) */}
            {hasApprovedReceipts && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {isComp1Aprobado && (
                  <a
                    href={comprobante1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-colors"
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
                    className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-colors"
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
                    className="h-6 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-sora font-semibold inline-flex items-center gap-1 transition-colors"
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
                      className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-brand-blue hover:underline cursor-pointer"
                    >
                      <span>Revisar</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ) : activeComprobanteUrl && (
                    <a
                      href={activeComprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-sora font-bold text-brand-blue hover:underline"
                    >
                      <span>Ver archivo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    onClick={handleQuickUnlock}
                    disabled={isUnlocking || isRejecting}
                    className="flex-1 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-[10px] uppercase tracking-wider px-2 cursor-pointer shadow-none"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {isUnlocking ? "Validando..." : "Aprobar"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleRejectReceipt}
                    disabled={isUnlocking || isRejecting}
                    title="Rechazar comprobante y liberar pre-reserva"
                    className="h-7 px-2.5 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-sora font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
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
                      ? ciclo.estado_pago === "primer_pago"
                        ? "Validar 2do Abono (100%)"
                        : `Validar 1er Abono (${firstPaymentSessions} ses.)`
                      : "Validar Pago & Desbloquear"}
                  </span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR NUEVA SESIÓN DE RODAJE */}
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
