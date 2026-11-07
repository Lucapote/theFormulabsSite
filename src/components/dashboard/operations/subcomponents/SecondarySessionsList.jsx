import { Plus, Video } from "lucide-react";
import ProductionSessionCapsule from "../ProductionSessionCapsule";

/**
 * SecondarySessionsList
 * Muestra las demás sesiones del ciclo como cápsulas compactas
 * junto con el botón de agregar rodaje adicional.
 */
export default function SecondarySessionsList({
  sessions = [],
  ciclo = {},
  clienteNombre = "Cliente",
  totalSessions = 1,
  estaPagado = false,
  onOpenModal = null,
  onOpenCreateProdModal = null
}) {
  return (
    <div className="pt-2 border-t border-gray-100 space-y-2 text-left font-inter">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-gray-400" />
          {sessions.length > 0
            ? `Otras sesiones del mes (${sessions.length})`
            : "Sesiones del mes"}
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

      {sessions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sessions.map((prod) => (
            <ProductionSessionCapsule
              key={prod.id}
              prod={prod}
              ciclo={ciclo}
              clienteNombre={clienteNombre}
              totalSessions={totalSessions}
              estaPagado={estaPagado}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">
          No hay más sesiones en este ciclo mensual.
        </p>
      )}
    </div>
  );
}

