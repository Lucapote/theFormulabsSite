import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

/**
 * PortfolioReelCard
 * Tarjeta interactiva estilo Smartphone vertical (9:16) con reproducción inline,
 * control de audio y badges de laboratorio.
 */
export default function PortfolioReelCard({
  reel,
  autoPlayOnHover = true,
  className = ""
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseEnter = () => {
    if (autoPlayOnHover && videoRef.current && !isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayOnHover && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      className={`relative aspect-[9/16] rounded-[26px] overflow-hidden bg-slate-950 border-[5px] border-gray-900 shadow-xl group cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between p-3.5 ${className}`}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:brightness-105"
      />

      {/* Gradient & Specular highlight for crystal-clear readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      {/* Top Header: Client Badge + Controls */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              reel.colorAccent === "#188ff0" ? "bg-brand-blue" : "bg-brand-magenta"
            }`}
          />
          {reel.client}
        </span>

        <div className="flex items-center gap-1">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-brand-blue" />}
          </button>
        </div>
      </div>

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Information */}
      <div className="relative z-10 space-y-1 text-white">
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
