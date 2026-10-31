import { Video, Plus, AlertTriangle, FileCheck2, LockKeyhole } from "lucide-react";
import ProductionSessionCapsule from "./ProductionSessionCapsule";

/**
 * CycleSessionsTrack
 * Subcomponente atómico para la Columna 2 de OperationsCycleCard.
 * Renderiza el encabezado de rodajes, estado del Gatekeeper y las cápsulas de producción.
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
  return (
    <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4 flex flex-col justify-between space-y-3">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-brand-blue" />
              Rodajes ({producciones.length})
            </span>
            {onOpenCreateProdModal && (
              <button
                type="button"
                onClick={onOpenCreateProdModal}
                className="h-6 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-[10px] font-sora font-bold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-[0.98]"
                title="Agregar sesión de rodaje extra o reposición"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Rodaje</span>
              </button>
            )}
          </div>

          {/* Estado de Seguridad / Gatekeeper */}
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

        {/* Grilla de cápsulas interactivas */}
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
  );
}
