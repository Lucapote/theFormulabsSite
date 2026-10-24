import { useState, useEffect, useRef } from "react";
import TestTube from "./TestTube";
import { STEPS, TUBE_COLORS } from "@/data/diagnosticData";

export default function IntakePhase({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [key, setKey] = useState(0);
  const fillPct = ((step + 1) / STEPS.length) * 85;
  const color = TUBE_COLORS[step % TUBE_COLORS.length];
  const cur = STEPS[step];
  const questionRef = useRef(null);
  const [tubeH, setTubeH] = useState(260);

  useEffect(() => {
    if (!questionRef.current) return;
    const obs = new ResizeObserver(() => {
      if (questionRef.current) {
        setTubeH(questionRef.current.offsetHeight);
      }
    });
    obs.observe(questionRef.current);
    return () => obs.disconnect();
  }, [step]);

  function pick(opt) {
    const next = { ...answers, [cur.id]: opt };
    setAnswers(next);
    if (step + 1 >= STEPS.length) {
      setTimeout(() => onComplete(next), 300);
    } else {
      setStep((s) => s + 1);
      setKey((k) => k + 1);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center relative font-inter">
      <div className="relative z-10 w-full max-w-[580px] animate-fade-in">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-sora font-extrabold leading-[1.1] tracking-tight text-foreground">
            Diagnóstico en curso.
            <br />
            <span className="text-gradient">Descubriendo la fórmula.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[54px_1fr] gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-0 items-start">
          {/* Mobile Tube */}
          <div className="flex sm:hidden flex-col items-center">
            <TestTube fillPct={fillPct} bubbling={false} color={color} height={tubeH} />
          </div>

          {/* Progress bar */}
          <div className="w-full sm:col-start-2 sm:row-start-1" key={`prog-${key}`}>
            <div className="mb-4 sm:mb-6">
              <div className="flex gap-1 mb-2">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div
                      className="h-1 rounded-xs transition-colors duration-300"
                      style={{
                        backgroundColor:
                          i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-border)"
                      }}
                    />
                    <span
                      className="font-mono font-bold text-[9px] tracking-wider uppercase truncate transition-colors duration-300"
                      style={{
                        color:
                          i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-text-tertiary)"
                      }}
                    >
                      {s.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Tube */}
          <div className="hidden sm:flex flex-col items-center pt-1 sm:col-start-1 sm:row-start-2">
            <TestTube fillPct={fillPct} bubbling={false} color={color} height={tubeH} />
          </div>

          {/* Question */}
          <div className="w-full min-w-0 sm:col-start-2 sm:row-start-2" ref={questionRef} key={`q-${key}`}>
            <h2 className="text-foreground font-sora text-lg font-bold tracking-tight leading-snug mb-5">
              {cur.q}
            </h2>
            <div className="flex flex-col gap-2">
              {cur.opts.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pick(opt)}
                  className="bg-background border border-lab-border text-foreground hover:bg-white hover:shadow-sm font-inter text-left rounded-xl px-4 py-3 cursor-pointer text-sm transition-all duration-200 flex items-center gap-3 animate-fade-in hover:-translate-y-0.5 active:scale-[0.99]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <span
                    className="font-mono font-bold text-[11px] min-w-4"
                    style={{ color }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
