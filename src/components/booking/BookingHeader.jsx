import { Clapperboard } from "lucide-react";
import { getSessionTypeInfo } from "@/utils/bookingHelpers";

/**
 * Encabezado de la sesión de reserva (Tarjeta Clínica Unificada)
 * Renderiza la sección superior distintiva en celeste de laboratorio (#188ff0)
 * con soporte para sesiones regulares y extras con precio.
 */
export default function BookingHeader({
  sessionTitle = "",
  numeroSesion = 1,
  clienteNombre = "",
  empresa = "",
  tipo = "organica",
  duracionHoras = null,
  isExtraSession = false,
  precioExtra = null,
  valorMostrar = null,
  pagoAcreditado = false
}) {
  const finalPrice = valorMostrar !== null && valorMostrar !== undefined ? valorMostrar : precioExtra;
  const displayClient = clienteNombre;
  const typeInfo = getSessionTypeInfo(tipo, duracionHoras);
  const displaySession = sessionTitle || `Sesión #${numeroSesion}`;

  return (
    <div className="w-full bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-blue-50/90 border-b border-blue-100/80 p-5 sm:p-6 text-center select-none">
      <div className="flex items-center justify-center gap-1.5 flex-wrap mb-2">
        {isExtraSession ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-sora font-bold shadow-2xs">
            <span>{displaySession}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-brand-blue text-[11px] font-sora font-bold shadow-2xs">
            <Clapperboard className="w-3 h-3" />
            <span>{displaySession}</span>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
        {isExtraSession ? "Reserva de Sesión Extra" : "Reserva tu Fecha de Grabación"}
      </h1>

      {Boolean(finalPrice) && !pagoAcreditado && (
        <p className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight mt-1">
          Valor: ${Number(finalPrice).toLocaleString()}
        </p>
      )}

      {displayClient && (
        <p className="text-xs font-inter text-gray-600 mt-1 flex items-center justify-center gap-1.5">
          <Clapperboard className="w-3.5 h-3.5 text-[#ef18d6] shrink-0" />
          <span>
            Producción de Contenido para <strong className="text-gray-900 font-semibold">{displayClient}</strong>
          </span>
        </p>
      )}
    </div>
  );
}
