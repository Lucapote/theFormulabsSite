import { motion } from "framer-motion";
import InteractiveDiagnosticForm from "./InteractiveDiagnosticForm";

const OfferSection = () => {
  return (
    <section id="oferta" className="py-24 md:py-32 relative">
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          className="rounded-2xl lab-card p-8 md:p-12 relative overflow-hidden"
          style={{ boxShadow: "0 8px 40px -12px hsl(172 66% 40% / 0.1), 0 2px 8px -2px hsl(220 25% 10% / 0.06)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 lab-dot-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

          <div className="relative z-10">
            <InteractiveDiagnosticForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferSection;

