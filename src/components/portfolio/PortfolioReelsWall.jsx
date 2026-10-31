import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, ChevronDown, ChevronUp } from "lucide-react";
import PortfolioReelCard from "./PortfolioReelCard";
import useViewportTier from "@/hooks/useViewportTier";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_REELS } from "@/data/portfolioData";

/**
 * PortfolioReelsWall
 * Muro completo de publicaciones en video verticales con filtros por nicho/categoría
 * y progressive disclosure para una navegación ergonómica en móviles.
 */
export default function PortfolioReelsWall() {
  const { isMobile } = useViewportTier();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setIsExpanded(false);
  };

  const filteredReels = useMemo(() => {
    if (activeCategory === "all") return PORTFOLIO_REELS;
    return PORTFOLIO_REELS.filter((r) => r.category === activeCategory);
  }, [activeCategory]);

  const visibleReels = useMemo(() => {
    if (isMobile && !isExpanded) {
      return filteredReels.slice(0, 2);
    }
    return filteredReels;
  }, [filteredReels, isMobile, isExpanded]);

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

          {/* Category Filter Chips (Riel deslizable horizontal en móvil, wrap limpio en desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full font-sora text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] shrink-0 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm border border-gray-900"
                      : "bg-gray-100/90 text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 border border-gray-200/80"
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
            {visibleReels.map((reel) => (
              <motion.div
                key={reel.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <PortfolioReelCard reel={reel} autoPlayOnHover={true} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progressive Disclosure Toggle Button (Mobile Only) */}
        {isMobile && filteredReels.length > 2 && (
          <div className="pt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="h-11 px-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-sora text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>
                {isExpanded
                  ? "Ver menos reels"
                  : `Ver todos los reels (${filteredReels.length})`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-brand-magenta" />
              ) : (
                <ChevronDown className="w-4 h-4 text-brand-blue" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

