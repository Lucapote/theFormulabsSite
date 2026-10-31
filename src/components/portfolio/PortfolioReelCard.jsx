import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";

/**
 * PortfolioReelCard
 * Tarjeta interactiva estilo Smartphone vertical (9:16).
 * Arquitectura High-Performance Mobile:
 * - Poster estático en WebP (<40KB) visible de inmediato: CERO pantallas negras en iOS.
 * - preload="none": No descarga 56MB de video en redes móviles.
 * - playsInline + webkit-playsinline: Reproducción en el propio marco sin abrir pantalla completa en Safari.
 * - Carga bajo demanda al interactuar (clic / tap / hover).
 */
export default function PortfolioReelCard({
  reel,
  autoPlayOnHover = true,
  className = ""
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setIsLoading(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          // En iOS modo ahorro de batería o políticas de autoplay, prevenir cuelgues
          console.warn("Reproducción pausada por el dispositivo:", err?.message);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const pausePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      startPlayback();
    }
  };

  const handleMouseEnter = () => {
    if (autoPlayOnHover && !isPlaying) {
      startPlayback();
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayOnHover && isPlaying) {
      pausePlayback();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      className={`relative aspect-[9/16] rounded-[26px] overflow-hidden bg-slate-950 border-[5px] border-gray-900 shadow-xl group cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between p-3.5 ${className}`}
    >
      {/* 1. Instant Poster Fallback (Cero pantallas negras en iOS / Android) */}
      {reel.posterUrl && (
        <img
          src={reel.posterUrl}
          alt={reel.title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* 2. Video Element con Atributos iOS / WebKit Estrictos */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.posterUrl}
        loop
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:brightness-105 ${
          isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 3. Gradiente y Reflejos Quirúrgicos para Legibilidad Absoluta */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none z-10" />

      {/* 4. Cabecera: Badge de Marca y Botón de Audio */}
      <div className="relative z-20 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              reel.colorAccent === "#188ff0" ? "bg-brand-blue" : "bg-brand-magenta"
            }`}
          />
          {reel.client}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-brand-blue" />
            )}
          </button>
        </div>
      </div>

      {/* 5. Centro: Indicador de Carga / Botón Play */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {isLoading ? (
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        ) : !isPlaying ? (
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </div>
        ) : null}
      </div>

      {/* 6. Pie: Título y Hook Narrativo */}
      <div className="relative z-20 space-y-1 text-white">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">
            {reel.categoryLabel}
          </span>
        </div>
        <h3 className="font-sora font-extrabold text-sm sm:text-base leading-tight drop-shadow-md text-white !text-white">
          {reel.title}
        </h3>
        {reel.hook && (
          <p className="font-inter text-[11px] leading-snug text-white/80 line-clamp-2 drop-shadow-xs">
            {reel.hook}
          </p>
        )}
      </div>
    </div>
  );
}
