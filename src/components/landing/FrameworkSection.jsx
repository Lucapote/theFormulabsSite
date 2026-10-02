import { motion } from "framer-motion";
import { ScanSearch, FlaskConical, Syringe, BarChart3 } from "lucide-react";
const steps = [
  {
    icon: ScanSearch,
    phase: "01",
    title: "El Paciente",
    subtitle: "Intake & an\xE1lisis",
    description: "Tu negocio llega al lab. Recopilamos datos de marketing, ventas y operaciones. Ejecutamos el Growth Simulator para mapear cada cuello de botella.",
    tag: "Semana 1"
  },
  {
    icon: FlaskConical,
    phase: "02",
    title: "El Diagn\xF3stico",
    subtitle: "Growth Simulator\u2122",
    description: "Nuestro sistema de AI analiza tus m\xE9tricas, tu funnel y tus procesos. Resultado: un informe cl\xEDnico con tus 3 mayores bloqueos de crecimiento.",
    tag: "Semana 1-2"
  },
  {
    icon: Syringe,
    phase: "03",
    title: "La Receta (Rx)",
    subtitle: "Roadmap estrat\xE9gico 90 d\xEDas",
    description: "Dise\xF1amos tu protocolo personalizado: qu\xE9 herramientas de AI implementar, qu\xE9 automatizar y qu\xE9 eliminar. Un plan preciso, no gen\xE9rico.",
    tag: "Semana 2-3"
  },
  {
    icon: BarChart3,
    phase: "04",
    title: "El Tratamiento",
    subtitle: "Ejecuci\xF3n Full-Stack",
    description: "Nuestro equipo implementa la f\xF3rmula: automatizaciones, contenido con AI, sistemas de venta y dashboards de control. T\xFA supervisas, nosotros ejecutamos.",
    tag: "Semana 3-12"
  }
];
const FrameworkSection = () => {
  return <section className="py-24 md:py-32 relative" id="protocolo">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
  >
          <span className="lab-mono mb-3 block">Protocolo clínico</span>
          <h2 className="text-3xl md:text-[2.5rem] font-display font-bold tracking-tight text-foreground leading-tight">
            Un proceso{" "}
            <span className="text-gradient">quirúrgico.</span>
          </h2>
          <p className="text-lab-text-secondary mt-3 max-w-md mx-auto text-sm leading-relaxed">
            No improvisamos. Cada fase tiene un entregable medible y un resultado claro.
          </p>
        </motion.div>

        <ol className="grid sm:grid-cols-2 gap-4">
          {steps.map((step, i) => <motion.li
    key={i}
    className="group p-6 rounded-xl lab-card lab-card-hover transition-all duration-500 relative"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.45, delay: i * 0.07 }}
  >
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-lab-accent-soft flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-lab-text-tertiary">{step.tag}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] text-primary tracking-wider">{step.phase}</span>
                <h3 className="text-lg font-display font-bold text-foreground">{step.title}</h3>
              </div>
              <p className="text-[11px] font-mono text-lab-text-mono tracking-wide mb-3">{step.subtitle}</p>
              <p className="text-lab-text-secondary text-sm leading-relaxed">{step.description}</p>
            </motion.li>)}
        </ol>
      </div>
    </section>;
};
export default FrameworkSection;
