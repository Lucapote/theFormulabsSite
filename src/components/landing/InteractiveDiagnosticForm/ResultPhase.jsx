import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import TestTube from "./TestTube";
import ResultCard from "./ResultCard";
import { buildDiagnostic } from "@/data/diagnosticData";

export default function ResultPhase({ answers, onReset, email }) {
  const [ctaSent, setCtaSent] = useState(false);
  const results = buildDiagnostic(answers);

  const handleCta = () => {
    setCtaSent(true);
    setTimeout(() => {
      window.open(`https://calendly.com/theformulab-io/30min?email=${encodeURIComponent(email)}`, "_blank");
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative font-inter">
      <div className="relative z-10 w-full max-w-[640px] mx-auto">
        <div className="bg-white/90 border border-lab-border shadow-md rounded-2xl p-6 sm:p-7 mb-3 relative overflow-hidden animate-fade-in">
          <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <TestTube fillPct={100} bubbling={false} color="#ef18d6" />
          </div>

          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
              <span className="font-mono font-bold text-[11px] text-brand-magenta tracking-[0.14em] uppercase">
                The Formulab™
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-lab-text-tertiary hover:text-brand-magenta font-semibold text-[10px] tracking-[0.08em] transition-colors cursor-pointer bg-transparent border-none"
            >
              ↺ NUEVO DIAGNÓSTICO
            </button>
          </div>

          <div className="font-mono font-semibold text-[10px] text-lab-text-tertiary tracking-[0.1em] mb-2 uppercase">
            Análisis completado · Reacción positiva detectada
          </div>

          <h1 className="text-foreground font-sora font-extrabold text-2xl tracking-tight leading-tight mb-4">
            Compuesto activo<br />
            <span className="text-gradient">identificado.</span>
          </h1>

          <div className="flex flex-wrap gap-1.5">
            {Object.values(answers).map((v, i) => (
              <span
                key={i}
                className="font-mono bg-brand-neutral border border-lab-border text-lab-text-secondary font-medium text-[10px] rounded-md px-2.5 py-1"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 my-4">
          <div className="bg-lab-border flex-1 h-px" />
          <span className="font-mono font-bold text-[10px] text-lab-text-tertiary tracking-[0.12em] uppercase whitespace-nowrap">
            5 variables procesadas
          </span>
          <div className="bg-lab-border flex-1 h-px" />
        </div>

        {results.map((r, i) => (
          <ResultCard key={i} r={r} i={i} email={email} />
        ))}

        <div className="bg-white/90 border border-lab-border shadow-md rounded-2xl p-6 text-center mt-4 animate-fade-in">
          <p className="text-lab-text-secondary font-inter text-sm leading-relaxed mb-4">
            Hemos identificado ineficiencias claras en tu sistema.<br />
            Desbloquea el diagnóstico completo y tu{" "}
            <strong className="text-brand-magenta font-bold">Formula Rx™</strong>.
          </p>
          <button
            type="button"
            onClick={handleCta}
            className={`font-sora text-xs font-bold rounded-full px-7 py-3 cursor-pointer tracking-wide transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-md ${
              ctaSent
                ? "bg-brand-blue text-white shadow-blue-200"
                : "bg-brand-magenta text-white hover:bg-brand-magenta/90 hover:shadow-lg shadow-pink-200"
            }`}
          >
            {ctaSent ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Redirigiendo al estratega...</span>
              </>
            ) : (
              <>
                <span>Ver diagnóstico completo</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
          {ctaSent && (
            <p className="font-mono font-semibold text-[11px] text-brand-blue mt-3">
              Un estratega revisará tu caso en las próximas 24h.
            </p>
          )}
        </div>

        <div className="text-center mt-5">
          <span className="font-mono font-semibold text-[10px] text-lab-text-tertiary tracking-[0.1em]">
            THE FORMULAB™ · SISTEMA DE DIAGNÓSTICO v2.1
          </span>
        </div>
      </div>
    </div>
  );
}
