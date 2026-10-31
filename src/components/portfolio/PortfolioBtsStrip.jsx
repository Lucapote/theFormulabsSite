import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Film } from "lucide-react";
import { BTS_SHOTS } from "@/data/portfolioData";

/**
 * BtsPolaroidCard
 * Tarjeta técnica detrás de cámaras con carga diferida (lazy load) estricta:
 * los clips de video no adjuntan stream ni consumen red hasta la interacción del usuario.
 */
function BtsPolaroidCard({ shot, idx }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleToggle = () => {
    if (!shot.videoPreview) return;
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current) {
        if (!videoRef.current.src) {
          videoRef.current.src = shot.videoPreview;
          videoRef.current.load();
        }
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.08 }}
      onClick={handleToggle}
      className={`p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between h-full space-y-2.5 ${
        shot.rotation
      } ${shot.videoPreview ? "cursor-pointer" : ""}`}
    >
      {/* Media Container con carga diferida */}
      <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-900 relative shrink-0">
        <img
          src={shot.imgUrl || shot.posterUrl}
          alt={shot.title}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />

        {shot.videoPreview && (
          <>
            <video
              ref={videoRef}
              poster={shot.posterUrl}
              loop
              muted
              playsInline
              webkit-playsinline="true"
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover ${
                isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />
            {!isPlaying && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xs">
                <Film className="w-3 h-3 text-brand-magenta" />
              </div>
            )}
          </>
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
  );
}

/**
 * PortfolioBtsStrip
 * Sección 'Toma 47': El laboratorio por dentro y proceso de rodaje.
 * Tarjetas estilo polaroid técnica con fotografías y micro-clips de grabación diferidos.
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

      {/* Grid of Polaroids */}
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {BTS_SHOTS.map((shot, idx) => (
            <BtsPolaroidCard key={shot.id} shot={shot} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
