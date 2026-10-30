import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PORTFOLIO_BRANDS } from "@/data/portfolioData";

/**
 * PortfolioBrandsGrid
 * Rejilla de marcas que han colaborado con el laboratorio.
 */
export default function PortfolioBrandsGrid() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-100">
      <div className="container max-w-6xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-mono font-bold uppercase text-gray-700">
            Ecosistema The Formulab
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sora font-extrabold tracking-tight text-gray-900">
            Marcas que han pasado por el laboratorio
          </h2>
          <p className="font-inter text-sm text-gray-500">
            Desde gastronomía tradicional y alta joyería hasta consultores y marcas personales de alto impacto.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {PORTFOLIO_BRANDS.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-brand-magenta/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-sora font-black text-base text-gray-900 group-hover:text-brand-magenta transition-colors">
                  {brand.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-brand-magenta shrink-0" />
              </div>
              <span className="font-inter text-xs text-gray-500">
                {brand.niche}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

