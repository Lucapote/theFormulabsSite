import { motion } from "framer-motion";
import { clientsData } from "@/data";

const ClientsSection = () => {
  return (
    <section className="w-full py-16 lg:py-24 relative overflow-hidden bg-background" id="clientes">
      <div className="container max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Prominent High-Visibility Section Header */}
        <motion.div
          className="text-center mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-magenta/30 bg-white text-[11px] font-mono font-bold uppercase text-brand-magenta shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
            Ecosistemas de Impacto
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-sora font-extrabold tracking-tight text-foreground leading-tight">
            Fórmulas de conversión{" "}
            <span className="text-gradient block sm:inline">probadas en diversas industrias.</span>
          </h2>
        </motion.div>
        
        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {clientsData.map((client, i) => (
            <motion.div
              key={client.id}
              className="p-6 rounded-2xl bg-white border border-lab-border hover:border-brand-magenta/30 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div>
                {/* Header: Name + Indicator Dot */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sora font-extrabold text-lg text-foreground group-hover:text-brand-magenta transition-colors">
                    {client.name}
                  </h3>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: client.color }}
                  />
                </div>

                {/* Micro-Context: Niche · Authority */}
                <div className="font-inter text-xs leading-relaxed text-lab-text-secondary">
                  <span>{client.niche}</span>
                  <span className="text-lab-text-tertiary font-bold mx-1.5">·</span>
                  <span
                    className="font-sora font-bold"
                    style={{ color: client.color }}
                  >
                    {client.authority}
                  </span>
                </div>
              </div>

              {/* Bottom decorative bar */}
              <div
                className="w-8 h-[2px] mt-4 transition-all duration-300 group-hover:w-16"
                style={{ backgroundColor: client.color }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
