import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Receipt, Download, ExternalLink, Plus, CheckCircle2, LockKeyhole, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCicloFinanzas, validarPagoYDesbloquear } from "@/services/operationsService";
import { formatPrice } from "@/utils/formatters";
import ProductionSessionCapsule from "./ProductionSessionCapsule";

const STATUS_BADGES = {
  pagado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  primer_pago: "bg-blue-50 text-brand-blue border-blue-200",
  vencido: "bg-rose-50 text-rose-700 border-rose-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200"
};

/**
 * OperationsCycleCard
 * Displays monthly operational cycle with client metadata, production sessions,
 * Gatekeeper status, quick unlock action, and financial metrics.
 */
export default function OperationsCycleCard({
  ciclo,
  onOpenProductionModal,
  onOpenFinanceModal,
  onStatusUpdated,
  onOpenCreateCalendar,
  onEditClient = null
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const cliente = ciclo.cliente || {};
  const isDosPagos =
    cliente.esquema_pago === "quincenal" ||
    cliente.esquema_pago === "dos_pagos" ||
    Boolean(cliente.dia_corte_pago_2);
  const estaCompletamentePagado = ciclo.estado_pago === "pagado";
  const producciones = Array.isArray(ciclo.producciones)
    ? [...ciclo.producciones].sort((a, b) => a.numero_sesion - b.numero_sesion)
    : [];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ciclo.estado_pago) return;
    setUpdatingStatus(true);
    const res = await updateCicloFinanzas(ciclo.id, { estado_pago: newStatus });
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
    const prodParaNotificar = targetStatus === "pagado" && isDosPagos && producciones[1]
      ? producciones[1]
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
      if (res.alreadyValidated) {
        toast.info("El ciclo ya contaba con este pago acreditado.");
      } else {
        toast.success(
          targetStatus === "primer_pago"
            ? "1er Abono (50%) confirmado. Primera sesión de rodaje desbloqueada."
            : "Pago completo acreditado. Todas las sesiones han sido desbloqueadas."
        );
      }
      if (onStatusUpdated) {
        onStatusUpdated(res.data || {
          ...ciclo,
          estado_pago: targetStatus,
          fecha_pago: new Date().toISOString().split("T")[0]
        });
      }
    } else {
      toast.error(res.error || "No se pudo desbloquear el ciclo.");
    }
  };

  const cortesLabel = isDosPagos
    ? `Cortes: Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
    : `Corte: Día ${cliente.dia_corte_pago || 1}`;

  return (
    <div className="bg-white border border-gray-100 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-4 sm:p-5 mb-3.5 font-inter">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* COL 1: Cliente & Contrato (lg: col-span-4) */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center gap-2">
            <h3 className="font-sora font-bold text-gray-900 text-base tracking-tight truncate">{cliente.nombre || "Cliente sin nombre"}</h3>
            {onEditClient && (
              <button type="button" onClick={() => onEditClient(cliente)} title="Editar configuración, retainer y locación del cliente" className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0">
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            {cliente.permite_descarga && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-pink-50 text-pink-600 border border-pink-100 shrink-0">
                <Download className="w-2.5 h-2.5" /> Descarga
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            {cliente.empresa && (
              <span className="font-medium text-gray-600 truncate max-w-[180px]">{cliente.empresa}</span>
            )}
            {onEditClient ? (
              <button
                type="button"
                onClick={() => onEditClient(cliente)}
                title="Clic para editar días de corte y retainer del cliente"
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer text-left"
              >
                {cortesLabel}
              </button>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {cortesLabel}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
              {cliente.tipo_sesion_default === "profesional" ? "Pro (6h)" : "Orgánica (4h)"}
            </span>
          </div>

          {/* Enlace al Calendario del Mes */}
          <div className="pt-1">
            {ciclo.calendario ? (
              <a href="/calendarios" className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-brand-blue hover:text-blue-700 transition-colors">
                <Calendar className="w-3.5 h-3.5" /><span className="truncate max-w-[200px]">{ciclo.calendario.nombre || "Calendario Asignado"}</span><ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <button type="button" onClick={() => onOpenCreateCalendar && onOpenCreateCalendar(cliente)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer">
                <Plus className="w-3 h-3" /> Crear calendario mensual
              </button>
            )}
          </div>
        </div>

        {/* COL 2: Producciones del Mes (lg: col-span-5) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
            <div className="text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-blue" />
              Rodajes ({producciones.length})
            </div>
            {ciclo.estado_pago === "pendiente" && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-semibold">
                <LockKeyhole className="w-3 h-3 text-amber-500" />
                <span>Reserva Bloqueada (Pago Pendiente)</span>
              </div>
            )}
            {isDosPagos && ciclo.estado_pago === "primer_pago" && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                <span>1er Pago Acreditado (50%)</span>
              </div>
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

        {/* COL 3: Finanzas & Margen (lg: col-span-3) */}
        <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end gap-2.5">
          <div className="text-left lg:text-right w-full">
            <div className="text-lg font-sora font-bold text-gray-900 tracking-tight">
              {formatPrice(ciclo.monto_cobrado)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Costo: <span className="font-semibold text-gray-700">{formatPrice(ciclo.costo_operativo)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full justify-start lg:justify-end">
            <select
              value={ciclo.estado_pago || "pendiente"}
              disabled={updatingStatus || isUnlocking}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`h-8 px-2.5 rounded-full text-xs font-sora font-semibold border cursor-pointer focus:outline-none transition-colors ${
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
              className="h-8 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-sora font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Registrar o editar costos y comprobante"
            >
              <Receipt className="w-3.5 h-3.5 text-gray-600" />
              <span>Costos</span>
            </button>
          </div>

          {/* Botón Rápido Gatekeeper: Validar Pago & Desbloquear */}
          {!estaCompletamentePagado && (
            <Button
              type="button"
              onClick={handleQuickUnlock}
              disabled={isUnlocking}
              className="w-full mt-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-[11px] uppercase tracking-wider py-1.5 px-3.5 shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUnlocking ? "Desbloqueando..." : isDosPagos ? (ciclo.estado_pago === "primer_pago" ? "Validar 2do Abono (100%)" : "Validar 1er Abono (50%)") : "Validar Pago & Desbloquear"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
