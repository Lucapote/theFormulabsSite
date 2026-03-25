import { motion } from "framer-motion";
import { Zap, Target, Brain, TrendingUp, Sparkles } from "lucide-react";

const values = [
  {
    icon: Brain,
    title: "Mentalidad de élite",
    description: "Reprograma tu forma de pensar para operar al nivel de los que ya ganaron.",
  },
  {
    icon: Target,
    title: "Estrategia sin ruido",
    description: "Sistemas probados que eliminan la improvisación y aceleran tus resultados.",
  },
  {
    icon: Zap,
    title: "IA como ventaja competitiva",
    description: "Automatiza, escala y multiplica tu impacto con inteligencia artificial aplicada.",
  },
  {
    icon: TrendingUp,
    title: "Crecimiento exponencial",
    description: "No creces linealmente. Construyes palancas que trabajan mientras duermes.",
  },
  {
    icon: Sparkles,
    title: "Marca magnética",
    description: "Posiciónate como referente. Que la gente te busque, no que tú persigas.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const ValueSection = () => {
  return (
    <section className="py-28 md:py-36 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_60%)]" />
      <div className="container relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-display font-medium tracking-[0.2em] uppercase text-primary mb-4 block">
            ¿Por qué The Formula B?
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Lo que nadie te enseña{" "}
            <span className="text-gradient">hasta que llegas.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <value.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{value.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
