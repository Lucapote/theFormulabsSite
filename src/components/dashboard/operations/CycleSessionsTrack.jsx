import { AlertTriangle, FileCheck2 } from "lucide-react";
import { getClosestUpcomingSession } from "@/utils/bookingHelpers";
import UpcomingProductionSpotlight from "./subcomponents/UpcomingProductionSpotlight";
import SecondarySessionsList from "./subcomponents/SecondarySessionsList";

/**
 * CycleSessionsTrack
 * Columna central (Mission Control Operativo) de OperationsCycleCard.
 * Destaca la sesión más cercana a filmar con sus requerimientos y fecha,
 * relegando las sesiones secundarias a una fila compacta.
 */
export default function CycleSessionsTrack({
  producciones = [],
  ciclo = {},
  cliente = {},
  firstPaymentSessions = 1,
  totalSessions = 1,
  isDosPagos = false,
  sesionesEnRiesgo = [],
  tieneComprobantePorRevisar = false,
  isSegundoTramoPendiente = false,
  estaCompletamentePagado = false,
  onOpenProductionModal = null,
  onOpenCreateProdModal = null
}) {
  const { upcomingSession, otherSessions } = getClosestUpcomingSession(producciones);

  return (
    <div className="lg:col-span-8 flex flex-col justify-between space-y-3 font-inter">
      {/* Alertas de Riesgo Operativo o Comprobantes en Revisión */}
      {(sesionesEnRiesgo.length > 0 || tieneComprobantePorRevisar) && (
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
          {sesionesEnRiesgo.length > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">
              <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
              <span>En riesgo (&lt;24h sin pago acreditado)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold">
              <FileCheck2 className="w-3 h-3 text-indigo-600" />
              <span>
                {isSegundoTramoPendiente ? "2do Abono en Revisión" : "Comprobante en Revisión"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hero Card: La Próxima Sesión */}
      {upcomingSession ? (
        <UpcomingProductionSpotlight
          prod={upcomingSession}
          ciclo={ciclo}
          cliente={cliente}
          onOpenModal={onOpenProductionModal}
        />
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center space-y-2">
          <p className="text-xs text-gray-500 font-inter">
            No hay sesiones de rodaje configuradas para este mes.
          </p>
          {onOpenCreateProdModal && (
            <button
              type="button"
              onClick={onOpenCreateProdModal}
              className="h-8 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-sora font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Crear primera sesión</span>
            </button>
          )}
        </div>
      )}

      {/* Otras sesiones del ciclo (si existen) */}
      <SecondarySessionsList
        sessions={otherSessions}
        ciclo={ciclo}
        clienteNombre={cliente.nombre}
        totalSessions={totalSessions}
        estaPagado={estaCompletamentePagado}
        onOpenModal={onOpenProductionModal}
        onOpenCreateProdModal={onOpenCreateProdModal}
      />
    </div>
  );
}
