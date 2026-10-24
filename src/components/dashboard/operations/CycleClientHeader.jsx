import { Calendar, ExternalLink, Plus, Settings, MapPin } from "lucide-react";

/**
 * CycleClientHeader
 * Subcomponente atómico para la Columna 1 de OperationsCycleCard.
 * Renderiza la identidad del cliente, badges operativos, días de corte y enlace al calendario.
 */
export default function CycleClientHeader({
  cliente = {},
  ciclo = {},
  cortesLabel = "",
  isDosPagos = false,
  firstPaymentSessions = 1,
  secondPaymentSessions = 0,
  onEditClient = null,
  onOpenCreateCalendar = null,
  onGoToCalendar = null
}) {
  const handleCalendarClick = (e) => {
    if (onGoToCalendar) {
      e.preventDefault();
      onGoToCalendar(ciclo.calendario);
    }
  };

  return (
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
              className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
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
          {Boolean(cliente.locacion_default) && (
            <span
              className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 inline-flex items-center gap-1 max-w-[150px] truncate"
              title={cliente.locacion_default}
            >
              <MapPin className="w-2.5 h-2.5 shrink-0 text-gray-400" />
              <span className="truncate">{cliente.locacion_default}</span>
            </span>
          )}
        </div>
      </div>

      {/* Calendario mensual asignado con navegación interactiva */}
      <div className="pt-1">
        {ciclo.calendario ? (
          <button
            type="button"
            onClick={handleCalendarClick}
            className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-brand-blue hover:text-blue-700 transition-all cursor-pointer active:scale-[0.98]"
            title="Ver calendario asignado en la pestaña de Calendarios"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">
              {ciclo.calendario.nombre || "Calendario Asignado"}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenCreateCalendar && onOpenCreateCalendar(cliente)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear calendario mensual</span>
          </button>
        )}
      </div>
    </div>
  );
}
