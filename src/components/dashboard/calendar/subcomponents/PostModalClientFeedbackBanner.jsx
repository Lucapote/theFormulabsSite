import { AlertTriangle } from "lucide-react";

/**
 * PostModalClientFeedbackBanner
 * Banner de observaciones y cambios solicitados por el cliente en estado en_edicion.
 */
export default function PostModalClientFeedbackBanner({
  notasCambios,
  fechaCambios,
  onDismiss
}) {
  if (!notasCambios) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sora font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
            Observaciones del Cliente (Cambios Solicitados)
          </span>
          <div className="flex items-center gap-2">
            {fechaCambios && (
              <span className="text-[10px] font-mono text-amber-700">
                {new Date(fechaCambios).toLocaleDateString()}
              </span>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="text-[10px] font-sora font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 cursor-pointer active:scale-[0.98] transition-all"
            >
              Descartar
            </button>
          </div>
        </div>
        <p className="font-inter leading-relaxed text-amber-900 whitespace-pre-wrap">
          "{notasCambios}"
        </p>
      </div>
    </div>
  );
}

