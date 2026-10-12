import { Trash2, X } from "lucide-react";

/**
 * FloatingBatchToolbar
 * Floating pill bar at bottom of screen when items are selected in multi-select mode.
 */
export default function FloatingBatchToolbar({
  selectedCount = 0,
  isAllSelected = false,
  onSelectAll,
  onCancelSelection,
  onOpenDeleteConfirm
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 border border-gray-800 text-white rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom duration-200 font-sora max-w-[90vw] sm:max-w-md">
      {/* Selected Badge & Counter */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-bold text-gray-200">
          {selectedCount === 1 ? "seleccionado" : "seleccionados"}
        </span>
      </div>

      <div className="h-4 w-px bg-gray-750 mx-0.5" />

      {/* Select All Toggle */}
      <button
        type="button"
        onClick={onSelectAll}
        className="text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
      >
        {isAllSelected ? "Deseleccionar" : "Todos"}
      </button>

      <div className="h-4 w-px bg-gray-750 mx-0.5" />

      {/* Cancel Action (Icon) */}
      <button
        type="button"
        onClick={onCancelSelection}
        className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
        title="Cancelar selección"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Delete Action (Icon Button) */}
      <button
        type="button"
        onClick={onOpenDeleteConfirm}
        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-md shadow-red-500/20 cursor-pointer shrink-0"
        title={`Eliminar ${selectedCount} archivo(s)`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
