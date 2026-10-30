import { motion } from "framer-motion";
import { Camera, Film } from "lucide-react";
import { BTS_SHOTS } from "@/data/portfolioData";

/**
 * PortfolioBtsStrip
 * Sección 'Toma 47': El laboratorio por dentro y proceso de rodaje.
 * Tarjetas estilo polaroid técnica con fotografías y micro-clips de grabación.
 */
export default function PortfolioBtsStrip() {
  return (
    <section id="bts" className="py-16 md:py-24 bg-[#f4f4f4] border-b border-gray-200 overflow-hidden">
      <div className="container max-w-6xl mx-auto px-6 mb-10">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-mono font-bold uppercase text-brand-magenta shadow-xs">
            <Camera className="w-3.5 h-3.5" />
            Detrás de Cámaras
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-extrabold tracking-tight text-gray-900">
            Toma 47
          </h2>
          <p className="font-inter text-sm sm:text-base text-gray-600">
            Así se ve el laboratorio por dentro. Ninguna toma memorable salió a la primera.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll / Grid of Polaroids */}
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {BTS_SHOTS.map((shot, idx) => (
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between h-full space-y-2.5 ${shot.rotation}`}
            >
              {/* Media Container */}
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-900 relative shrink-0">
                {shot.imgUrl ? (
                  <img
                    src={shot.imgUrl}
                    alt={shot.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={shot.videoPreview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Title & Tag */}
              <div className="space-y-0.5">
                <h4 className="font-sora font-bold text-xs text-gray-900 leading-tight">
                  {shot.title}
                </h4>
                <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                  {shot.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

