import { ArrowLeft, FlaskConical } from "lucide-react";
import TestTube from "@/components/common/TestTube";

const STEP_WIDTH_CLASSES = {
  1: "w-[17%]",
  2: "w-[33%]",
  3: "w-[50%]",
  4: "w-[67%]",
  5: "w-[83%]",
  6: "w-full"
};

const STEP_PERCENTAGES = {
  1: 17,
  2: 33,
  3: 50,
  4: 67,
  5: 83,
  6: 100
};

export default function LeadFormProgress({
  currentStep = 1,
  totalSteps = 6,
  bubbling = false,
  onBack = null
}) {
  const widthClass = STEP_WIDTH_CLASSES[currentStep] || "w-[17%]";
  const fillPct = STEP_PERCENTAGES[currentStep] || 17;
  const tubeColor = currentStep >= 4 ? "#ef18d6" : "#188ff0";

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4">
      {/* Left / Center: Controls, step stats, and progress bar */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
        {/* Top Info Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Back Button or Diagnóstico en Vivo Badge */}
          <div className="min-h-7 flex items-center">
            {onBack && currentStep > 1 ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sora font-semibold transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-sora font-bold text-brand-blue">
                <FlaskConical className="w-3.5 h-3.5 text-brand-blue" />
                Diagnóstico en Vivo
              </span>
            )}
          </div>

          {/* Step Count & Percentage */}
          <div className="flex items-baseline gap-1.5 text-right">
            <span className="text-[10px] sm:text-[11px] font-sora font-bold uppercase tracking-wider text-gray-400">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-xs font-mono font-bold text-brand-magenta lab-mono">
              ({fillPct}%)
            </span>
          </div>
        </div>

        {/* Horizontal Progress Track (stops right before the tube) */}
        <div className="w-full h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/60">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-[#188ff0] to-[#ef18d6] transition-all duration-500 ease-out ${widthClass}`}
          />
        </div>
      </div>

      {/* Right Column: Taller Test Tube with transparent background and no borders */}
      <div className="shrink-0 flex items-center justify-center w-8 sm:w-10 h-14 sm:h-16">
        <TestTube
          fillPct={fillPct}
          bubbling={bubbling}
          color={tubeColor}
          height={56}
        />
      </div>
    </div>
  );
}
