import { useState, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { triggerMediaDownload, extractFilenameFromUrl } from "@/utils/downloadHelpers";
import { formatTimeHHMM } from "@/components/calendar/CalendarGridView";
import {
  getPostStatusMeta,
  isApprovalPending,
  isAssetDownloadable,
  canSaveWithoutMedia
} from "@/utils/postStatusHelpers";
import { aprobarPostPublico } from "@/services/calendarService";
import PostFeedbackModal from "@/components/common/PostFeedbackModal";
import PostCopyBottomSheetActions from "./subcomponents/PostCopyBottomSheetActions";

/**
 * PostCopyBottomSheet
 * Instagram-style dark bottom sheet drawer supporting collapsed and expanded states.
 * Modularizado bajo SRP ($\le 250$ líneas) cumpliendo con GEMINI.md.
 */
export default function PostCopyBottomSheet({
  post,
  isInternal = false,
  onEdit = null,
  permiteDescarga = false,
  activeMediaIndex = 0,
  onPostUpdated = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const touchStartY = useRef(0);

  if (!post) return null;

  const filesList = Array.isArray(post.archivos) ? post.archivos : [];
  const currentFile = filesList[activeMediaIndex] || filesList[0] || null;
  const targetMediaUrl = currentFile?.url || post.url || null;
  const hasMedia = Boolean(targetMediaUrl);

  const statusMeta = getPostStatusMeta(post.estado);
  const isEnAprobacion = isApprovalPending(post.estado);
  const canDownloadAndCopy = isAssetDownloadable(post.estado);
  const isDraftOrEditing = canSaveWithoutMedia(post.estado);

  const handleDownload = async (e) => {
    e?.stopPropagation();
    if (!targetMediaUrl) {
      toast.error("No hay archivo multimedia disponible para descargar.");
      return;
    }

    setIsDownloading(true);
    toast.info("Descargando archivo...");
    const ext = currentFile?.tipo === "video" || post.tipo_post === "reel" ? "mp4" : "jpg";
    const defaultName = currentFile?.nombre_archivo || `publicacion-${post.id ? post.id.slice(0, 8) : "media"}.${ext}`;
    const filename = extractFilenameFromUrl(targetMediaUrl, defaultName);

    try {
      const success = await triggerMediaDownload(targetMediaUrl, filename);
      if (success) {
        toast.success("Archivo descargado exitosamente.");
      } else {
        toast.info("Descarga iniciada.");
      }
    } catch {
      toast.error("Ocurrió un error al intentar descargar el archivo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    if (!post.caption) {
      toast.error("Esta publicación no tiene texto redactado.");
      return;
    }
    navigator.clipboard.writeText(post.caption);
    setCopied(true);
    toast.success("Copywriting copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async (e) => {
    e?.stopPropagation();
    setIsApproving(true);
    const res = await aprobarPostPublico(post.id);
    setIsApproving(false);

    if (res.success) {
      toast.success("¡Publicación aprobada y programada con éxito!");
      if (onPostUpdated) {
        onPostUpdated({
          ...post,
          estado: "programado"
        });
      }
    } else {
      toast.error(res.error || "No se pudo aprobar la publicación.");
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY < -30 && !isExpanded) {
      setIsExpanded(true);
    } else if (deltaY > 30 && isExpanded) {
      setIsExpanded(false);
    }
  };

  const formatBadge = post.tipo_post === "reel" ? "REEL" : "CARRUSEL";
  const formattedTime = formatTimeHHMM(post.hora_programada);
  const dateTimeLabel = post.fecha_programada
    ? `${post.fecha_programada}${formattedTime ? ` • ${formattedTime}` : ""}`
    : "Sin fecha programada";

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full rounded-t-3xl bg-slate-900 border-t border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out shrink-0 no-scrollbar ${
          isExpanded ? "max-h-[72vh] overflow-y-auto" : "overflow-hidden"
        }`}
      >
        {/* Centered Pill Handle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex flex-col items-center justify-center cursor-pointer group"
          aria-label={isExpanded ? "Colapsar información" : "Expandir información"}
        >
          <div className="w-10 h-1 bg-slate-600 group-hover:bg-slate-400 rounded-full transition-colors" />
        </button>

        <div className="px-5 pb-4 pt-0.5 space-y-2.5 overflow-hidden">
          {/* Badges Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sora font-extrabold uppercase tracking-wider bg-brand-magenta/20 text-brand-magenta border border-brand-magenta/30">
                {post.tipo_post === "reel" ? (
                  <VideoIcon className="w-3 h-3 text-brand-magenta" />
                ) : (
                  <Layers className="w-3 h-3 text-brand-magenta" />
                )}
                {formatBadge}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sora font-extrabold uppercase tracking-wider ${statusMeta.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                {statusMeta.label}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 font-medium">
              <CalendarIcon className="w-3 h-3 text-slate-500" />
              {dateTimeLabel}
            </span>
          </div>

          {/* Copywriting Area */}
          {isExpanded ? (
            <div className="space-y-1.5 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sora font-bold uppercase tracking-wider text-slate-400">
                  Copywriting del Post
                </span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  Menos <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[38vh] no-scrollbar rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                  {post.caption || <em className="text-slate-500 font-normal">Sin copy redactado.</em>}
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsExpanded(true)}
              className="cursor-pointer group space-y-0.5 overflow-hidden"
            >
              <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed break-words group-hover:text-white transition-colors">
                {post.caption || <em className="text-slate-500 font-normal">Sin copy en esta publicación.</em>}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-sora font-bold text-pink-400 pt-0.5">
                <span>Ver más</span>
                <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* Actions Button Row */}
          <PostCopyBottomSheetActions
            post={post}
            isInternal={isInternal}
            isEnAprobacion={isEnAprobacion}
            canDownloadAndCopy={canDownloadAndCopy}
            isDraftOrEditing={isDraftOrEditing}
            hasMedia={hasMedia}
            permiteDescarga={permiteDescarga}
            copied={copied}
            isApproving={isApproving}
            isDownloading={isDownloading}
            onCopy={handleCopy}
            onApprove={handleApprove}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            onEdit={onEdit}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* Modal para solicitar cambios */}
      {showFeedbackModal && (
        <PostFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          post={post}
          onSuccess={(updatedPost) => {
            if (onPostUpdated) onPostUpdated(updatedPost);
          }}
        />
      )}
    </>
  );
}
