import { CheckCircle2, Calendar, MapPin, Sparkles, RefreshCw } from "lucide-react";

export default function BookingSuccessCard({
  produccion = {},
  onReschedule
}) {
  const formatDateTime = (isoStr) => {
    if (!isoStr) return "Fecha confirmada";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(isoStr);
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-xl mx-auto text-center">
      {/* Icono de Éxito con Glow */}
      <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-medium border border-emerald-100 mb-2">
        <Sparkles className="w-3 h-3 text-emerald-600" />
        <span>Estado: Agendada</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-sora font-bold text-gray-900 tracking-tight mb-2">
        ¡Fecha Agendada con Éxito!
      </h2>

      <p className="text-xs sm:text-sm font-inter text-gray-500 max-w-md mx-auto mb-6">
        El equipo de producción de <strong>The Formulab</strong> ya tiene tu fecha en calendario. Nos vemos pronto para crear contenido increíble.
      </p>

      {/* Tarjeta Resumen */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Día y Hora del Rodaje
            </span>
            <span className="text-xs sm:text-sm font-sora font-bold text-gray-900 capitalize">
              {formatDateTime(produccion.fecha_produccion)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-gray-200/60">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
              Locación Confirmada
            </span>
            <span className="text-xs sm:text-sm font-inter text-gray-800">
              {produccion.locacion || "Locación a convenir con el equipo"}
            </span>
          </div>
        </div>
      </div>

      {onReschedule && (
        <button
          type="button"
          onClick={onReschedule}
          className="inline-flex items-center gap-1.5 text-xs font-sora font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>¿Necesitas modificar la fecha o locación?</span>
        </button>
      )}
    </div>
  );
}
