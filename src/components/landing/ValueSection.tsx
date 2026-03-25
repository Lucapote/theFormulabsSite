import { motion } from "framer-motion";
import { Activity, FlaskConical, ScanSearch } from "lucide-react";

const symptoms = [
  {
    icon: ScanSearch,
    symptom: "\"Publico contenido pero nadie compra\"",
    diagnosis: "Tu mensaje no conecta con el dolor real de tu cliente. Falta de posicionamiento estratégico.",
  },
  {
    icon: Activity,
    symptom: "\"Trabajo todo el día y no escalo\"",
    diagnosis: "Estás operando sin sistemas. La IA puede automatizar el 60% de tus tareas repetitivas.",
  },
  {
    icon: FlaskConical,
    symptom: "\"No sé qué me diferencia del resto\"",
    diagnosis: "Tu marca no tiene una fórmula propia. Sin diferenciación, compites solo por precio.",
  },
];

const ValueSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="valor">
      <div className="lab-divider mb-24" />
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="lab-mono mb-3 block">Diagnóstico</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            ¿Reconoces estos{" "}
            <span className="text-gradient">síntomas?</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {symptoms.map((item, i) => (
            <motion.div
              key={i}
              className="group flex flex-col sm:flex-row gap-5 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground mb-1">{item.symptom}</p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <span className="font-mono text-[10px] text-primary tracking-wider uppercase mr-2">Rx →</span>
                  {item.diagnosis}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
