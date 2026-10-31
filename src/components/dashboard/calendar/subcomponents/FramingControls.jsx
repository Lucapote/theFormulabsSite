import {
  ZoomIn,
  RotateCcw,
  Check,
  Layers,
  Grid3X3,
  Maximize2,
  Minimize2
} from "lucide-react";
import { ASPECT_RATIOS, BACKGROUND_OPTIONS } from "@/utils/canvasFramingHelper";

/**
 * FramingControls
 * Controls for selecting Instagram aspect ratio, contain/cover mode, background style, zoom, and slide thumbnails.
 */
export default function FramingControls({
  selectedRatioId,
  setSelectedRatioId,
  isContainMode,
  handleSetFitMode,
  showGrid,
  setShowGrid,
  handleResetSlide,
  currentTransform,
  updateCurrentTransform,
  imageItems,
  activeSlideIndex,
  setActiveSlideIndex
}) {
  return (
    <div className="space-y-4">
      {/* 1. SELECTOR DE FORMATO MAESTRO */}
      <div className="space-y-1.5">
        <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider block">
          1. Proporción Maestra para Instagram
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedRatioId === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => setSelectedRatioId(ratio.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-0.5 active:scale-[0.98] ${
                  isSelected
                    ? "border-brand-blue bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sora font-bold text-xs text-gray-900">
                    {ratio.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                </div>
                <span className="text-[10px] font-inter text-gray-500">
                  {ratio.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MODO Y CONTROLES DE ENCUADRE */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider block">
          2. Modo y Encuadre
        </label>

        {/* CONTROL SEGMENTADO ÚNICO Y CLARO: AJUSTAR VS RELLENAR */}
        <div className="bg-gray-100 p-0.5 rounded-full border border-gray-200 inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleSetFitMode("contain")}
            className={`h-7 px-3 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isContainMode
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Minimize2 className="w-3 h-3 text-brand-magenta" />
            <span>Ajustar (100% visible)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetFitMode("cover")}
            className={`h-7 px-3 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              !isContainMode
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Maximize2 className="w-3 h-3 text-brand-blue" />
            <span>Rellenar (Cubrir)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1 active:scale-95 ${
              showGrid ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200"
            }`}
            title="Alternar cuadrícula de tercios"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetSlide}
            className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
            title="Restablecer posición, escala y fondo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CONTROLES DE FONDO Y ZOOM */}
      <div className="space-y-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
        {/* SELECTOR DE FONDO: Visible en modo Ajustar */}
        {isContainMode && (
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-200/60 flex-wrap">
            <span className="text-[11px] font-sora font-bold text-gray-700 uppercase tracking-wide">
              Fondo de Márgenes:
            </span>
            <div className="flex items-center gap-1.5">
              {BACKGROUND_OPTIONS.map((bg) => {
                const isSelected = (currentTransform.bgType || "black") === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => updateCurrentTransform({ bgType: bg.id })}
                    className={`h-7 px-2.5 rounded-full text-xs font-sora font-semibold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs ring-2 ring-gray-900/10"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${bg.colorClass}`} />
                    <span className="text-[11px]">{bg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Slider de Zoom ampliado (0.5x a 3.0x) */}
        <div className="flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs font-sora font-semibold text-gray-600 shrink-0">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={currentTransform.zoom || 1}
            onChange={(e) => updateCurrentTransform({ zoom: parseFloat(e.target.value) })}
            className="w-full accent-brand-blue cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
          <span className="text-xs font-mono font-bold text-gray-700 w-12 text-right">
            {(currentTransform.zoom || 1).toFixed(2)}x
          </span>
        </div>
      </div>

      {/* 3. TIRA DE DIAPOSITIVAS DEL CARRUSEL */}
      {imageItems.length > 1 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-blue" />
              Diapositivas ({imageItems.length})
            </span>
            <span className="text-[11px] font-inter text-gray-400">
              Personaliza cada imagen por separado
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {imageItems.map((item, idx) => {
              const isCurrent = activeSlideIndex === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative cursor-pointer active:scale-95 ${
                    isCurrent
                      ? "border-brand-blue scale-105 shadow-md ring-2 ring-blue-500/20"
                      : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={item.url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-mono font-bold px-1 rounded">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

