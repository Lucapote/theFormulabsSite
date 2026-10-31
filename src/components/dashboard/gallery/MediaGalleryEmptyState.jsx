import { Image as ImageIcon, RotateCcw, UploadCloud } from "lucide-react";

/**
 * MediaGalleryEmptyState
 * Clean state indicator when no items match filters or no media exists yet.
 */
export default function MediaGalleryEmptyState({
  archivosCount,
  statusFilter,
  typeFilter,
  onResetFilters
}) {
  return (
    <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100 flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
        <ImageIcon className="w-7 h-7" />
      </div>
      <h4 className="font-sora font-bold text-gray-900 text-base mb-1">
        No se encontraron archivos
      </h4>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
        {archivosCount === 0
          ? "Sube tus primeros archivos utilizando el panel de carga para comenzar a organizar tu feed visual."
          : "No hay archivos que coincidan con la combinación de filtros de estado y formato seleccionados."}
      </p>
      {archivosCount > 0 && (statusFilter !== "all" || typeFilter !== "all") ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-bold transition-all duration-150 active:scale-[0.98] shadow-md cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer Filtros
        </button>
      ) : archivosCount === 0 ? (
        <button
          type="button"
          onClick={() => {
            const dropzoneInput = document.querySelector('input[type="file"]');
            if (dropzoneInput) dropzoneInput.click();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] shadow-md shadow-blue-200 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Seleccionar Archivos
        </button>
      ) : null}
    </div>
  );
}

