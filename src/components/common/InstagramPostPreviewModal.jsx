import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import PostMediaPreview from "./PostMediaPreview";
import PostCopyBottomSheet from "./PostCopyBottomSheet";

/**
 * InstagramPostPreviewModal
 * High-impact Instagram story/reel style mobile preview modal.
 */
export default function InstagramPostPreviewModal({
  post,
  onClose,
  onEdit = null,
  isInternal = false,
  hasPrevPost = false,
  hasNextPost = false,
  onPrevPost = null,
  onNextPost = null,
  permiteDescarga = false
}) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [post?.id]);
  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && hasPrevPost && onPrevPost) {
        onPrevPost(e);
      } else if (e.key === "ArrowRight" && hasNextPost && onNextPost) {
        onNextPost(e);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [post, hasPrevPost, hasNextPost, onPrevPost, onNextPost, onClose]);

  if (!post) return null;

  const files = Array.isArray(post.archivos)
    ? post.archivos
    : typeof post.archivos === "string"
    ? (() => {
        try {
          return JSON.parse(post.archivos);
        } catch {
          return [];
        }
      })()
    : [];
  const hasMultiple = files.length > 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto no-scrollbar"
    >
      {/* Navigation Arrows for Post-to-Post browsing (Desktop) */}
      {hasPrevPost && onPrevPost && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrevPost(e);
          }}
          className="hidden md:flex fixed left-3 md:left-8 top-1/2 -translate-y-1/2 z-[120] w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl group hover:scale-110"
          title="Publicación anterior"
        >
          <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform text-white" />
        </button>
      )}

      {hasNextPost && onNextPost && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNextPost(e);
          }}
          className="hidden md:flex fixed right-3 md:right-8 top-1/2 -translate-y-1/2 z-[120] w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl group hover:scale-110"
          title="Siguiente publicación"
        >
          <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform text-white" />
        </button>
      )}

      {/* Centered Mobile Phone Frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-[28px] overflow-hidden bg-black relative border border-slate-800 shadow-2xl flex flex-col justify-between my-auto animate-in zoom-in-95 duration-200 no-scrollbar"
      >
        {/* Floating Top-Left Slide Counter Badge (e.g. 1/6) */}
        {hasMultiple && (
          <div className="absolute top-3.5 left-3.5 z-30 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white/95 text-[11px] font-mono font-bold border border-white/15 shadow-lg flex items-center gap-1 pointer-events-none">
            <span>{activeMediaIndex + 1}</span>
            <span className="text-white/40">/</span>
            <span>{files.length}</span>
          </div>
        )}

        {/* Floating Top-Right Translucent Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/10"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Background Area */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center relative overflow-hidden bg-black">
          <PostMediaPreview
            archivos={files}
            tipo={post.tipo_post}
            posterUrl={files?.[0]?.thumbnail_url}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-contain"
            initialIndex={activeMediaIndex}
            onIndexChange={setActiveMediaIndex}
            showDots={false}
          />

          {/* Instagram-style Carousel Visual Indicator Pill Tool (From Photo 1) */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/75 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-2xl pointer-events-auto">
              {files.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex(idx);
                  }}
                  className={`rounded-full transition-all duration-200 cursor-pointer ${
                    idx === activeMediaIndex
                      ? "bg-pink-500 w-6 h-2 shadow-sm shadow-pink-500/50"
                      : "bg-white/40 hover:bg-white/80 w-2 h-2"
                  }`}
                  aria-label={`Ir a diapositiva ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Anchored Bottom Sheet Drawer with Copywriting & Details */}
        <PostCopyBottomSheet
          post={post}
          isInternal={isInternal}
          onEdit={onEdit}
          permiteDescarga={permiteDescarga}
          activeMediaIndex={activeMediaIndex}
        />
      </div>
    </div>
  );
}
