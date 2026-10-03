import { motion } from "framer-motion";
import InteractiveDiagnosticForm from "./InteractiveDiagnosticForm";

const OfferSection = () => {
  return (
    <section id="oferta" className="py-24 md:py-32 relative">
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          className="rounded-3xl lab-card p-8 md:p-12 relative overflow-hidden bg-white/90 shadow-xl border-lab-border"
          style={{ boxShadow: "0 12px 50px -15px rgba(24, 143, 240, 0.15), 0 4px 15px -4px rgba(239, 24, 214, 0.08)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 lab-dot-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />

          <div className="relative z-10">
            <InteractiveDiagnosticForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;
