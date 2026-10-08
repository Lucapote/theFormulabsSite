import { Film } from "lucide-react";
import MediaCarousel from "@/components/common/MediaCarousel";

/**
 * PostMediaPreview
 * Renders video, image, or carousel for an Instagram-style post preview.
 */
export default function PostMediaPreview({
  archivos = [],
  tipo = "image",
  posterUrl = null,
  containerClassName = "w-full h-full",
  imageClassName = "w-full h-full object-contain"
}) {
  const normalizedFiles = Array.isArray(archivos) ? archivos : [];
  const isCarousel = tipo === "carrousel" || tipo === "carousel" || normalizedFiles.length > 1;
  const isVideo = tipo === "reel" || (normalizedFiles.length === 1 && normalizedFiles[0]?.tipo === "video");

  if (normalizedFiles.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center bg-black text-slate-500 p-8 ${containerClassName}`}>
        <Film className="w-12 h-12 mb-2 opacity-30 text-slate-400" />
        <p className="text-xs font-medium text-slate-400">Sin archivo multimedia</p>
      </div>
    );
  }

  if (isCarousel) {
    return (
      <div className={`relative bg-black flex items-center justify-center overflow-hidden ${containerClassName}`}>
        <MediaCarousel
          files={normalizedFiles}
          containerClassName="w-full h-full min-h-[300px] max-h-[60vh] sm:max-h-[70vh]"
          imageClassName={imageClassName}
          showControls={true}
          showDots={true}
          activeDotColorClass="bg-pink-500 w-5"
        />
      </div>
    );
  }

  const singleFile = normalizedFiles[0];

  if (isVideo || singleFile.tipo === "video") {
    return (
      <div className={`relative bg-black flex items-center justify-center overflow-hidden ${containerClassName}`}>
        <video
          src={singleFile.url}
          controls
          playsInline
          preload="metadata"
          poster={posterUrl || singleFile.thumbnail_url || undefined}
          className="w-full h-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden ${containerClassName}`}>
      <img
        src={singleFile.url}
        alt={singleFile.nombre_archivo || "Media preview"}
        className={`${imageClassName} max-h-[60vh] sm:max-h-[70vh]`}
        loading="eager"
      />
    </div>
  );
}
