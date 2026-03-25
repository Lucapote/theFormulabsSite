import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      {/* Lab grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      
      {/* Glow orb — clinical green */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[150px]" />

      <div className="container relative z-10 text-center max-w-3xl mx-auto px-6">
        {/* Lab badge — builds credibility fast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-xs font-mono tracking-wider uppercase text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Lab abierto · 47 plazas restantes
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.08] tracking-tight mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Tu negocio tiene un problema.{" "}
          <br className="hidden sm:block" />
          Nosotros tenemos{" "}
          <span className="text-gradient">la fórmula.</span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Diagnosticamos lo que frena tu crecimiento y aplicamos un sistema de 
          estrategia + IA para que escales sin improvisar.
        </motion.p>

        {/* CRO: Inline email capture — reduces friction vs separate page */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4 rounded-lg bg-card border border-border text-foreground placeholder:text-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <Button variant="hero" className="h-12 px-6 shrink-0">
              Diagnóstico gratis
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
          <p className="text-text-tertiary text-xs mt-3 font-mono tracking-wide">
            Sin spam · Respuesta en 24h · 100% confidencial
          </p>
        </motion.div>

        {/* CRO: Immediate social proof below CTA */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-border/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: "200+", label: "negocios diagnosticados" },
            { value: "3x", label: "crecimiento promedio" },
            { value: "92%", label: "satisfacción" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-display font-bold text-gradient">{stat.value}</div>
              <div className="text-text-tertiary text-[10px] font-mono tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
