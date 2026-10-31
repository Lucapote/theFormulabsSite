import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import PortfolioMarquee from "./PortfolioMarquee";
import { PORTFOLIO_REELS } from "@/data/portfolioData";

/**
 * PortfolioHero
 * Cabecera principal del Portafolio con tipografía display, badge de laboratorio,
 * bajada descriptiva integrada bajo el titular y la tira continua de reels.
 */
export default function PortfolioHero() {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-16 relative overflow-hidden bg-[#f4f4f4]">
      {/* Subtle ambient lab radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-6 relative z-10 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-5"
        >
          {/* Lab eyebrow badge */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-mono font-bold uppercase text-brand-magenta shadow-xs">
            Laboratorio de Contenido Orgánico · Cancún
          </span>

          {/* Display headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sora font-black tracking-tight text-gray-900 leading-[1.02]">
            Contenido con <span className="text-brand-magenta">fórmula</span>, no con suerte.
          </h1>

          {/* Bajada descriptiva directamente bajo el titular */}
          <p className="font-inter text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl pt-1">
            Videos pensados para retener en el primer segundo, explicar en quince y convertir antes del final. Sin formatos genéricos.
          </p>

          {/* Acceso interactivo al muro */}
          <div className="pt-2">
            <a
              href="#reels"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-600 hover:text-brand-magenta transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-brand-blue animate-bounce" />
              <span>Explora el muro de producción</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Marquee Slider */}
      <PortfolioMarquee reels={PORTFOLIO_REELS} />
    </section>
  );
}
