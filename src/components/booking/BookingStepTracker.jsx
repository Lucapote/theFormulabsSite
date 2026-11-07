import { Check } from "lucide-react";

/**
 * BookingStepTracker
 * Segmented step indicator adhering to The Formulab Brand DNA (#ef18d6).
 * Soporta 3 pasos: [Comprobante] [Reserva de Sesión] [Requerimientos].
 * Responsive y táctil para que los 3 botones encajen perfectamente en mobile.
 */
export default function BookingStepTracker({
  steps = [],
  currentStep = 1,
  onStepClick,
  canGoToStep2 = false
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="pt-3 pb-1.5 px-2 sm:px-6 bg-white flex items-center justify-center select-none overflow-x-auto">
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-50 border border-gray-200 shadow-2xs max-w-full">
        {steps.map((step) => {
          const isActive = currentStep === step.key;
          const isCompleted = currentStep > step.key;
          const isPending = currentStep < step.key;
          const isDisabled =
            step.disabled !== undefined
              ? step.disabled
              : isPending && !canGoToStep2;

          return (
            <button
              key={step.key}
              type="button"
              disabled={isDisabled}
              onClick={() => onStepClick?.(step.key)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-sora font-bold transition-all flex items-center gap-1 shrink-0 ${
                isActive
                  ? "bg-[#ef18d6] text-white shadow-xs cursor-default"
                  : isCompleted
                  ? "bg-[#ef18d6]/10 text-[#ef18d6] border border-[#ef18d6]/20 hover:bg-[#ef18d6]/15 cursor-pointer active:scale-[0.98]"
                  : isDisabled
                  ? "bg-transparent text-gray-400 cursor-not-allowed"
                  : "bg-transparent text-gray-600 hover:text-gray-900 cursor-pointer active:scale-[0.98]"
              }`}
            >
              {isCompleted && (
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ef18d6] shrink-0" />
              )}
              {step.shortLabel ? (
                <>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </>
              ) : (
                <span>{step.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
