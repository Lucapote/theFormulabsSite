import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const features = [
  "Acceso a la comunidad privada",
  "Framework completo de 4 pilares",
  "Herramientas de IA exclusivas",
  "Sesiones en vivo semanales",
  "Plantillas y recursos premium",
  "Soporte y accountability",
];

const OfferSection = () => {
  return (
    <section className="py-28 md:py-36 relative">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="rounded-2xl border border-border bg-card p-8 md:p-14 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />

          <div className="relative z-10">
            <span className="text-sm font-display font-medium tracking-[0.2em] uppercase text-primary mb-4 block">
              Tu siguiente paso
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Entra a{" "}
              <span className="text-gradient">The Formula B</span>
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
              Un ecosistema completo para personas que no se conforman con lo promedio. 
              Estrategia, comunidad e IA en un solo lugar.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10 text-left">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="px-10 py-6 text-base">
              Quiero entrar ahora
              <ArrowRight className="ml-2" />
            </Button>

            <p className="text-text-tertiary text-xs mt-4">
              Plazas limitadas · Sin permanencia · Garantía de satisfacción
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;
