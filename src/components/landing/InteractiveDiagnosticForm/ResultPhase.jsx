import { useState } from "react";
import TestTube from "./TestTube";
import ResultCard from "./ResultCard";
import { buildDiagnostic } from "./diagnosticData";

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
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 640, margin: "0 auto" }}>
        <div className="bg-white/90 border border-lab-border shadow-md" style={{ borderRadius: 16, padding: "24px 26px", marginBottom: 12, animation: "labFadeUp .5s ease both", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: 0.12, pointerEvents: "none" }}>
            <TestTube fillPct={100} bubbling={false} color="#ef18d6" />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef18d6", animation: "labPulse 2.5s infinite" }} />
              <span className="font-mono font-bold" style={{ fontSize: 11, color: "var(--brand-magenta)", letterSpacing: ".14em", textTransform: "uppercase" }}>
                The Formulab™
              </span>
            </div>
            <button onClick={onReset} className="font-mono text-lab-text-tertiary hover:text-brand-magenta font-semibold" style={{ fontSize: 10, background: "none", border: "none", cursor: "pointer", letterSpacing: ".08em", transition: "color .2s" }}>
              ↺ NUEVO DIAGNÓSTICO
            </button>
          </div>
          <div className="font-mono font-semibold" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".1em", marginBottom: 8, textTransform: "uppercase" }}>
            Análisis completado · Reacción positiva detectada
          </div>
          <h1 className="text-foreground font-sora font-extrabold" style={{ fontSize: 24, letterSpacing: "-.03em", lineHeight: 1.2, marginBottom: 16 }}>
            Compuesto activo<br /><span className="text-gradient">identificado.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.values(answers).map((v, i) => (
              <span key={i} className="font-mono bg-brand-neutral border border-lab-border text-lab-text-secondary font-medium" style={{ fontSize: 10, borderRadius: 6, padding: "4px 10px" }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 12px", animation: "labFadeUp .5s ease .2s both" }}>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
          <span className="font-mono font-bold" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            5 variables procesadas
          </span>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
        </div>

        {results.map((r, i) => (
          <ResultCard key={i} r={r} i={i} email={email} />
        ))}

        <div className="bg-white/90 border border-lab-border shadow-md" style={{ borderRadius: 16, padding: 26, textAlign: "center", marginTop: 16, animation: "labFadeUp .5s ease .8s both" }}>
          <p className="text-lab-text-secondary font-inter" style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>
            Hemos identificado ineficiencias claras en tu sistema.<br />
            Desbloquea el diagnóstico completo y tu <strong style={{ color: "#ef18d6", fontWeight: 700 }}>Formula Rx™</strong>.
          </p>
          <button
            onClick={handleCta}
            className={`font-sora text-[12px] font-bold rounded-xl px-7 py-3 cursor-pointer tracking-wide transition-all ${
              ctaSent ? "bg-brand-blue text-white shadow-md" : "bg-brand-magenta text-white hover:bg-brand-magenta/90 shadow-md hover:shadow-lg"
            }`}
          >
            {ctaSent ? "✓ Redirigiendo al estratega..." : "Ver diagnóstico completo →"}
          </button>
          {ctaSent && <p className="font-mono font-semibold" style={{ fontSize: 11, color: "#188ff0", marginTop: 12 }}>Un estratega revisará tu caso en las próximas 24h.</p>}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span className="font-mono font-semibold" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".1em" }}>
            THE FORMULAB™ · SISTEMA DE DIAGNÓSTICO v2.1
          </span>
        </div>
      </div>
    </div>
  );
}
