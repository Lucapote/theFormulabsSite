import { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Link2,
  Receipt,
  Download,
  ExternalLink,
  Plus,
  Check,
  Clock,
  Sparkles,
  Settings
} from "lucide-react";
import { updateCicloFinanzas } from "@/services/operationsService";
import { getSessionDisplayName, getBookingUrl } from "@/utils/formatters";

export default function OperationsCycleCard({
  ciclo,
  onOpenProductionModal,
  onOpenFinanceModal,
  onStatusUpdated,
  onOpenCreateCalendar,
  onEditClient = null
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const cliente = ciclo.cliente || {};
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

  const copyProductionLink = (e, token) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Esta sesión no cuenta con token de reserva.");
      return;
    }
    const url = getBookingUrl(token);
    navigator.clipboard.writeText(url);
    toast.success("Enlace de reserva copiado al portapapeles.");
  };

  const openProductionLink = (e, token) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Esta sesión no cuenta con token de reserva.");
      return;
    }
    const url = getBookingUrl(token);
    window.open(url, "_blank");
  };

  const formatSessionDate = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(Number(val) || 0);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pagado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "vencido":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-4 sm:p-5 mb-3.5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* COL 1: Cliente & Contrato (lg: col-span-4) */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center gap-2">
            <h3 className="font-sora font-bold text-gray-900 text-base tracking-tight truncate">
              {cliente.nombre || "Cliente sin nombre"}
            </h3>
            {onEditClient && (
              <button
                type="button"
                onClick={() => onEditClient(cliente)}
                title="Editar configuración, retainer y locación del cliente"
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              >
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
              <span className="font-inter font-medium text-gray-600 truncate max-w-[180px]">
                {cliente.empresa}
              </span>
            )}
            {onEditClient ? (
              <button
                type="button"
                onClick={() => onEditClient(cliente)}
                title="Clic para editar días de corte y retainer del cliente"
                className="px-2.5 py-0.5 rounded-full text-[10px] font-inter font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer text-left"
              >
                {cliente.esquema_pago === "dos_pagos" || cliente.esquema_pago === "quincenal" || cliente.dia_corte_pago_2
                  ? `Cortes: Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
                  : `Corte: Día ${cliente.dia_corte_pago || 1}`}
              </button>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-inter font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {cliente.esquema_pago === "dos_pagos" || cliente.esquema_pago === "quincenal" || cliente.dia_corte_pago_2
                  ? `Cortes: Días ${cliente.dia_corte_pago || 1} y ${cliente.dia_corte_pago_2 || 15}`
                  : `Corte: Día ${cliente.dia_corte_pago || 1}`}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
              {cliente.tipo_sesion_default === "profesional" ? "Pro (6h)" : "Orgánica (4h)"}
            </span>
          </div>

          {/* Enlace al Calendario del Mes */}
          <div className="pt-1">
            {ciclo.calendario ? (
              <a
                href={`/calendarios`}
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
                <Plus className="w-3 h-3" /> Crear calendario mensual
              </button>
            )}
          </div>
        </div>

        {/* COL 2: Producciones del Mes (lg: col-span-5) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
          <div className="text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-blue" />
            Rodajes ({producciones.length})
          </div>

          <div className="flex flex-wrap gap-2">
            {producciones.map((prod) => {
              const isScheduled = prod.estado === "agendada";
              const isCompleted = ["rodaje_completado", "en_edicion", "finalizada"].includes(prod.estado);
              const dateText = formatSessionDate(prod.fecha_produccion);
              const sessionTitle = getSessionDisplayName(prod, ciclo.mes, producciones.length);

              return (
                <div
                  key={prod.id}
                  onClick={() => onOpenProductionModal && onOpenProductionModal(prod, cliente.nombre, ciclo)}
                  className={`group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isCompleted
                      ? "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
                      : isScheduled
                      ? "bg-blue-50 text-brand-blue border-blue-200 hover:bg-blue-100"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                  title={`${sessionTitle} • Clic para gestionar detalles`}
                >
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

                  {prod.token_reserva && (
                    <div className="flex items-center gap-0.5 ml-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => copyProductionLink(e, prod.token_reserva)}
                        title="Copiar link de reserva"
                        className="p-1 rounded-full hover:bg-white/80 text-gray-500 hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        <Link2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openProductionLink(e, prod.token_reserva)}
                        title="Abrir auto-reserva en nueva pestaña"
                        className="p-1 rounded-full hover:bg-white/80 text-gray-500 hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {producciones.length === 0 && (
              <span className="text-xs text-gray-400 italic font-inter">
                Sin sesiones configuradas
              </span>
            )}
          </div>
        </div>

        {/* COL 3: Finanzas & Margen (lg: col-span-3) */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-3">
          <div className="text-left lg:text-right w-full sm:w-auto">
            <div className="text-lg font-sora font-bold text-gray-900 tracking-tight">
              {formatCurrency(ciclo.monto_cobrado)}
            </div>
            <div className="text-xs font-inter text-gray-500 mt-0.5">
              Costo: <span className="font-semibold text-gray-700">{formatCurrency(ciclo.costo_operativo)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {/* Selector rápido de estado de pago */}
            <select
              value={ciclo.estado_pago || "pendiente"}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`h-8 px-2.5 rounded-full text-xs font-sora font-semibold border cursor-pointer focus:outline-none transition-colors ${getStatusBadgeClass(
                ciclo.estado_pago
              )}`}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>

            {/* Botón Editar Finanzas y Costos */}
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
        </div>
      </div>
    </div>
  );
}
