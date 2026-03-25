import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "En 3 semanas tenía un sistema de contenido con IA que me ahorra 15 horas semanales. Mis ventas subieron un 280%.",
    name: "Carlos M.",
    role: "Agencia digital",
    result: "+280% ventas",
  },
  {
    quote: "Me dieron un diagnóstico brutalmente honesto. Cambié mi oferta, mi mensaje y mi precio. Ahora facturo 4x más.",
    name: "Valentina R.",
    role: "Creadora de contenido",
    result: "4x ingresos",
  },
  {
    quote: "No es coaching motivacional. Es un laboratorio donde te dan la fórmula exacta para tu caso. Resultados reales.",
    name: "Diego A.",
    role: "Consultor independiente",
    result: "6 meses → rentable",
  },
];

const SocialProofSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="resultados">
      <div className="lab-divider mb-24" />
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="lab-mono mb-3 block">Casos clínicos</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Resultados, no{" "}
            <span className="text-gradient">promesas.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-500 flex flex-col"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Result badge */}
              <span className="inline-flex self-start items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-[10px] tracking-wider uppercase mb-4">
                {t.result}
              </span>
              <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">"{t.quote}"</p>
              <div className="pt-4 border-t border-border">
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
