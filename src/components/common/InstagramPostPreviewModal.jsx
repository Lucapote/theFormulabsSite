import { useEffect } from "react";
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
  onNextPost = null
}) {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
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
        className="max-w-md w-full max-h-[90vh] aspect-[9/16] sm:aspect-auto rounded-[28px] overflow-hidden bg-black relative border border-slate-800 shadow-2xl flex flex-col justify-between my-auto animate-in zoom-in-95 duration-200"
      >
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
            archivos={post.archivos}
            tipo={post.tipo_post}
            posterUrl={post.archivos?.[0]?.thumbnail_url}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-contain"
          />
        </div>

        {/* Anchored Bottom Sheet Drawer with Copywriting & Details */}
        <PostCopyBottomSheet
          post={post}
          isInternal={isInternal}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
