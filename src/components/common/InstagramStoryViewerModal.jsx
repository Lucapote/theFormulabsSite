import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import StoryInstructionsDrawer from "./subcomponents/StoryInstructionsDrawer";
import PostFeedbackModal from "./PostFeedbackModal";

/**
 * InstagramStoryViewerModal
 * Visor interactivo nativo de Instagram Stories en proporción vertical 9:16.
 * Incluye barras segmentadas, toques laterales, pausa al mantener presionado y cajón de instrucciones.
 * Cumple con GEMINI.md ($\le 250$ líneas).
 */
export default function InstagramStoryViewerModal({
  post,
  onClose,
  isInternal = false,
  hasPrevPost = false,
  hasNextPost = false,
  onPrevPost = null,
  onNextPost = null,
  permiteDescarga = false,
  onPostUpdated = null
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const videoRef = useRef(null);

  const files = Array.isArray(post?.archivos)
    ? post.archivos
    : typeof post?.archivos === "string"
    ? (() => {
        try {
          return JSON.parse(post.archivos);
        } catch {
          return [];
        }
      })()
    : [];

  const effectiveFiles = files.length > 0 ? files : post?.url ? [{ url: post.url, tipo: post.tipo_post === "reel" ? "video" : "image" }] : [];
  const totalSlides = Math.max(1, effectiveFiles.length);
  const currentFile = effectiveFiles[activeSlide] || null;
  const isVideo = currentFile?.tipo === "video" || /\.(mp4|mov|webm)$/i.test(currentFile?.url || "");

  useEffect(() => {
    setActiveSlide(0);
  }, [post?.id]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, totalSlides, hasPrevPost, hasNextPost]);

  const handleNext = () => {
    if (activeSlide < totalSlides - 1) {
      setActiveSlide((prev) => prev + 1);
    } else if (hasNextPost && onNextPost) {
      onNextPost();
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    } else if (hasPrevPost && onPrevPost) {
      onPrevPost();
    }
  };

  const clienteNombre = post?.calendarios?.clientes?.nombre || "The Formulab";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Botones de Navegación Lateral en Desktop */}
      {hasPrevPost && onPrevPost && (
        <button
          type="button"
          onClick={onPrevPost}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer z-50 shadow-xl"
          title="Publicación anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNextPost && onNextPost && (
        <button
          type="button"
          onClick={onNextPost}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer z-50 shadow-xl"
          title="Siguiente publicación"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Contenedor del Móvil / Story Canvas 9:16 */}
      <div
        className="w-full sm:max-w-[400px] h-[100dvh] sm:h-[88vh] sm:max-h-[820px] aspect-[9/16] bg-black sm:rounded-[32px] overflow-hidden relative shadow-2xl flex flex-col justify-between border-0 sm:border sm:border-slate-800"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Barras Segmentadas Superiores */}
        <div className="absolute top-0 left-0 right-0 p-3 pt-3.5 flex items-center gap-1.5 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  idx < activeSlide
                    ? "w-full bg-white"
                    : idx === activeSlide
                    ? "w-full bg-white animate-pulse"
                    : "w-0 bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Cabecera Flotante */}
        <div className="absolute top-6 left-0 right-0 px-3.5 py-1.5 flex items-center justify-between z-40 text-white">
          <div className="flex items-center gap-2">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#ef18d6] to-[#188ff0] shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white font-sora font-extrabold text-xs">
                {clienteNombre.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <span className="font-sora font-bold text-xs text-white block leading-tight truncate max-w-[170px]">
                {clienteNombre}
              </span>
              <span className="text-[10px] font-mono text-white/80 block">
                {post?.hora_programada?.slice(0, 5) || "Historia"} • {activeSlide + 1}/{totalSlides}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Media Canvas */}
        <div className="w-full h-full relative flex items-center justify-center bg-black">
          {currentFile ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={currentFile.url}
                autoPlay
                playsInline
                muted={isMuted}
                loop={false}
                onEnded={handleNext}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentFile.url}
                alt={`Historia ${activeSlide + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
            )
          ) : (
            <div className="text-white text-center p-6 font-inter text-xs text-gray-400">
              No hay archivos asignados a este paquete de historias.
            </div>
          )}

          {/* Zonas de Toque Táctil para Navegar */}
          <div
            onClick={handlePrev}
            className="absolute top-16 bottom-20 left-0 w-[35%] z-30 cursor-pointer"
            title="Historia anterior"
          />
          <div
            onClick={handleNext}
            className="absolute top-16 bottom-20 right-0 w-[65%] z-30 cursor-pointer"
            title="Siguiente historia"
          />
        </div>

        {/* Cajón Inferior Deslizable de Instrucciones de Publicación */}
        <StoryInstructionsDrawer
          post={post}
          currentFile={currentFile}
          activeSlide={activeSlide}
          totalSlides={totalSlides}
          permiteDescarga={permiteDescarga}
          isInternal={isInternal}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onPostUpdated={onPostUpdated}
        />
      </div>

      {/* Modal para solicitar cambios */}
      {showFeedbackModal && (
        <PostFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          post={post}
          onSuccess={(updatedPost) => {
            if (onPostUpdated) onPostUpdated(updatedPost);
          }}
        />
      )}
    </div>
  );
}

