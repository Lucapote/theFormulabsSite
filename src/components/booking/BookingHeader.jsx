import { Clapperboard, Sparkles, Clock } from "lucide-react";

/**
 * Encabezado de la sesión de reserva
 * Muestra el badge de sesión, tipo de rodaje (4h vs 6h) y cliente.
 */
export default function BookingHeader({
  sessionTitle = "",
  numeroSesion = 1,
  clienteNombre = "",
  empresa = "",
  tipo = "organica",
  duracionHoras = null
}) {
  const displayClient = empresa ? `${clienteNombre} (${empresa})` : clienteNombre;
  const isProfesional = tipo === "profesional" || duracionHoras === 6;
  const durationLabel = isProfesional ? "Profesional • 6h de levantamiento" : "Orgánica • 4h de levantamiento";
  const displaySession = sessionTitle || `Sesión #${numeroSesion}`;

  return (
    <div className="w-full max-w-xl mx-auto mb-6 text-center">
      <div className="flex items-center justify-center gap-2 flex-wrap mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-sora font-semibold">
          <Clapperboard className="w-3.5 h-3.5" />
          <span>{displaySession}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-sora font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{durationLabel}</span>
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-sora font-bold text-gray-900 tracking-tight">
        Reserva tu Fecha de Grabación
      </h1>

      {displayClient && (
        <p className="text-xs sm:text-sm font-inter text-gray-500 mt-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Producción de Contenido para <strong className="text-gray-800">{displayClient}</strong></span>
        </p>
      )}
    </div>
  );
}
