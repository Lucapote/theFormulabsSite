import { Check } from "lucide-react";

/**
 * BookingStepTracker
 * Segmented step indicator adhering to The Formulab Brand DNA (#ef18d6).
 * Shows active step in solid brand magenta with white text (no numbers).
 * Shows completed step with subtle pink background, strong pink text and checkmark.
 */
export default function BookingStepTracker({
  steps = [],
  currentStep = 1,
  onStepClick,
  canGoToStep2 = false
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="pt-4 pb-2 px-5 sm:px-6 bg-white flex items-center justify-center select-none">
      <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-gray-50 border border-gray-200 shadow-2xs">
        {steps.map((step) => {
          const isActive = currentStep === step.key;
          const isCompleted = currentStep > step.key;
          const isPending = currentStep < step.key;

          return (
            <div key={step.key} className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPending && !canGoToStep2}
                onClick={() => onStepClick?.(step.key)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#ef18d6] text-white shadow-xs cursor-default"
                    : isCompleted
                    ? "bg-[#ef18d6]/10 text-[#ef18d6] border border-[#ef18d6]/20 hover:bg-[#ef18d6]/15 cursor-pointer active:scale-[0.98]"
                    : "bg-transparent text-gray-400 cursor-not-allowed"
                }`}
              >
                {isCompleted && (
                  <Check className="w-3.5 h-3.5 text-[#ef18d6] shrink-0" />
                )}
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
