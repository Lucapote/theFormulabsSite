import { Move, Check, AlertCircle } from "lucide-react";

/**
 * FramingViewport
 * Renders the interactive camera framing canvas with grid overlay and gestures.
 */
export default function FramingViewport({
  containerRef,
  containerWidth,
  containerHeight,
  geometry,
  activeItem,
  currentTransform,
  showGrid,
  handleMouseDown,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
}) {
  return (
    <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-gray-200 shadow-inner">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative overflow-hidden select-none rounded-xl transition-colors ${
          geometry.canPanX || geometry.canPanY
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        } ${
          currentTransform.bgType === "white"
            ? "bg-white"
            : currentTransform.bgType === "blur"
            ? "bg-slate-900"
            : "bg-black"
        }`}
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`
        }}
      >
        {/* Fondo Desenfoque (Blur) si está seleccionado */}
        {activeItem && currentTransform.bgType === "blur" && (
          <img
            src={activeItem.url}
            alt="Fondo Blur"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70 pointer-events-none"
          />
        )}

        {/* Imagen Principal con Geometría Real */}
        {activeItem ? (
          <img
            src={activeItem.url}
            alt="Encuadre"
            draggable={false}
            style={{
              position: "absolute",
              left: `${geometry.left}px`,
              top: `${geometry.top}px`,
              width: `${geometry.width}px`,
              height: `${geometry.height}px`,
              maxWidth: "none",
              maxHeight: "none"
            }}
            className="pointer-events-none select-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
            <AlertCircle className="w-6 h-6 mb-1 text-gray-600" />
            <span>No hay imágenes seleccionadas</span>
          </div>
        )}

        {/* Cuadrícula de tercios superpuesta */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div />
          </div>
        )}

        {/* Indicador de arrastre / encuadre */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full pointer-events-none flex items-center gap-1">
          {geometry.canPanX || geometry.canPanY ? (
            <>
              <Move className="w-3 h-3 text-brand-blue" /> Arrastra para encuadrar
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-400" /> 100% visible
            </>
          )}
        </div>
      </div>
    </div>
  );
}

