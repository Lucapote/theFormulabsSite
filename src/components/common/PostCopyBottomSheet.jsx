import { useState, useRef } from "react";
import {
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Layers,
  Edit2
} from "lucide-react";
import { toast } from "sonner";
import { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

/**
 * PostCopyBottomSheet
 * Instagram-style dark bottom sheet drawer supporting collapsed and expanded states.
 */
export default function PostCopyBottomSheet({
  post,
  isInternal = false,
  onEdit = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartY = useRef(0);

  if (!post) return null;

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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`w-full rounded-t-3xl bg-slate-900 border-t border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden ${
        isExpanded ? "max-h-[75vh]" : "max-h-[220px]"
      }`}
    >
      {/* Centered Pill Handle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 flex flex-col items-center justify-center cursor-pointer group"
        aria-label={isExpanded ? "Colapsar información" : "Expandir información"}
      >
        <div className="w-12 h-1 bg-slate-600 group-hover:bg-slate-400 rounded-full transition-colors" />
      </button>

      <div className="px-5 pb-5 pt-1 space-y-3.5 overflow-x-hidden">
        {/* Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-sora font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
              {post.tipo_post === "reel" ? (
                <VideoIcon className="w-3 h-3 text-pink-400" />
              ) : (
                <Layers className="w-3 h-3 text-pink-400" />
              )}
              {formatBadge}
            </span>

            {isInternal && post.estado && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sora font-extrabold uppercase ${
                  post.estado === "programado"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : post.estado === "publicado"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                • {post.estado}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 font-medium">
            <CalendarIcon className="w-3 h-3 text-slate-500" />
            {dateTimeLabel}
          </span>
        </div>

        {/* Copywriting Area */}
        {isExpanded ? (
          <div className="space-y-1.5 overflow-x-hidden">
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

            <div className="overflow-y-auto max-h-[45vh] overflow-x-hidden rounded-xl bg-slate-950/60 p-2.5 border border-slate-800">
              <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                {post.caption || <em className="text-slate-500 font-normal">Sin copy redactado.</em>}
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer group space-y-1 overflow-x-hidden"
          >
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed break-words group-hover:text-white transition-colors">
              {post.caption || <em className="text-slate-500 font-normal">Sin copy en esta publicación.</em>}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-sora font-bold text-pink-400 pt-0.5">
              <span>Ver más</span>
              <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Actions Button Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 w-full rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-pink-600/25 cursor-pointer text-xs uppercase tracking-wider font-sora"
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
              className="h-11 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sora font-bold text-xs inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-slate-700"
              title="Editar publicación"
            >
              <Edit2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
