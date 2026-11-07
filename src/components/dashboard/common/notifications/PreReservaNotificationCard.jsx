import { Calendar, ArrowRight } from "lucide-react";

/**
 * PreReservaNotificationCard
 * Tarjeta para solicitudes de pre-reserva de rodaje que requieren validación en Operaciones.
 */
export default function PreReservaNotificationCard({ prod, onGoToOperations }) {
  const clienteNombre = prod.clientes?.nombre || "Cliente";

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-2.5 transition-all hover:border-amber-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <span className="font-sora font-bold text-xs text-gray-900 block truncate max-w-[200px]">
              {clienteNombre}
            </span>
            <span className="text-[10px] text-gray-400 font-inter">
              Sesión #{prod.numero_sesion} • Solicitud de Rodaje
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-sora font-bold text-[9px] uppercase tracking-wider shrink-0">
          Pre-Reserva
        </span>
      </div>

      <p className="text-[11px] text-gray-600 font-inter leading-relaxed">
        El cliente agendó y adjuntó su comprobante de pago. Requiere tu validación para confirmarse.
      </p>

      <div className="flex items-center justify-end pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={onGoToOperations}
          className="h-7 px-3.5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>Validar en Operaciones</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

