import { motion } from "framer-motion";
import { Activity, Brain, TrendingDown } from "lucide-react";

const symptoms = [
  {
    icon: TrendingDown,
    symptom: "\"Invierto en marketing pero no convierto\"",
    diagnosis: "Tu funnel tiene fugas. No tienes un sistema de diagnóstico de conversión ni automatización de seguimiento.",
    area: "Marketing",
  },
  {
    icon: Activity,
    symptom: "\"Trabajo 12 horas y no escalo\"",
    diagnosis: "Operas sin sistemas. El 60% de tus tareas operativas pueden automatizarse con AI hoy.",
    area: "Operaciones",
  },
  {
    icon: Brain,
    symptom: "\"No sé por qué mis clientes no repiten\"",
    diagnosis: "Falta de análisis de retención y experiencia post-venta. Sin datos, no hay diagnóstico posible.",
    area: "Ventas",
  },
];

const ValueSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="diagnostico">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="lab-mono mb-3 block">Síntomas comunes</span>
          <h2 className="text-3xl md:text-[2.5rem] font-display font-bold tracking-tight text-foreground leading-tight">
            ¿Tu negocio presenta
            <br />
            <span className="text-gradient">estos síntomas?</span>
          </h2>
        </motion.div>

        <ul className="space-y-3">
          {symptoms.map((item, i) => (
            <motion.li
              key={i}
              className="group flex flex-col sm:flex-row items-start gap-5 p-6 rounded-xl lab-card lab-card-hover transition-all duration-500"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-lg bg-lab-accent-soft flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-lab-text-tertiary sm:hidden">{item.area}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="font-display font-semibold text-foreground text-[15px]">{item.symptom}</p>
                  <span className="hidden sm:inline font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-lab-accent-soft text-lab-text-mono">{item.area}</span>
                </div>
                <p className="text-lab-text-secondary text-sm leading-relaxed">
                  <span className="font-mono text-[10px] text-primary tracking-wider mr-1.5">Rx →</span>
                  {item.diagnosis}
                </p>
              </div>
              </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ValueSection;
