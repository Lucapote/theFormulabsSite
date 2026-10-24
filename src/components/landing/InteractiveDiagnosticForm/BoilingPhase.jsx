import { useState, useEffect } from "react";
import TestTube from "./TestTube";
import { PROCESSING } from "@/data/diagnosticData";

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
      <div className="relative z-10 text-center animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-7">
          <div className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
          <span className="font-mono font-bold text-[11px] text-brand-magenta tracking-[0.14em] uppercase">
            The Formulab™
          </span>
        </div>

        <div className="inline-block mb-5">
          <TestTube fillPct={85} bubbling={true} color={color} />
        </div>

        <h2 className="text-foreground font-sora text-[22px] font-extrabold tracking-tight mb-2">
          Analizando muestra<span className="text-brand-magenta animate-pulse">_</span>
        </h2>

        <p className="font-mono font-semibold text-xs text-lab-text-secondary tracking-wider mb-7">
          {PROCESSING[stageI]}
        </p>

        <div className="bg-brand-neutral w-[280px] mx-auto h-1 rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-magenta to-brand-blue rounded-sm transition-all duration-200"
            style={{ width: `${prog}%` }}
          />
        </div>

        <p className="font-mono font-bold text-[11px] text-brand-magenta mt-2.5">
          {prog}%
        </p>
      </div>
    </div>
  );
}
