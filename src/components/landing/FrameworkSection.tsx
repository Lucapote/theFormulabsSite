import { motion } from "framer-motion";

const pillars = [
  {
    number: "01",
    title: "Mentalidad",
    description: "El juego se gana primero en tu cabeza. Sistemas de pensamiento para tomar decisiones de alto nivel.",
  },
  {
    number: "02",
    title: "Estrategia",
    description: "Frameworks de crecimiento que conectan tu marca, tu oferta y tu audiencia en una máquina imparable.",
  },
  {
    number: "03",
    title: "Sistemas con IA",
    description: "Automatización inteligente, contenido escalable y operaciones que trabajan 24/7 por ti.",
  },
  {
    number: "04",
    title: "Ejecución",
    description: "Sin acción no hay resultado. Planes claros, sprints de alto rendimiento y accountability real.",
  },
];

const FrameworkSection = () => {
  return (
    <section className="py-28 md:py-36 relative">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-display font-medium tracking-[0.2em] uppercase text-primary mb-4 block">
            El sistema
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            La fórmula tiene{" "}
            <span className="text-gradient">4 pilares.</span>
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto">
            Cada pilar se conecta con el siguiente. No es teoría, es un sistema operativo para construir algo grande.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[29px] md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.number}
                className={`md:flex items-center gap-12 md:mb-16 last:mb-0 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`md:w-1/2 ${i % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
                  <span className="text-5xl md:text-6xl font-display font-bold text-primary/15">
                    {pillar.number}
                  </span>
                  <h3 className="text-2xl font-display font-bold mt-2 mb-3">{pillar.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{pillar.description}</p>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex items-center justify-center relative z-10">
                  <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameworkSection;
