import { useState, useRef, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

/**
 * PortfolioCompareSlider
 * Comparador visual interactivo táctil 'En el set vs Resultado final'.
 * Permite deslizar con ratón, toque o teclado.
 */
export default function PortfolioCompareSlider({
  setImg,
  finalImg,
  setLabel = "En el set",
  finalLabel = "Resultado final"
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleSliderChange = (e) => {
    setSliderPos(Number(e.target.value));
  };

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-[24px] overflow-hidden border border-gray-200 shadow-md select-none bg-gray-900 group"
      >
        {/* Layer 1: Set Image (Base / Raw) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={setImg}
            alt={setLabel}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
            {setLabel}
          </div>
        </div>

        {/* Layer 2: Final Image (Revealed by clipPath) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <img
            src={finalImg}
            alt={finalLabel}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-brand-blue/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
            {finalLabel}
          </div>
        </div>

        {/* Divider Handle Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] pointer-events-none z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-gray-900 shadow-lg flex items-center justify-center border border-gray-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-magenta" />
          </div>
        </div>

        {/* Invisible Range Input for Full Touch/Mouse & Accessibility */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSliderChange}
          aria-label="Comparar el set con el resultado final"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-gray-300 font-bold uppercase tracking-wider">
        <span>← {setLabel}</span>
        <span className="text-brand-magenta font-extrabold">Desliza para comparar</span>
        <span>{finalLabel} →</span>
      </div>
    </div>
  );
}

