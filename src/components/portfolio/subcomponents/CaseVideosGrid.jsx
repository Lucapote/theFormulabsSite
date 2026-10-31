import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PortfolioReelCard from "../PortfolioReelCard";
import useViewportTier from "@/hooks/useViewportTier";

/**
 * CaseVideosGrid
 * Cuadrícula de videos para casos de estudio destacados (p. ej. Yamamoto).
 * En móviles implementa progressive disclosure mostrando máx. 2 videos por defecto
 * y permitiendo desplegar la totalidad mediante un botón táctil sobrio.
 */
export default function CaseVideosGrid({
  videos = [],
  clientName = "",
  colorAccent = "#ef18d6"
}) {
  const { isMobile } = useViewportTier();
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleVideos = useMemo(() => {
    if (isMobile && !isExpanded) {
      return videos.slice(0, 2);
    }
    return videos;
  }, [videos, isMobile, isExpanded]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleVideos.map((video) => (
          <div key={video.id} className="w-full">
            <PortfolioReelCard
              reel={{
                id: video.id,
                client: clientName,
                categoryLabel: "Reel",
                title: video.title,
                videoUrl: video.url,
                posterUrl: video.posterUrl,
                colorAccent: colorAccent
              }}
              autoPlayOnHover={true}
            />
          </div>
        ))}
      </div>

      {/* Progressive Disclosure Toggle Button (Mobile Only) */}
      {isMobile && videos.length > 2 && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="h-10 px-5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white font-sora text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>
              {isExpanded
                ? "Ver menos videos"
                : `Ver todos los videos (${videos.length})`}
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
  );
}

