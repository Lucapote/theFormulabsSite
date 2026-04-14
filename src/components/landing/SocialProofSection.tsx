import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const cases = [
  {
    quote: "En 3 semanas automatizamos el 70% de nuestro follow-up de ventas con AI. Los cierres subieron un 280%.",
    name: "Carlos M.",
    role: "CEO — Agencia Digital",
    result: "+280%",
    metric: "OPTIMIZACION SEGUIMIENTO",
    before: "Seguimiento manual, 3% cierre",
    after: "Automatización y procesos claros de follow-up",
  },
  {
    quote: "El diagnóstico nos permitió detectar puntos de fricción en el proceso de onboarding. En pocas semanas optimizamos la experiencia del cliente, logrando un flujo más claro y eficiente.",
    name: "Marco",
    role: "Fundador — Negocio Digital",
    result: "-40%",
    metric: "FRICCIÓN ONBOARDING",
    before: "Proceso de incorporación sin planificación\n\n",
    after: "Onboarding estructurado y sin seguimiento claro",
  },
  {
    quote: "Logramos transformar una idea en una marca con dirección, propósito y presencia digital. Hoy cuenta con una estrategia clara para posicionarse y atraer oportunidades.",
    name: "Paula S.",
    role: "Marca Personal — Consultoría y Desarrollo Profesional",
    result: "6 sem.",
    metric: "POSICIONAMIENTO DE MARCA ",
    before: "Sin estrategia clara, ni identidad, ni presencia digital estructurada",
    after: "Marca personal con narrativa, identidad visual y bases sólidas para su crecimiento.",
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="casos">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="lab-mono mb-3 block">Casos clínicos</span>
          <h2 className="text-3xl md:text-[2.5rem] font-display font-bold tracking-tight text-foreground leading-tight">
            Resultados medibles,{" "}
            <span className="text-gradient">no promesas.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div
              key={c.name}
              className="flex flex-col p-6 rounded-xl lab-card lab-card-hover transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              {/* Result header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-2xl font-display font-bold text-primary">{c.result}</div>
                  <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-lab-text-tertiary mt-0.5">{c.metric}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-lab-text-tertiary" />
              </div>

              {/* Before/After */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 p-2.5 rounded-md bg-background">
                  <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-lab-text-tertiary mb-1">Antes</div>
                  <div className="text-[11px] text-lab-text-secondary leading-snug">{c.before}</div>
                </div>
                <div className="flex-1 p-2.5 rounded-md bg-lab-accent-soft">
                  <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-lab-text-mono mb-1">Después</div>
                  <div className="text-[11px] text-foreground leading-snug">{c.after}</div>
                </div>
              </div>

              <p className="text-lab-text-secondary text-[13px] leading-relaxed mb-5 flex-1">"{c.quote}"</p>

              <div className="pt-4 border-t border-lab-border">
                <div className="font-display font-semibold text-sm text-foreground">{c.name}</div>
                <div className="text-lab-text-tertiary text-[11px]">{c.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
