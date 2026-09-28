import { motion } from "framer-motion";

const specialists = [
  {
    name: "Socio 1",
    role: "Especialista en Diagnóstico AI",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "Socia 2",
    role: "Especialista en Automatización",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  }
];

const SpecialistsSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="especialistas">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="lab-mono mb-3 block">El Equipo</span>
          <h2 className="text-3xl md:text-[2.5rem] font-display font-bold tracking-tight text-foreground leading-tight">
            Nuestros <span className="text-gradient">especialistas.</span>
          </h2>
          <p className="text-lab-text-secondary mt-3 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Detrás del diagnóstico y las operaciones, este es el cerebro humano que dirige la inteligencia artificial.
          </p>
        </motion.div>

        <ul className="grid md:grid-cols-2 gap-8">
          {specialists.map((specialist, index) => (
            <motion.li
              key={index}
              className="group flex flex-col p-6 md:p-8 rounded-2xl lab-card lab-card-hover transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Imagen (div cuadrado gris de momento) */}
              <div className="w-full aspect-square rounded-xl bg-lab-border/30 mb-6 flex items-center justify-center overflow-hidden relative">
                <span className="text-lab-text-tertiary font-mono text-[10px] uppercase tracking-widest text-center px-4">
                  [Imagen: {specialist.name}]
                </span>
                {/* Glow decorativo sutil en el borde de la imagen */}
                <div className="absolute inset-0 border border-lab-border/50 rounded-xl group-hover:border-primary/30 transition-colors duration-500" />
              </div>

              {/* Contenido */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-display font-bold text-foreground mb-1 relative inline-block">
                  {specialist.name}
                </h3>
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary mb-4">
                  {specialist.role}
                </p>
                <div className="w-8 h-[2px] bg-lab-border mb-4 transition-all duration-500 group-hover:w-16 group-hover:bg-primary/50" />
                <p className="text-lab-text-secondary text-sm leading-relaxed mb-4 flex-1">
                  {specialist.bio}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SpecialistsSection;
