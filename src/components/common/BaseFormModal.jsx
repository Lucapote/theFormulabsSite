import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BaseFormModal
 * Reusable modal shell for dashboard data capture and editing forms.
 * Complies with the "Clinical High-Tech Lab" design system (GEMINI.md).
 */
export default function BaseFormModal({
  isOpen = false,
  onClose,
  onSubmit,
  eyebrow,
  eyebrowColor = "text-brand-magenta",
  badge,
  title,
  description,
  icon: IconComponent,
  headerExtra = null,
  tabs,
  maxWidth = "max-w-2xl",
  cancelText = "Cancelar",
  submitText = "Guardar",
  loadingText = "Guardando...",
  isLoading = false,
  isSubmitDisabled = false,
  showSubmitButton = true,
  footerExtra = null,
  showFooter = true,
  formId,
  submitButtonClass = "",
  cancelButtonClass = "",
  bodyClassName = "",
  className = "",
  children
}) {
  const generatedFormId = React.useId();
  const effectiveFormId = formId || (onSubmit ? `form-${generatedFormId}` : undefined);

  // Content body wrapper: either direct or wrapped in <form> if onSubmit is provided
  const renderBodyAndFooter = () => {
    const bodyContent = (
      <div
        className={cn(
          "flex-1 overflow-y-auto min-h-0 px-6 py-6 md:px-8 space-y-5 bg-white max-h-[70vh] md:max-h-[75vh]",
          bodyClassName
        )}
      >
        {children}
      </div>
    );

    const footerContent = showFooter && (
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 md:px-8 py-4 border-t border-gray-100 bg-white/95 backdrop-blur shrink-0">
        <div className="w-full sm:w-auto flex items-center justify-start">
          {footerExtra}
        </div>
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
          {cancelText && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "h-11 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50",
                cancelButtonClass
              )}
            >
              {cancelText}
            </button>
          )}
          {showSubmitButton && (
            <button
              type="submit"
              {...(effectiveFormId ? { form: effectiveFormId } : {})}
              disabled={isLoading || isSubmitDisabled}
              className={cn(
                "h-11 px-6 rounded-full bg-brand-blue hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
                submitButtonClass
              )}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{loadingText}</span>
                </>
              ) : (
                <span>{submitText}</span>
              )}
            </button>
          )}
        </div>
      </div>
    );

    if (onSubmit) {
      return (
        <form
          id={effectiveFormId}
          onSubmit={onSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {bodyContent}
          {footerContent}
        </form>
      );
    }

    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {bodyContent}
        {footerContent}
      </div>
    );
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal Dialog Content Container */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 flex flex-col w-full translate-x-[-50%] translate-y-[-50%] duration-200",
            "max-h-[90vh] rounded-[2rem] border border-gray-100 bg-white shadow-2xl overflow-hidden font-inter",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "w-[calc(100vw-1.5rem)] sm:w-full",
            maxWidth,
            className
          )}
        >
          {/* Header Oficial Clínico */}
          <div className="px-6 py-5 md:px-8 border-b border-gray-100 flex items-center justify-between bg-slate-950 text-white shrink-0">
            <div className="space-y-1 pr-4">
              {badge ? (
                <div>{badge}</div>
              ) : eyebrow ? (
                <span
                  className={cn(
                    "text-[10px] md:text-xs font-sora font-bold uppercase tracking-wider block",
                    eyebrowColor
                  )}
                >
                  {eyebrow}
                </span>
              ) : null}

              <div className="flex items-center gap-2.5">
                {IconComponent && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-brand-blue shrink-0">
                    {React.isValidElement(IconComponent) ? (
                      IconComponent
                    ) : (
                      <IconComponent className="w-4 h-4 text-brand-blue" />
                    )}
                  </div>
                )}
                <DialogPrimitive.Title className="font-sora text-lg md:text-xl font-bold tracking-tight text-white">
                  {title}
                </DialogPrimitive.Title>
              </div>

              {description && (
                <DialogPrimitive.Description className="text-xs text-gray-400 font-inter font-normal">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerExtra}
              <DialogPrimitive.Close
                asChild
                onClick={onClose}
              >
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Cerrar</span>
                </button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Optional Segmented Tabs Switcher */}
          {tabs && (
            <div className="shrink-0 border-b border-gray-100 bg-gray-50/70 p-2">
              {tabs}
            </div>
          )}

          {/* Form / Scrollable Content & Footer */}
          {renderBodyAndFooter()}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
