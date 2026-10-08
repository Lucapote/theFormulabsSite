import { useEffect } from "react";
import { X } from "lucide-react";
import PostMediaPreview from "./PostMediaPreview";
import MediaInfoBottomSheet from "./MediaInfoBottomSheet";

/**
 * MediaDetailModal
 * High-impact Instagram-style media detail preview modal with phone frame & dark bottom sheet.
 */
export default function MediaDetailModal({
  media,
  posts = [],
  onClose,
  onDelete = null,
  showDelete = false,
  onEditPost = null,
  onAssignPost = null,
  onAddToExistingPost = null
}) {
  useEffect(() => {
    if (!media) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media, onClose]);

  if (!media) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
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

        {/* Media Preview Area */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center relative overflow-hidden bg-black">
          <PostMediaPreview
            archivos={media.archivos || [media]}
            tipo={media.tipo_post || (media.tipo === "video" ? "reel" : "image")}
            posterUrl={media.thumbnail_url}
            containerClassName="w-full h-full"
            imageClassName="w-full h-full object-contain"
          />
        </div>

        {/* Anchored Bottom Sheet Drawer */}
        <MediaInfoBottomSheet
          media={media}
          posts={posts}
          onDelete={onDelete ? (m) => {
            onClose();
            onDelete(m);
          } : null}
          showDelete={showDelete}
          onEditPost={onEditPost ? (p) => {
            onClose();
            onEditPost(p);
          } : null}
          onAssignPost={onAssignPost ? (m, tipo) => {
            onClose();
            onAssignPost(m, tipo);
          } : null}
          onAddToExistingPost={onAddToExistingPost ? (m, p) => {
            onClose();
            onAddToExistingPost(m, p);
          } : null}
        />
      </div>
    </div>
  );
}
