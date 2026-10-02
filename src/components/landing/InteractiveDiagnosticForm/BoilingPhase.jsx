import { useState, useEffect } from "react";
import TestTube from "./TestTube";
import { PROCESSING } from "./diagnosticData";

export default function BoilingPhase({ answers, onComplete }) {
  const [prog, setProg] = useState(0);
  const [stageI, setStageI] = useState(0);
  const color = "#7b6cf0";

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
    <div className="w-full flex flex-col items-center justify-center relative">
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "labFadeUp .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: "labPulse 1.5s infinite" }} />
          <span className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", letterSpacing: ".14em", textTransform: "uppercase" }}>
            The Formulab™
          </span>
        </div>
        <div style={{ display: "inline-block", marginBottom: 20 }}>
          <TestTube fillPct={85} bubbling={true} color={color} />
        </div>
        <h2 className="text-foreground" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6 }}>
          Analizando muestra<span style={{ animation: "labBlink 1s step-end infinite", color }}>_</span>
        </h2>
        <p className="font-mono" style={{ fontSize: 11, color: "var(--lab-text-tertiary)", letterSpacing: ".06em", marginBottom: 28 }}>
          {PROCESSING[stageI]}
        </p>
        <div className="bg-muted" style={{ width: 280, margin: "0 auto", height: 3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: color, width: prog + "%", transition: "width .2s linear", borderRadius: 2 }} />
        </div>
        <p className="font-mono" style={{ fontSize: 10, color: "var(--lab-text-tertiary)", marginTop: 8 }}>
          {prog}%
        </p>
      </div>
    </div>
  );
}
