import { Film, Crop, RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import GalleryFileItem from "@/components/dashboard/gallery/GalleryFileItem";
import { canSaveWithoutMedia } from "@/utils/postStatusHelpers";

/**
 * PostModalMediaGalleryPicker
 * Selector visual de medios de la galería del cliente para asignar al post,
 * con advertencias de proporción para Instagram y botón de encuadre.
 */
export default function PostModalMediaGalleryPicker({
  tipoPost,
  estado,
  archivos = [],
  availableGalleryFiles = [],
  invalidFiles = [],
  loadingGallery = false,
  onOpenFraming,
  onReloadGallery,
  onToggleSelection,
  onPreviewMedia
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <label className="text-xs font-sora font-bold uppercase text-gray-700 tracking-wide flex items-center gap-1.5">
          <Film className="w-4 h-4 text-brand-blue" />
          Medios de Galería ({archivos.length} asignados / {availableGalleryFiles.length} disponibles)
          {!canSaveWithoutMedia(estado) ? (
            <span className="text-brand-magenta font-black">*</span>
          ) : (
            <span className="text-gray-400 font-normal lowercase">(opcional en este estado)</span>
          )}
        </label>

        <div className="flex items-center gap-2">
          {archivos.some((a) => a.tipo !== "video") && (
            <button
              type="button"
              onClick={onOpenFraming}
              className={`h-8 px-3 rounded-full border font-sora font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] transition-all ${
                invalidFiles.length > 0
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse"
                  : "bg-gradient-to-r from-pink-50 to-blue-50 border-blue-200 text-brand-blue hover:text-blue-700"
              }`}
              title="Ajustar y encuadrar imágenes para Instagram (1:1 o 4:5)"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{invalidFiles.length > 0 ? "Requiere Encuadre" : "Encuadre Instagram"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReloadGallery}
            disabled={loadingGallery}
            className="text-[11px] font-sora font-bold text-brand-blue hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer active:scale-[0.98] transition-all"
            title="Recargar archivos de la galería"
          >
            <RefreshCw className={`w-3 h-3 ${loadingGallery ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Aviso preventivo de proporciones incompatibles con Instagram */}
      {invalidFiles.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-sora font-bold text-amber-900">
              Proporción no soportada por Meta ({invalidFiles.length} imagen{invalidFiles.length > 1 ? "es" : ""})
            </p>
            <p className="text-amber-700 font-inter text-[11px] mt-0.5 leading-snug">
              Instagram solo admite proporciones entre 4:5 (vertical) y 1.91:1 (horizontal). Encuadra a 4:5 o 1:1 para evitar rechazos de publicación.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFraming}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sora font-bold text-[11px] shrink-0 transition-colors cursor-pointer active:scale-[0.98]"
          >
            Encuadrar ahora
          </button>
        </div>
      )}

      {loadingGallery ? (
        <div className="p-8 text-center bg-gray-50/70 rounded-2xl border border-gray-100">
          <Sparkles className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
          <p className="text-xs font-sora font-bold text-gray-600">
            Cargando banco de medios...
          </p>
        </div>
      ) : availableGalleryFiles.length === 0 ? (
        <div className="p-6 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
          <Film className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-sora font-bold text-gray-700">
            {tipoPost === "reel"
              ? "No hay videos disponibles en la galería"
              : "No hay archivos disponibles en la galería"}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {tipoPost === "reel"
              ? "El formato Reel requiere archivos de video. Sube un video en la pestaña Galería para seleccionarlo aquí."
              : "Sube imágenes o videos en la pestaña Galería de este cliente para poder seleccionarlos aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-100 max-h-64 overflow-y-auto">
          {availableGalleryFiles.map((file) => {
            const selectedIndex = archivos.findIndex((item) => item.id === file.id);
            const isSelected = selectedIndex !== -1;

            return (
              <GalleryFileItem
                key={file.id}
                file={file}
                isSelected={isSelected}
                selectedIndex={selectedIndex}
                tipoPost={tipoPost}
                onSelect={onToggleSelection}
                onPreview={onPreviewMedia}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

