import { useState, useEffect } from "react";
import TestTube from "./TestTube";
import { PROCESSING } from "./diagnosticData";

export default function BoilingPhase({ answers, onComplete }) {
  const [prog, setProg] = useState(0);
  const [stageI, setStageI] = useState(0);
  const color = "#ef18d6";

  useEffect(() => {
    const iv = setInterval(() => {
      setProg((p) => {
        const next = p + 2;
        setStageI(Math.min(Math.floor(next / 20), PROCESSING.length - 1));
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(onComplete, 500);
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center relative font-inter">
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "labFadeUp .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, animation: "labPulse 1.5s infinite" }} />
          <span className="font-mono font-bold" style={{ fontSize: 11, color: "var(--brand-magenta)", letterSpacing: ".14em", textTransform: "uppercase" }}>
            The Formulab™
          </span>
        </div>
        <div style={{ display: "inline-block", marginBottom: 20 }}>
          <TestTube fillPct={85} bubbling={true} color={color} />
        </div>
        <h2 className="text-foreground font-sora" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 8 }}>
          Analizando muestra<span style={{ animation: "labBlink 1s step-end infinite", color }}>_</span>
        </h2>
        <p className="font-mono font-semibold" style={{ fontSize: 12, color: "var(--lab-text-secondary)", letterSpacing: ".06em", marginBottom: 28 }}>
          {PROCESSING[stageI]}
        </p>
        <div className="bg-brand-neutral" style={{ width: 280, margin: "0 auto", height: 4, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #ef18d6, #188ff0)", width: prog + "%", transition: "width .2s linear", borderRadius: 2 }} />
        </div>
        <p className="font-mono font-bold" style={{ fontSize: 11, color: color, marginTop: 10 }}>
          {prog}%
        </p>
      </div>
    </div>
  );
}
