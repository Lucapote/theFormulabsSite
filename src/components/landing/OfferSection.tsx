import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useState, FormEvent } from "react";

const includes = [
  "Growth Simulator™ (diagnóstico AI)",
  "Informe clínico de cuellos de botella",
  "Roadmap estratégico 90 días",
  "Implementación full-stack con AI",
  "Dashboard de métricas",
  "Soporte directo con el equipo lab",
];

const OfferSection = () => {
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
    <section id="oferta" className="py-24 md:py-32 relative">
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          className="rounded-2xl lab-card p-8 md:p-12 relative overflow-hidden"
          style={{ boxShadow: "0 8px 40px -12px hsl(172 66% 40% / 0.1), 0 2px 8px -2px hsl(220 25% 10% / 0.06)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 lab-dot-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

          <div className="relative z-10 text-center">
            <span className="lab-mono mb-3 block">Primer paso</span>
            <h2 className="text-2xl md:text-[2rem] font-display font-bold tracking-tight text-foreground mb-3 leading-tight">
              Solicita tu diagnóstico.
              <br />
              <span className="text-gradient">Es gratuito.</span>
            </h2>
            <p className="text-lab-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Analizamos tu negocio con nuestro Growth Simulator y te entregamos un informe
              con tus 3 mayores oportunidades de crecimiento. Sin compromiso.
            </p>

            <ul className="grid sm:grid-cols-2 gap-2.5 max-w-sm mx-auto mb-8 text-left">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-lab-accent-soft flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[12px] text-lab-text-secondary leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {/* Email capture */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl bg-background border border-lab-border">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-lg bg-card border-0 text-foreground placeholder:text-lab-text-tertiary text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <Button type="submit" variant="lab" className="h-11 px-6 shrink-0" disabled={isRedirecting}>
                  {isRedirecting ? "Redirigiendo..." : (
                    <>
                      Empezar
                      <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-lab-text-tertiary text-[10px] mt-3 font-mono tracking-[0.1em]">
                Plazas limitadas este mes · Respuesta en 24h
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;
