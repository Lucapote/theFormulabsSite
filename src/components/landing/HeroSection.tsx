import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, FormEvent } from "react";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsRedirecting(true);
    setTimeout(() => {
      window.open(`https://calendly.com/theformulab-io/30min?email=${encodeURIComponent(email)}`, "_blank");
      setIsRedirecting(false);
    }, 1500);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Precision grid */}
      <div className="absolute inset-0 lab-grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Soft glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="container relative z-10 max-w-3xl mx-auto px-6">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full lab-card text-[11px] font-mono tracking-[0.12em] uppercase text-lab-text-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Lab abierto · Aceptando pacientes
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-display font-bold leading-[1.1] tracking-tight text-foreground mb-5">
            Tu negocio está estancado.
            <br />
            <span className="text-gradient">Nosotros tenemos el diagnóstico.</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-center text-[15px] md:text-base text-lab-text-secondary max-w-lg mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Somos el laboratorio de AI que diagnostica los cuellos de botella de tu negocio 
          y prescribe sistemas inteligentes para marketing, ventas y operaciones.
        </motion.p>

        {/* CTA: Email capture */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl lab-card">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-11 px-4 rounded-lg bg-background border-0 text-foreground placeholder:text-lab-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <Button type="submit" variant="lab" className="h-11 px-6 shrink-0" disabled={isRedirecting}>
              {isRedirecting ? "Redirigiendo..." : (
                <>
                  Diagnóstico gratis
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">Sin spam</span>
            <span className="w-1 h-1 rounded-full bg-lab-border" />
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">Respuesta en 24h</span>
            <span className="w-1 h-1 rounded-full bg-lab-border" />
            <span className="text-lab-text-tertiary text-[10px] font-mono tracking-wider">100% confidencial</span>
          </div>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          className="flex items-center justify-center gap-8 md:gap-12 mt-14 pt-8 border-t border-lab-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            { value: "25+", label: "Negocios diagnosticados" },
            { value: "2.5x", label: "Crecimiento promedio" },
            { value: "94%", label: "Satisfacción" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl md:text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-lab-text-tertiary text-[10px] font-mono tracking-[0.1em] uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
