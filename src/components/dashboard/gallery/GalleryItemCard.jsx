import { Play, Eye, Check, Trash2 } from "lucide-react";
import { useLongPress } from "@/hooks/useLongPress";

/**
 * GalleryItemCard
 * Modularized media card component.
 * Supports single click for preview / selection toggle and long press for multi-selection.
 */
export default function GalleryItemCard({
  item,
  isSelectMode,
  isSelected,
  isInUse,
  onLongPress,
  onClickItem,
  onSingleDelete
}) {
  const bindLongPress = useLongPress(
    () => onLongPress(item),
    () => onClickItem(item)
  );

  // In selection mode, a standard click toggles selection instantly.
  // In normal mode, long-press activates selection mode, while quick click opens preview.
  const eventHandlers = isSelectMode
    ? { onClick: () => onClickItem(item) }
    : bindLongPress;

  return (
    <div
      {...eventHandlers}
      className={`group bg-gray-900 rounded-[1.5rem] overflow-hidden relative aspect-square shadow-md transition-all cursor-pointer border-2 select-none ${
        isSelected
          ? "border-pink-500 ring-4 ring-pink-500/20 scale-[0.98]"
          : "border-gray-100 hover:border-pink-300 hover:shadow-xl"
      }`}
      title={
        isSelectMode
          ? "Clic para seleccionar/deseleccionar"
          : "Clic simple: Vista previa • Mantener presionado: Selección múltiple"
      }
    >
      {/* Image or Video Preview */}
      {item.tipo === "video" ? (
        <div className="w-full h-full relative bg-gray-950 flex items-center justify-center pointer-events-none">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.nombre_archivo}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
          ) : (
            <video
              src={item.url}
              muted
              preload="metadata"
              playsInline
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
          )}
          <div className="absolute inset-0 bg-black/30 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5 text-gray-900" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative pointer-events-none">
          <img
            src={item.url}
            alt={item.nombre_archivo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </div>
          </div>
        </div>
      )}

      {/* Top-Left En Uso Badge */}
      {isInUse && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-purple-900/90 text-purple-200 text-[9px] font-sora font-extrabold px-2 py-0.5 rounded-full border border-purple-700/60 backdrop-blur-xs shadow-sm pointer-events-none">
          En uso
        </div>
      )}

      {/* Top-Right Selection Indicator in Selection Mode */}
      {isSelectMode ? (
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          {isSelected ? (
            <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-xs shadow-md" />
          )}
        </div>
      ) : (
        /* Delete Button when NOT in select mode */
        <div className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSingleDelete(item);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md cursor-pointer"
            title="Eliminar de la galería"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
