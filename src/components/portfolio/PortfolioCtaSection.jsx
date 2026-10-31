import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Activity } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * PortfolioCtaSection
 * Llamada a la acción final para agendar diagnóstico y contacto directo por WhatsApp.
 */
export default function PortfolioCtaSection() {
  const whatsappNumber = "529983973595"; // Número oficial de contacto o fallback The Formulab
  const whatsappMsg = encodeURIComponent("¡Hola Formulab! Vi su portafolio de reels y me gustaría agendar una llamada estratégica para mi marca.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  return (
    <section id="llamada" className="py-20 md:py-28 bg-[#f4f4f4] relative overflow-hidden">
      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 md:p-16 rounded-[32px] bg-white border border-gray-200 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Subtle Lab decorative accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-magenta/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-blue/15 via-transparent to-transparent pointer-events-none" />

          {/* Left Text */}
          <div className="space-y-4 max-w-xl text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-xs font-mono font-bold uppercase text-brand-magenta">
              <Activity className="w-3.5 h-3.5" />
              Sesión de Diagnóstico
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sora font-black tracking-tight text-gray-900 leading-tight">
              ¿Cuál es tu <span className="text-brand-magenta">fórmula</span>?
            </h2>
            <p className="font-inter text-base text-gray-600 leading-relaxed">
              Realiza nuestro diagnóstico interactivo gratuito o escríbenos directamente. Analizaremos tu nicho y te mostraremos exactamente qué grabaríamos para tu negocio.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0 relative z-10">
            <Link
              to="/diagnostico"
              className="h-12 px-7 rounded-full bg-brand-magenta hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Comenzar Diagnóstico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

