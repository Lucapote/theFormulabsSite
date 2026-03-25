import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Dejé de improvisar y en 90 días tripliqué mis ingresos. La fórmula funciona porque es un sistema, no motivación vacía.",
    name: "Carlos M.",
    role: "Fundador de agencia digital",
  },
  {
    quote: "Por primera vez siento que tengo un plan real. Mentalidad + IA + estrategia cambió todo mi negocio.",
    name: "Valentina R.",
    role: "Creadora de contenido",
  },
  {
    quote: "No es otro curso. Es un sistema operativo para tu vida profesional. Resultados desde la semana uno.",
    name: "Diego A.",
    role: "Freelancer & consultor",
  },
];

const stats = [
  { value: "10K+", label: "Personas en la comunidad" },
  { value: "3x", label: "Crecimiento promedio" },
  { value: "92%", label: "Tasa de satisfacción" },
  { value: "45+", label: "Países alcanzados" },
];

const SocialProofSection = () => {
  return (
    <section className="py-28 md:py-36 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.04),transparent_60%)]" />
      <div className="container relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-display font-medium tracking-[0.2em] uppercase text-primary mb-4 block">
            Resultados reales
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Ellos ya aplicaron{" "}
            <span className="text-gradient">la fórmula.</span>
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Quote className="w-5 h-5 text-primary/40 mb-4" />
              <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <div className="font-display font-semibold text-sm">{t.name}</div>
                <div className="text-text-tertiary text-xs">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
