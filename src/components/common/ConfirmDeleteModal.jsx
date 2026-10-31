import { useEffect } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { RefreshCw, Trash2 } from "lucide-react";

/**
 * ConfirmDeleteModal
 * Reusable modal dialog for deletion confirmations (client, calendar, etc).
 * Built with Radix UI AlertDialog to coordinate cleanly above parent Radix dialogs
 * (BaseFormModal) without focus trapping conflicts or pointer event blockages.
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
  useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      // Desenfocar cualquier elemento activo (como selects de fondo) para evitar que permanezcan desplegados
      document.activeElement?.blur?.();
    }
  }, [isOpen]);

  const IconComponent = CustomIcon || Trash2;

  return (
    <AlertDialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isProcessing) {
          onClose?.();
        }
      }}
    >
      <AlertDialogPrimitive.Portal>
        {/* Backdrop con alta prioridad de z-index */}
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[120] bg-gray-950/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Contenedor del Diálogo */}
        <AlertDialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[130] w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-[2.5rem] bg-white p-6 sm:p-7 text-center shadow-2xl border border-gray-100 font-inter focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 shadow-sm shrink-0 mb-4">
            <IconComponent className="w-7 h-7" />
          </div>

          <div className="space-y-1 mb-4">
            {badge && (
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 mb-1">
                {badge}
              </span>
            )}
            <AlertDialogPrimitive.Title className="text-xl font-sora font-extrabold text-gray-900 leading-tight">
              {title}
            </AlertDialogPrimitive.Title>
            {message && (
              <AlertDialogPrimitive.Description className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                {message}
              </AlertDialogPrimitive.Description>
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
                  className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
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
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
