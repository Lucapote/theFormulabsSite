import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const OfferSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 md:py-32 relative">
      <div className="lab-divider mb-24" />
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          className="rounded-2xl border border-primary/20 bg-card p-8 md:p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />

          <div className="relative z-10">
            <span className="lab-mono mb-3 block">Acceso limitado</span>
            <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight mb-3">
              ¿Listo para{" "}
              <span className="text-gradient">la fórmula?</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Solicita tu diagnóstico gratuito. Analizamos tu negocio y te decimos exactamente 
              qué cambiar para escalar. Sin compromiso.
            </p>

            {/* CRO: Repeat the same email form for consistency */}
            <div className="max-w-sm mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <Button variant="hero" className="h-12 px-6 shrink-0">
                  Empezar
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
              <p className="text-text-tertiary text-[10px] mt-3 font-mono tracking-wider">
                47 plazas restantes este mes · Respuesta en 24h
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;
