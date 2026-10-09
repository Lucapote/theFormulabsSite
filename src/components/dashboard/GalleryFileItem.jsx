import { Check, Eye, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { useLongPress } from "@/hooks/useLongPress";

/**
 * GalleryFileItem
 * Atomic media item thumbnail for selecting media inside PostModal.
 */
export default function GalleryFileItem({
  file,
  isSelected = false,
  selectedIndex = 0,
  tipoPost = "reel",
  onSelect,
  onPreview
}) {
  const bindLongPress = useLongPress(
    () => onPreview(file),
    () => onSelect(file)
  );

  return (
    <div
      {...bindLongPress}
      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 group select-none ${
        isSelected
          ? "border-[#188ff0] ring-4 ring-blue-100 scale-[0.98]"
          : "border-gray-200 hover:border-blue-300 bg-gray-900"
      }`}
      title="Clic simple: Seleccionar • Mantener presionado: Vista previa"
    >
      {file.tipo === "video" ? (
        file.thumbnail_url ? (
          <img
            src={file.thumbnail_url}
            alt={file.nombre_archivo || "Media"}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <video
            src={file.url}
            muted
            preload="metadata"
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        )
      ) : (
        <img
          src={file.url}
          alt={file.nombre_archivo || "Media"}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Top-Left Order Badge / Check if Selected */}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-[#188ff0] text-white text-xs font-sora font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 pointer-events-none">
          {tipoPost === "carrousel" ? (
            selectedIndex + 1
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </div>
      )}

      {/* Top-Right Preview Eye Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview(file);
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20 shadow-md cursor-pointer"
        title="Ver detalles de medio"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* Bottom-Left Format Indicator Badge */}
      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-sora font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs pointer-events-none">
        {file.tipo === "video" ? (
          <VideoIcon className="w-2.5 h-2.5 text-white" />
        ) : (
          <ImageIcon className="w-2.5 h-2.5 text-white" />
        )}
      </span>
    </div>
  );
}
