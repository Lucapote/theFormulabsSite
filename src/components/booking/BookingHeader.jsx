import { Clapperboard, Sparkles } from "lucide-react";

/**
 * Encabezado de la página de reserva pública
 * Logo de The Formulab + Badge de Sesión + Indicador de Cliente
 */
export default function BookingHeader({ numeroSesion = 1, clienteNombre = "", empresa = "" }) {
  const displayClient = empresa ? `${clienteNombre} (${empresa})` : clienteNombre;

  return (
    <header className="w-full max-w-xl mx-auto mb-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <a href="/" className="inline-flex items-center">
          <img
            src="/logo.png"
            alt="The Formulab"
            className="h-9 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </a>
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-sora font-semibold uppercase tracking-wider mb-2">
        <Clapperboard className="w-3.5 h-3.5" />
        <span>Sesión de Rodaje #{numeroSesion}</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-sora font-bold text-gray-900 tracking-tight">
        Reserva tu Fecha de Grabación
      </h1>

      {displayClient && (
        <p className="text-xs sm:text-sm font-inter text-gray-500 mt-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-magenta" />
          <span>Producción de Contenido para <strong className="text-gray-800">{displayClient}</strong></span>
        </p>
      )}
    </header>
  );
}
