import { useState } from "react";
import {
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Download,
  CheckCircle,
  MessageSquare,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { triggerMediaDownload, extractFilenameFromUrl } from "@/utils/downloadHelpers";
import { isApprovalPending } from "@/utils/postStatusHelpers";
import { aprobarPostPublico } from "@/services/calendarService";

/**
 * StoryInstructionsDrawer
 * Cajón inferior deslizable con las instrucciones de publicación de las historias y descargas.
 */
export default function StoryInstructionsDrawer({
  post,
  currentFile,
  activeSlide,
  totalSlides,
  permiteDescarga,
  isInternal,
  onOpenFeedback,
  onPostUpdated
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const isEnAprobacion = isApprovalPending(post.estado);
  const instructions = post.caption || "Sin instrucciones específicas redactadas para esta historia.";

  const handleCopyInstructions = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(instructions);
    setCopied(true);
    toast.success("Instrucciones copiadas al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSlide = async (e) => {
    e.stopPropagation();
    if (!currentFile?.url) {
      toast.error("No hay archivo disponible para descargar");
      return;
    }
    setIsDownloading(true);
    const ext = currentFile.tipo === "video" || /\.(mp4|mov)$/i.test(currentFile.url) ? "mp4" : "jpg";
    const filename = extractFilenameFromUrl(currentFile.url, `historia-${activeSlide + 1}.${ext}`);
    try {
      await triggerMediaDownload(currentFile.url, filename);
      toast.success(`Historia ${activeSlide + 1} descargada`);
    } catch {
      toast.error("Error al descargar archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApprove = async (e) => {
    e.stopPropagation();
    setIsApproving(true);
    const res = await aprobarPostPublico(post.id);
    setIsApproving(false);
    if (res.success) {
      toast.success("¡Paquete de historias aprobado con éxito!");
      onPostUpdated?.({ ...post, estado: "programado" });
    } else {
      toast.error(res.error || "No se pudo aprobar");
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md rounded-t-3xl border-t border-slate-800 transition-all duration-300 font-inter ${
        isOpen ? "max-h-[60vh] overflow-y-auto p-4 space-y-3" : "p-2.5"
      }`}
    >
      {/* Botón / Handle para abrir o cerrar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-white font-sora font-bold text-xs px-2 py-1 cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-pink-400">
          <FileText className="w-3.5 h-3.5" />
          <span>Instrucciones de Publicación ({activeSlide + 1}/{totalSlides})</span>
        </span>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span>{isOpen ? "Ocultar" : "Ver instrucciones"}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Contenido Desplegado */}
      {isOpen && (
        <div className="space-y-3 pt-1 text-left">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-[22vh] overflow-y-auto">
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {instructions}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyInstructions}
              className="flex-1 h-9 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sora font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copied ? "¡Copiado!" : "Copiar Instrucciones"}</span>
            </button>

            {permiteDescarga && (
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadSlide}
                className="h-9 px-3.5 rounded-full bg-brand-magenta hover:opacity-90 text-white font-sora font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-pink-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Descargando..." : "Descargar Historia"}</span>
              </button>
            )}
          </div>

          {/* Validar / Cambios si está en aprobación */}
          {isEnAprobacion && !isInternal && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApprove}
                className="flex-1 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sora font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isApproving ? "Aprobando..." : "Aprobar Historias"}</span>
              </button>
              <button
                type="button"
                onClick={onOpenFeedback}
                className="h-10 px-4 rounded-full border border-purple-400/40 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 font-sora font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Cambios</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

