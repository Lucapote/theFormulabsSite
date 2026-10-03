import { motion } from "framer-motion";
import { frameworkStepsData } from "@/data";

const FrameworkSection = () => {
  return (
    <section className="py-20 md:py-28 relative bg-slate-50/60" id="protocolo">
      <div className="container max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-sora text-xs font-bold tracking-widest uppercase text-brand-magenta mb-3 block">
            PROTOCOLO CLÍNICO
          </span>
          <h2 className="text-4xl md:text-5xl font-sora font-bold tracking-tight text-foreground leading-tight">
            Un proceso{" "}
            <span className="bg-gradient-to-r from-[#ef18d6] to-[#188ff0] text-transparent bg-clip-text">
              quirúrgico.
            </span>
          </h2>
          <p className="font-inter text-neutral-500 text-sm leading-relaxed max-w-md mx-auto mt-3">
            No improvisamos. Cada fase tiene un entregable medible y un resultado claro.
          </p>
        </motion.div>

        {/* 2x2 Grid Cards */}
        <ol className="grid sm:grid-cols-2 gap-6">
          {frameworkStepsData.map((step, i) => (
            <motion.li
              key={step.id || i}
              className="group p-7 rounded-2xl bg-white border border-lab-border hover:border-brand-magenta/40 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-300 relative"
              style={{
                borderColor: undefined // dynamic hover handled cleanly in CSS / inline styles
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${step.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              {/* Header: Icon + Time Badge */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                  style={{ backgroundColor: `${step.color}18` }}
                >
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-sora font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${step.color}15`, color: step.color }}
                >
                  {step.tag}
                </span>
              </div>

              {/* Number + Main Title */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-sora font-bold text-lg" style={{ color: step.color }}>
                  {step.phase}
                </span>
                <h3 className="font-sora font-bold text-xl text-neutral-900">{step.title}</h3>
              </div>

              {/* Technical Subtitle */}
              <p className="font-sora text-xs font-bold tracking-wide mb-3" style={{ color: step.color }}>
                {step.subtitle}
              </p>

              {/* Description */}
              <p className="font-inter text-neutral-500 text-sm leading-relaxed">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default FrameworkSection;
