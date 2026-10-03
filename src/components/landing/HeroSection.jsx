import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Target, Search, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import InteractiveDiagnosticForm from "./InteractiveDiagnosticForm";

const AnimatedStat = ({ value }) => {
  const numMatches = value.match(/[\d.]+/);
  const numValue = numMatches ? parseFloat(numMatches[0]) : 0;
  const suffix = value.replace(/[\d.]+/g, "");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (numValue % 1 !== 0) {
      return latest.toFixed(1) + suffix;
    }
    return Math.round(latest) + suffix;
  });
  useEffect(() => {
    const controls = animate(count, numValue, {
      duration: 2,
      delay: 0.5,
      ease: "easeOut"
    });
    return () => controls.stop?.();
  }, [count, numValue]);
  return <motion.span>{rounded}</motion.span>;
};

const MarketingLabCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="mt-12 w-full max-w-2xl mx-auto rounded-2xl bg-white border border-lab-border p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 text-left font-inter relative overflow-hidden"
    >
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-lab-border">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-magenta animate-pulse" />
          <span className="font-mono text-xs font-bold text-foreground tracking-wider uppercase">
            Marketing Diagnostic Board™
          </span>
        </div>
        <span className="font-mono text-[10px] text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full font-bold">
          ANÁLISIS DE EMBUDO
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-brand-neutral/60 border border-lab-border/70 hover:border-brand-magenta/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-brand-magenta">
            <Search className="w-4 h-4" />
            <span className="font-sora text-xs font-bold">1. Atracción</span>
          </div>
          <p className="text-[12px] text-lab-text-secondary leading-snug">
            Auditamos la calidad de tus prospectos y canales de tráfico.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-brand-neutral/60 border border-lab-border/70 hover:border-brand-blue/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-brand-blue">
            <Target className="w-4 h-4" />
            <span className="font-sora text-xs font-bold">2. Conversión</span>
          </div>
          <p className="text-[12px] text-lab-text-secondary leading-snug">
            Detectamos las fugas en tu proceso de ventas y cierre.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-brand-neutral/60 border border-lab-border/70 hover:border-brand-magenta/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-brand-magenta">
            <BarChart3 className="w-4 h-4" />
            <span className="font-sora text-xs font-bold">3. Escala</span>
          </div>
          <p className="text-[12px] text-lab-text-secondary leading-snug">
            Diseñamos la fórmula científica para aumentar tu facturación.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [hasStartedDiagnostic, setHasStartedDiagnostic] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setHasStartedDiagnostic(true);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-background">
      {/* Subtle clean grid background */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none lab-grid-bg"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
        }}
      />

      {/* Gentle ambient background accents (non-saturating) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-brand-magenta/[0.03] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] rounded-full bg-brand-blue/[0.03] blur-[120px] pointer-events-none" />

      <div className="container relative z-10 max-w-4xl mx-auto px-6">
        {!hasStartedDiagnostic ? (
          <>
            {/* Neuromarketing Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-magenta/30 bg-white/90 text-[11px] font-mono font-bold uppercase text-brand-magenta shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
                Laboratorio de Marketing & Growth · Auditoría de Embudos
              </span>
            </motion.div>

            {/* Neuromarketing Headline */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(2.1rem,5vw,3.6rem)] font-sora font-extrabold leading-[1.12] tracking-tight text-foreground mb-6">
                Tu marketing no necesita más presupuesto.
                <br />
                <span className="text-gradient">Necesita el diagnóstico correcto.</span>
              </h1>
            </motion.div>

            {/* Neuromarketing Value Proposition */}
            <motion.p
              className="text-center text-[15px] md:text-base text-lab-text-secondary max-w-xl mx-auto mb-9 leading-relaxed font-inter"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Auditamos clínicamente tu embudo de ventas, identificamos en qué punto exacto estás perdiendo clientes y diseñamos la fórmula estratégica de conversión para escalar tu negocio.
            </motion.p>

            {/* Form CTA with high clarity */}
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white shadow-md border border-lab-border">
                <input
                  type="email"
                  required
                  placeholder="Ingresa tu correo empresarial"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-xl bg-background border border-lab-border/60 text-foreground placeholder:text-lab-text-tertiary text-sm font-inter focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 transition-all"
                />
                <Button type="submit" variant="lab" className="h-12 px-6 shrink-0 bg-brand-magenta hover:bg-brand-magenta/90 text-white font-sora font-bold text-sm rounded-xl shadow-sm hover:shadow-md">
                  Obtener Diagnóstico
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </form>

              {/* Trust Indicators / Neuromarketing Reassurance */}
              <div className="flex items-center justify-center gap-5 mt-4 text-lab-text-tertiary text-[11px] font-inter">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-magenta" />
                  Diagnóstico en 3 minutos
                </span>
                <span className="w-1 h-1 rounded-full bg-lab-border" />
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                  100% Confidencial
                </span>
              </div>
            </motion.div>

            {/* Custom Marketing Diagnostic Preview Card */}
            <MarketingLabCard />

            {/* Social proof strip */}
            <motion.div
              className="relative mt-12 pt-8 border-t border-lab-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="relative z-10 flex items-center justify-center gap-8 md:gap-14">
                {[
                  { value: "25+", label: "Embudos auditados" },
                  { value: "2.5x", label: "Multiplicador de conversión" },
                  { value: "94%", label: "Retorno de inversión" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-2">
                    <div className="text-xl md:text-2xl font-sora font-extrabold text-foreground">
                      <AnimatedStat value={stat.value} />
                    </div>
                    <div className="text-lab-text-tertiary text-[10px] font-mono font-bold tracking-[0.1em] uppercase mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <InteractiveDiagnosticForm email={email} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
