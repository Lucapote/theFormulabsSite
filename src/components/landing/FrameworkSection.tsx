import { motion } from "framer-motion";

const steps = [
  {
    phase: "Fase 01",
    title: "Diagnóstico",
    description: "Analizamos tu negocio, tu audiencia y tu posicionamiento actual. Identificamos exactamente qué bloquea tu crecimiento.",
    tag: "Semana 1",
  },
  {
    phase: "Fase 02",
    title: "Fórmula",
    description: "Diseñamos tu estrategia personalizada: mensaje, oferta, canales y sistemas de IA adaptados a tu caso.",
    tag: "Semana 2-3",
  },
  {
    phase: "Fase 03",
    title: "Tratamiento",
    description: "Implementamos la fórmula con sprints de ejecución, automatizaciones y contenido estratégico que trabaja 24/7.",
    tag: "Semana 4-8",
  },
  {
    phase: "Fase 04",
    title: "Evolución",
    description: "Medimos, optimizamos y escalamos. Tu negocio opera con un sistema que crece contigo, no depende de ti.",
    tag: "Continuo",
  },
];

const FrameworkSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="sistema">
      <div className="lab-divider mb-24" />
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="lab-mono mb-3 block">Protocolo</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            El proceso es{" "}
            <span className="text-gradient">preciso.</span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-lg mx-auto text-sm">
            No improvisamos. Cada paso tiene un propósito claro y un resultado medible.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/25 transition-all duration-500 relative overflow-hidden"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Phase glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-primary tracking-wider uppercase">{step.phase}</span>
                  <span className="font-mono text-[10px] text-text-tertiary tracking-wider">{step.tag}</span>
                </div>
                <h3 className="text-xl font-display font-bold mb-2">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrameworkSection;
