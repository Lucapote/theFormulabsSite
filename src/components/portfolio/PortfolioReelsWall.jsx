import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Filter } from "lucide-react";
import PortfolioReelCard from "./PortfolioReelCard";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_REELS } from "@/data/portfolioData";

/**
 * PortfolioReelsWall
 * Muro completo de publicaciones en video verticales con filtros por nicho/categoría.
 */
export default function PortfolioReelsWall() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredReels = useMemo(() => {
    if (activeCategory === "all") return PORTFOLIO_REELS;
    return PORTFOLIO_REELS.filter((r) => r.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="muro" className="py-16 md:py-24 bg-white border-y border-gray-100 relative">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-mono font-bold uppercase text-brand-blue">
              <Film className="w-3.5 h-3.5" />
              Banco de Producción
            </span>
            <h2 className="text-3xl sm:text-4xl font-sora font-extrabold tracking-tight text-gray-900">
              El muro de reels
            </h2>
            <p className="font-inter text-sm sm:text-base text-gray-500 max-w-2xl">
              Filtra por formato o industria. Pasa el cursor o pulsa para reproducir cualquier reel de forma instantánea.
            </p>
          </div>

          {/* Filter Pills (View Switcher debajo de la descripción) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-gray-100 border border-gray-200 self-start">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-sora text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReels.map((reel) => (
              <motion.div
                key={reel.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <PortfolioReelCard reel={reel} autoPlayOnHover={true} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

