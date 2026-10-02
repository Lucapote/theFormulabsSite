import { useState, useEffect, useRef } from "react";
import TestTube from "./TestTube";
import { STEPS, TUBE_COLORS } from "./diagnosticData";

export default function IntakePhase({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [key, setKey] = useState(0);
  const fillPct = (step / STEPS.length) * 85;
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
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, animation: "labFadeUp .4s ease both" }}>
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-display font-bold leading-[1.1] tracking-tight text-foreground">
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
            <div className="mb-2 sm:mb-5">
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-border)",
                        transition: "background .3s"
                      }}
                    />
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 8,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                        color: i < step ? TUBE_COLORS[i] : i === step ? color : "var(--lab-text-tertiary)",
                        transition: "color .3s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
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
            <h2 className="text-foreground" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.35, marginBottom: 18 }}>
              {cur.q}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {cur.opts.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  className="bg-background border border-lab-border text-foreground hover:bg-muted"
                  style={{
                    textAlign: "left",
                    borderRadius: 10,
                    padding: "11px 14px",
                    cursor: "pointer",
                    fontSize: 13,
                    transition: "all .15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    animation: `labFadeUp .3s ease ${i * 60}ms both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", minWidth: 14 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
