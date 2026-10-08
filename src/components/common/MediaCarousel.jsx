import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

export default function MediaCarousel({
  files = [],
  initialIndex = 0,
  onIndexChange = null,
  onMediaClick = null,
  containerClassName = "min-h-[300px] md:min-h-[400px] max-h-[500px]",
  imageClassName = "max-h-[480px] w-full object-contain",
  showControls = true,
  showDots = true,
  activeDotColorClass = "bg-white w-5",
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const carouselRef = useRef(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
    if (carouselRef.current && initialIndex > 0) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: initialIndex * slideWidth,
        behavior: "instant"
      });
    }
  }, [initialIndex]);

  if (!files || files.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 bg-gray-950 flex flex-col items-center justify-center ${containerClassName}`}>
        <Film className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p className="text-xs">Sin archivo multimedia</p>
      </div>
    );
  }

  const scrollToSlide = (idx, e) => {
    if (e) e.stopPropagation();
    setActiveIndex(idx);
    if (onIndexChange) onIndexChange(idx);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: idx * slideWidth,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const slideWidth = carouselRef.current.clientWidth;
    if (slideWidth > 0) {
      const idx = Math.round(carouselRef.current.scrollLeft / slideWidth);
      if (idx >= 0 && idx < files.length && idx !== activeIndex) {
        setActiveIndex(idx);
        if (onIndexChange) onIndexChange(idx);
      }
    }
  };

  const hasMultiple = files.length > 1;

  return (
    <div className={`relative bg-gray-950 w-full overflow-hidden flex items-center justify-center ${containerClassName}`}>
      {/* Scrollable Container */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x touch-pan-y"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {files.map((file, idx) => (
          <div
            key={file.id || idx}
            className="w-full h-full flex-none snap-center flex items-center justify-center relative p-1 sm:p-2"
          >
            {file.tipo === "video" ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <video
                  src={file.url}
                  controls
                  preload="metadata"
                  playsInline
                  poster={file.thumbnail_url || undefined}
                  className={imageClassName}
                />
              </div>
            ) : (
              <img
                src={file.url}
                alt={`Media ${idx + 1}`}
                loading="eager"
                className={`${imageClassName} ${onMediaClick ? "cursor-pointer" : ""}`}
                onClick={(e) => {
                  if (onMediaClick) {
                    onMediaClick(idx, e);
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Desktop Arrow Controls */}
      {showControls && hasMultiple && (
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-between pointer-events-none z-10">
          <button
            type="button"
            onClick={(e) => scrollToSlide(activeIndex === 0 ? files.length - 1 : activeIndex - 1, e)}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all shadow-md hover:scale-105"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => scrollToSlide(activeIndex === files.length - 1 ? 0 : activeIndex + 1, e)}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all shadow-md hover:scale-105"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dot Indicators */}
      {showDots && hasMultiple && (
        <div className="absolute bottom-3 z-10 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-md">
          {files.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => scrollToSlide(idx, e)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === activeIndex ? activeDotColorClass : "bg-white/40 w-2 hover:bg-white/70"
              }`}
              aria-label={`Ir a foto ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
