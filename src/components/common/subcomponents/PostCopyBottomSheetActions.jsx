import {
  Copy,
  Check,
  Edit2,
  Download,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PostCopyBottomSheetActions
 * Barra de botones de acción condicional para el bottom sheet de publicación.
 */
export default function PostCopyBottomSheetActions({
  post,
  isInternal = false,
  isEnAprobacion = false,
  canDownloadAndCopy = false,
  isDraftOrEditing = false,
  hasMedia = false,
  permiteDescarga = false,
  copied = false,
  isApproving = false,
  isDownloading = false,
  onCopy,
  onApprove,
  onOpenFeedback,
  onEdit,
  onDownload
}) {
  return (
    <div className="space-y-2 pt-0.5">
      {/* Caso 1: En Aprobación */}
      {isEnAprobacion && (
        isInternal ? (
          /* Modo Administrador */
          <div className="flex flex-col gap-2 pt-0.5">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-sora font-semibold">
                  Esperando validación del cliente
                </span>
              </div>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(post)}
                  className="h-8 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sora font-bold text-xs inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-slate-700 active:scale-[0.98]"
                  title="Editar publicación"
                >
                  <Edit2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onCopy}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold h-11 w-full rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-slate-700 cursor-pointer text-xs uppercase tracking-wider font-sora"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copiar Copywriting</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Modo Cliente */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={isApproving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-sora font-bold h-11 flex-1 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/30 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{isApproving ? "Aprobando..." : "Aprobar Publicación"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenFeedback}
              className="h-11 px-4 sm:px-5 rounded-full border border-purple-400/40 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 font-sora font-semibold text-xs inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
              <span>Hacer cambios</span>
            </button>
          </div>
        )
      )}

      {/* Caso 2: Aprobado o Programado (Copiar Copy y Descargar) */}
      {canDownloadAndCopy && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="bg-brand-magenta hover:opacity-90 text-white font-semibold h-11 w-full rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-pink-500/25 cursor-pointer text-xs uppercase tracking-wider font-sora"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copiar Copywriting</span>
                </>
              )}
            </button>

            {isInternal && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="h-11 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sora font-bold text-xs inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-slate-700 active:scale-[0.98]"
                title="Editar publicación"
              >
                <Edit2 className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}
          </div>

          {permiteDescarga && hasMedia && (
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full rounded-full h-11 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs font-medium"
            >
              <Download className={`w-4 h-4 text-slate-300 ${isDownloading ? "animate-bounce" : ""}`} />
              <span>{isDownloading ? "Descargando..." : "Descargar Archivo"}</span>
            </Button>
          )}
        </>
      )}

      {/* Caso 3: Sin empezar / En edición */}
      {isDraftOrEditing && !isEnAprobacion && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-inter italic">
            Publicación en etapa de preparación interna.
          </span>
          {isInternal && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="h-9 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sora font-bold text-xs inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-slate-700 active:scale-[0.98]"
              title="Editar publicación"
            >
              <Edit2 className="w-3 h-3 text-pink-400" />
              <span>Editar Post</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

