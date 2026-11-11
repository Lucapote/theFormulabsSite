import {
  Clapperboard,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  ListTodo
} from "lucide-react";

function getProductionStatusBadge(estado) {
  switch (estado) {
    case "fecha_agendada":
      return {
        label: "Fecha Confirmada",
        dotClass: "bg-blue-500",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
      };
    case "rodaje_completado":
      return {
        label: "Rodaje Completado",
        dotClass: "bg-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
      };
    case "en_edicion":
      return {
        label: "En Edición",
        dotClass: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
      };
    case "finalizada":
      return {
        label: "Finalizada",
        dotClass: "bg-purple-500",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200"
      };
    default:
      return {
        label: "Pendiente",
        dotClass: "bg-rose-500",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200"
      };
  }
}

export default function HomeProductionsAgenda({
  productions = [],
  onSelectProduction,
  onNavigateToOperations
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col font-inter">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sora font-extrabold text-base text-gray-900 tracking-tight">
              Rodajes y Logística ({productions.length})
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Sesiones en set o locación programadas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToOperations}
          className="text-xs font-sora font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Ir a Operaciones</span>
        </button>
      </div>

      {/* Productions List */}
      {productions.length === 0 ? (
        <div className="py-12 text-center my-auto">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-sora font-bold text-gray-900 text-sm mb-1">
            Sin rodajes programados
          </h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
            No hay sesiones de grabación ni llamados a set asignados para esta fecha.
          </p>
          <button
            type="button"
            onClick={onNavigateToOperations}
            className="h-9 px-4 bg-gray-900 hover:bg-black text-white font-sora font-bold text-xs rounded-full shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            Ver Calendario de Rodajes
          </button>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {productions.map((prod) => {
            const statusInfo = getProductionStatusBadge(prod.estado);
            const clienteNombre = prod.cliente?.nombre || prod.nombre_cliente || "Cliente";
            const locacion = prod.locacion || prod.cliente?.locacion_default || "Locación no especificada";

            const timeRange = (prod.hora_inicio || prod.hora_fin)
              ? `${prod.hora_inicio ? prod.hora_inicio.slice(0, 5) : "--:--"} - ${prod.hora_fin ? prod.hora_fin.slice(0, 5) : "--:--"} hrs`
              : "Horario por definir";

            // Checklist requirements count
            const reqTotal = Array.isArray(prod.requerimientos_checklist) ? prod.requerimientos_checklist.length : 0;
            const reqDone = reqTotal > 0 ? prod.requerimientos_checklist.filter((r) => r.completado).length : 0;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduction(prod)}
                className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 bg-gray-50/50 hover:bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group"
              >
                {/* Header row: time badge & status badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-blue" />
                    <span className="font-mono text-xs font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {timeRange}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase border ${statusInfo.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                    {statusInfo.label}
                  </span>
                </div>

                {/* Client & Session Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sora font-extrabold text-sm text-gray-900 truncate">
                      {clienteNombre}
                    </h4>
                    <span className="text-[10px] font-sora font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                      Sesión #{prod.numero_sesion || 1} • {prod.tipo_sesion || "Orgánica"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{locacion}</span>
                  </div>
                </div>

                {/* Checklist Summary & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  {reqTotal > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                      <ListTodo className="w-3.5 h-3.5 text-gray-400" />
                      Requerimientos: <strong className="font-sora">{reqDone}/{reqTotal}</strong> listos
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">
                      Sin requerimientos especiales
                    </span>
                  )}

                  <span className="text-xs font-sora font-bold text-brand-blue group-hover:text-blue-700 flex items-center gap-0.5">
                    Ficha de Logística <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
