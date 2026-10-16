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
  icon: CustomIcon = null,
  badge = null,
  children = null,
  buttons = null,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || Trash2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-inter">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-6 sm:p-7 text-center space-y-4 shadow-2xl border border-gray-100 relative">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 shadow-sm shrink-0">
          <IconComponent className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          {badge && (
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 mb-1">
              {badge}
            </span>
          )}
          <h3 className="text-xl font-sora font-extrabold text-gray-900 leading-tight">
            {title}
          </h3>
          {message && (
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          )}
        </div>

        {children}

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {buttons ? (
            buttons
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
