import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TestTube from "./TestTube";

export default function EmailPhase({ onComplete }) {
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    onComplete(emailInput);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative font-inter">
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 580, animation: "labFadeUp .4s ease both" }}>
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-sora font-extrabold leading-[1.1] tracking-tight text-foreground">
            Análisis listo.
            <br />
            <span className="text-gradient">Ingresa tu email.</span>
          </h2>
          <p className="text-lab-text-secondary text-sm mt-3 leading-relaxed font-inter">
            Tu diagnóstico y recomendación clínica están preparados. Ingresa tu correo para compilar y revelar los resultados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[54px_1fr] gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-0 items-center">
          {/* Test Tube decoration */}
          <div className="flex flex-col items-center">
            <TestTube fillPct={85} bubbling={false} color="#ef18d6" height={180} />
          </div>

          <div className="w-full min-w-0">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl bg-white/90 border border-lab-border shadow-md">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 h-11 px-4 rounded-lg bg-background border border-lab-border text-foreground placeholder:text-lab-text-tertiary text-sm font-inter focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 transition-all"
              />
              <Button type="submit" variant="lab" className="h-11 px-6 shrink-0 bg-brand-magenta hover:bg-brand-magenta/90 text-white font-sora shadow-sm">
                Ver Resultados
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </form>
            <p className="text-lab-text-tertiary text-[10px] mt-3 font-mono tracking-[0.1em] text-center sm:text-left">
              Plazas limitadas este mes · Respuesta en 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
