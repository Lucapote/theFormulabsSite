import { motion } from "framer-motion";
import { specialistsData } from "@/data";

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
          <span className="lab-mono mb-3 block text-brand-magenta font-mono tracking-widest uppercase text-xs">El Equipo</span>
          <h2 className="text-3xl md:text-[2.5rem] font-sora font-extrabold tracking-tight text-foreground leading-tight">
            Nuestros <span className="text-gradient">especialistas.</span>
          </h2>
          <p className="text-lab-text-secondary mt-3 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-inter">
            Detrás del diagnóstico y las operaciones, este es el cerebro humano que dirige la inteligencia artificial.
          </p>
        </motion.div>

        <ul className="grid md:grid-cols-2 gap-8">
          {specialistsData.map((specialist, index) => (
            <motion.li
              key={index}
              className="group flex flex-col p-7 md:p-8 rounded-2xl lab-card lab-card-hover transition-all duration-500 bg-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Imagen placeholder */}
              <div className="w-full aspect-video md:aspect-square rounded-xl bg-brand-neutral/80 mb-6 flex items-center justify-center overflow-hidden relative border border-lab-border">
                <span className="text-lab-text-tertiary font-mono text-[10px] uppercase tracking-widest text-center px-4 font-bold">
                  [Imagen: {specialist.name}]
                </span>
                <div
                  className="absolute inset-0 border border-transparent rounded-xl transition-colors duration-500"
                  style={{ borderColor: `${specialist.color}30` }}
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-sora font-bold text-foreground mb-1">
                  {specialist.name}
                </h3>
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase font-bold mb-4" style={{ color: specialist.color }}>
                  {specialist.role}
                </p>
                <div
                  className="w-10 h-[2.5px] mb-4 transition-all duration-500 group-hover:w-20"
                  style={{ backgroundColor: specialist.color }}
                />
                <p className="text-lab-text-secondary text-sm leading-relaxed mb-4 flex-1 font-inter">
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
