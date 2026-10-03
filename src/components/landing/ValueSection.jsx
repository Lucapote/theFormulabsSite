import { motion } from "framer-motion";
import { symptomsData } from "@/data";

const ValueSection = () => {
  return (
    <section className="py-20 md:py-28 relative bg-background" id="diagnostico">
      <div className="container max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-sora text-xs font-extrabold tracking-[0.2em] uppercase text-brand-magenta mb-3 block">
            PATOLOGÍAS COMUNES DEL CRECIMIENTO
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-sora font-extrabold tracking-tight text-foreground leading-tight">
            ¿Tu ecosistema presenta estos{" "}
            <span className="text-gradient block sm:inline">síntomas?</span>
          </h2>
        </motion.div>

        {/* Symptoms / Clinical Cards */}
        <ul className="space-y-5">
          {symptomsData.map((item, i) => (
            <motion.li
              key={item.id || i}
              className="group p-6 md:p-8 rounded-2xl bg-white border border-lab-border hover:border-brand-magenta/40 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              {/* Header: Badge + Icon */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span
                  className="inline-flex items-center font-sora text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.badge}
                </span>

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
              </div>

              {/* Quote Text */}
              <p className="font-sora font-bold text-foreground text-[18px] md:text-[20px] leading-snug my-3">
                {item.quote}
              </p>

              {/* Subtle divider */}
              <div className="w-full h-px bg-lab-border/60 my-4" />

              {/* Clinical Prescription (Rx) */}
              <p className="font-inter text-sm text-lab-text-secondary leading-relaxed">
                <span className="font-sora font-extrabold text-sm mr-2 inline-block" style={{ color: item.color }}>
                  Rx →
                </span>
                {item.rxText}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ValueSection;
