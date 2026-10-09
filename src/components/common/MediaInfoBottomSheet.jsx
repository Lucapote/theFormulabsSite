import { useState, useEffect } from "react";
import {
  Video as VideoIcon,
  Image as ImageIcon,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { getPostsByCalendario } from "@/services/calendarService";
import MediaInfoExpandedDetails from "./MediaInfoExpandedDetails";

export default function MediaInfoBottomSheet({
  media,
  posts = [],
  onDelete = null,
  showDelete = false,
  onEditPost = null,
  onAssignPost = null,
  onAddToExistingPost = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [associatedPosts, setAssociatedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!media) return;

    if (posts && Array.isArray(posts) && posts.length > 0) {
      const matches = posts.filter(
        (p) =>
          Array.isArray(p.archivos) &&
          p.archivos.some(
            (a) => (a.id && a.id === media.id) || (a.url && a.url === media.url)
          )
      );
      setAssociatedPosts(matches);
      return;
    }

    if (media.calendario_id) {
      setLoadingPosts(true);
      getPostsByCalendario(media.calendario_id)
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            const matches = res.data.filter(
              (p) =>
                Array.isArray(p.archivos) &&
                p.archivos.some(
                  (a) => (a.id && a.id === media.id) || (a.url && a.url === media.url)
                )
            );
            setAssociatedPosts(matches);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingPosts(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [media, posts]);

  if (!media) return null;

  const copyMediaUrl = (e) => {
    e?.stopPropagation();
    if (media.url) {
      navigator.clipboard.writeText(media.url);
      setCopied(true);
      toast.success("Enlace del archivo copiado al portapapeles.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVideo = media.tipo === "video";
  const isInUse = Boolean(media.en_uso || associatedPosts.length > 0);

  const availablePostsForAssignment = posts.filter((p) => {
    const fileCount = Array.isArray(p.archivos) ? p.archivos.length : 0;
    if (p.tipo_post === "carrousel") {
      return fileCount < 20;
    }
    if (p.tipo_post === "reel") {
      return isVideo && fileCount === 0;
    }
    return false;
  });

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-100 rounded-t-3xl shadow-2xl p-4 transition-all duration-300 relative z-20 flex flex-col max-h-[75vh] shrink-0 font-inter">
      {/* Top Touch Handle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col items-center cursor-pointer py-1 select-none group"
      >
        <div className="w-12 h-1 bg-slate-600 group-hover:bg-slate-400 rounded-full transition-colors my-1" />
      </div>

      {isExpanded ? (
        <MediaInfoExpandedDetails
          media={media}
          isVideo={isVideo}
          isInUse={isInUse}
          loadingPosts={loadingPosts}
          associatedPosts={associatedPosts}
          availablePostsForAssignment={availablePostsForAssignment}
          onAddToExistingPost={onAddToExistingPost}
          onAssignPost={onAssignPost}
          onEditPost={onEditPost}
          onDelete={onDelete}
          showDelete={showDelete}
          copied={copied}
          copyMediaUrl={copyMediaUrl}
          setIsExpanded={setIsExpanded}
        />
      ) : (
        /* COLLAPSED STATE PREVIEW */
        <div
          onClick={() => setIsExpanded(true)}
          className="cursor-pointer space-y-2 select-none group"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-sora font-extrabold text-slate-100 text-sm truncate flex-1 group-hover:text-white transition-colors"
              title={media.nombre_archivo}
            >
              {media.nombre_archivo || "Archivo de Galería"}
            </h3>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-sora font-bold px-2 py-0.5 rounded-full uppercase border ${
                  isInUse
                    ? "bg-purple-950/70 text-purple-300 border-purple-800/60"
                    : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                }`}
              >
                {isInUse ? "En uso" : "Disponible"}
              </span>

              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              {isVideo ? (
                <VideoIcon className="w-3 h-3 text-pink-400" />
              ) : (
                <ImageIcon className="w-3 h-3 text-sky-400" />
              )}
              {isVideo ? "Video / Reel" : "Imagen"}
            </span>
            <span className="text-[10px] text-pink-400 font-semibold group-hover:underline">
              {isInUse ? "Toca para ver detalles ↑" : "Toca para asignar a publicación ↑"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
