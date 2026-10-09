import { RefreshCw, Trash2 } from "lucide-react";

/**
 * ConfirmDeleteModal
 * Reusable modal dialog for deletion confirmations (client, calendar, etc).
 */
export default function ConfirmDeleteModal({
  isOpen = false,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que deseas realizar esta acción?",
  confirmText = "Eliminar",
  isProcessing = false,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-inter">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-6 text-center space-y-4 shadow-2xl border border-gray-100 relative">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 shadow-sm">
          <Trash2 className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-sora font-extrabold text-gray-900">
            {title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs shadow-md shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
