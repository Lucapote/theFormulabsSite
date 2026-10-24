import { Sparkles, ArrowRight } from "lucide-react";

/**
 * ActionableEmptyState
 * Componente canónico de estado vacío que erradica los "callejones sin salida".
 * Responde siempre a:
 * 1. ¿Por qué está vacío? (Contexto claro)
 * 2. ¿Cuál es el beneficio de crearlo? (Propuesta de valor)
 * 3. ¿Cuál es el siguiente paso directo? (Botón CTA con foco de acción)
 */
export default function ActionableEmptyState({
  icon: Icon = Sparkles,
  badge = "SIN REGISTROS ACTIVOS",
  title = "Comienza configurando tu primer elemento",
  description = "No hay datos para mostrar en este periodo. Da el primer paso para habilitar el seguimiento y métricas en tiempo real.",
  actionLabel = "Crear Nuevo",
  onAction,
  secondaryAction = null
}) {
  return (
    <div className="w-full p-8 sm:p-12 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-3xl text-center flex flex-col items-center justify-center shadow-xs">
      {/* Icono con halo suave de laboratorio */}
      <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#188ff0] shadow-sm mb-4">
        <Icon className="w-7 h-7" />
      </div>

      {/* Badge Mono Técnico */}
      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 mb-2">
        {badge}
      </span>

      {/* Titular Sora */}
      <h3 className="font-sora font-extrabold text-gray-900 text-lg sm:text-xl max-w-md mb-2">
        {title}
      </h3>

      {/* Descripción empática y con sentido */}
      <p className="font-inter text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* CTA de avance (Zero Dead-Ends) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
