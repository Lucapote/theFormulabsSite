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
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 620, margin: "0 auto" }}>
        <div className="bg-background border border-lab-border" style={{ borderRadius: 16, padding: "24px 26px", marginBottom: 10, animation: "labFadeUp .5s ease both", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: 0.08, pointerEvents: "none" }}>
            <TestTube fillPct={100} bubbling={false} color="#7b6cf0" />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7b6cf0", animation: "labPulse 2.5s infinite" }} />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".14em", textTransform: "uppercase" }}>
                The Formulab™
              </span>
            </div>
            <button onClick={onReset} className="font-mono text-lab-text-tertiary hover:text-foreground" style={{ fontSize: 9, background: "none", border: "none", cursor: "pointer", letterSpacing: ".08em", transition: "color .2s" }}>
              ↺ NUEVO DIAGNÓSTICO
            </button>
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".1em", marginBottom: 8, textTransform: "uppercase" }}>
            Análisis completado · Reacción positiva detectada
          </div>
          <h1 className="text-foreground" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.2, marginBottom: 16 }}>
            Compuesto activo<br /><span style={{ color: "#7b6cf0" }}>identificado.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.values(answers).map((v, i) => (
              <span key={i} className="font-mono bg-muted border border-lab-border text-lab-text-secondary" style={{ fontSize: 10, borderRadius: 5, padding: "3px 9px" }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px", animation: "labFadeUp .5s ease .2s both" }}>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
          <span className="font-mono" style={{ fontSize: 9, color: "var(--lab-text-tertiary)", letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            5 variables procesadas
          </span>
          <div className="bg-lab-border" style={{ flex: 1, height: 1 }} />
        </div>

        {results.map((r, i) => (
          <ResultCard key={i} r={r} i={i} email={email} />
        ))}

        <div className="bg-background border border-lab-border" style={{ borderRadius: 12, padding: 24, textAlign: "center", marginTop: 16, animation: "labFadeUp .5s ease .8s both" }}>
          <p className="text-lab-text-secondary" style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 16 }}>
            Hemos identificado ineficiencias claras en tu sistema.<br />
            Desbloquea el diagnóstico completo y tu <strong style={{ color: "#7b6cf0", fontWeight: 500 }}>Formula Rx™</strong>.
          </p>
          <button
            onClick={handleCta}
            className={`font-mono text-[11px] rounded-[7px] px-[26px] py-[10px] cursor-pointer tracking-[0.06em] transition-all border ${
              ctaSent ? "border-[#7b6cf0] text-[#7b6cf0]" : "border-lab-border text-foreground hover:border-[#7b6cf0] hover:text-[#7b6cf0] bg-background"
            }`}
          >
            {ctaSent ? "✓ Redirigiendo al estratega..." : "Ver diagnóstico completo →"}
          </button>
          {ctaSent && <p className="font-mono" style={{ fontSize: 10, color: "#7b6cf0", marginTop: 10 }}>Un estratega revisará tu caso en las próximas 24h.</p>}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span className="font-mono" style={{ fontSize: 9, color: "var(--lab-text-tertiary)", letterSpacing: ".1em" }}>
            THE FORMULAB™ · SISTEMA DE DIAGNÓSTICO v2.1
          </span>
        </div>
      </div>
    </div>
  );
}
