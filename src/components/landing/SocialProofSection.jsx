import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { casesData } from "@/data";

const SocialProofSection = () => {
  return (
    <section className="py-24 md:py-32 relative" id="casos">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="lab-mono mb-3 block text-brand-magenta font-mono tracking-widest uppercase text-xs">Casos clínicos</span>
          <h2 className="text-3xl md:text-[2.5rem] font-sora font-extrabold tracking-tight text-foreground leading-tight">
            Resultados medibles,{" "}
            <span className="text-gradient">no promesas.</span>
          </h2>
        </motion.div>

        <ul className="grid md:grid-cols-3 gap-5">
          {casesData.map((c, i) => (
            <motion.li
              key={c.name}
              className="flex flex-col p-6 rounded-2xl lab-card lab-card-hover transition-all duration-500 bg-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              {/* Result header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl font-sora font-extrabold" style={{ color: c.color }}>{c.result}</div>
                  <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-lab-text-tertiary mt-1 font-semibold">{c.metric}</div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-lab-border">
                  <ArrowUpRight className="w-4 h-4" style={{ color: c.color }} />
                </div>
              </div>

              {/* Before/After */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 p-3 rounded-xl bg-brand-neutral/80 border border-lab-border/60">
                  <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-lab-text-tertiary mb-1 font-bold">Antes</div>
                  <div className="text-[11px] text-lab-text-secondary leading-snug font-inter">{c.before}</div>
                </div>
                <div className="flex-1 p-3 rounded-xl border border-lab-border/60" style={{ backgroundColor: `${c.color}10` }}>
                  <div className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1 font-bold" style={{ color: c.color }}>Después</div>
                  <div className="text-[11px] text-foreground leading-snug font-inter font-medium">{c.after}</div>
                </div>
              </div>

              <blockquote className="text-lab-text-secondary text-[13px] leading-relaxed mb-6 flex-1 font-inter">"{c.quote}"</blockquote>

              <div className="pt-4 border-t border-lab-border">
                <div className="font-sora font-bold text-sm text-foreground">{c.name}</div>
                <div className="text-lab-text-tertiary text-[11px] font-inter">{c.role}</div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SocialProofSection;
