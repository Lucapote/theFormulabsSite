import { AlertTriangle, ChevronRight, Loader2, Send, Video as VideoIcon, Layers } from "lucide-react";

/**
 * Traduce y sintetiza mensajes de error técnicos de Meta Graph API en explicaciones humanas.
 */
function humanizeMetaError(errorMsg) {
  if (!errorMsg) return "Error desconocido devuelto por Meta.";
  const lower = String(errorMsg).toLowerCase();

  if (lower.includes("aspect ratio")) {
    return "Proporción no admitida: Instagram requiere imágenes cuadradas (1:1) o verticales (4:5). Usa el botón 'Encuadre Instagram' para adaptarla.";
  }
  if (lower.includes("token") || lower.includes("session") || lower.includes("expired")) {
    return "Token de Meta expirado o revocado. Desvincula y vuelve a vincular la cuenta en el cliente.";
  }
  if (lower.includes("permission") || lower.includes("access")) {
    return "Faltan permisos de publicación en la Página de Facebook o Instagram Business.";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Tiempo de espera agotado al transcodificar el video en Meta.";
  }
  return errorMsg;
}

/**
 * FailedPostNotificationCard
 * Tarjeta para mostrar publicaciones con fallo de entrega en Meta Graph API y botón de reintento.
 */
export default function FailedPostNotificationCard({
  post,
  isRetrying,
  onOpenCalendar,
  onRetry
}) {
  const clienteNombre = post.calendarios?.clientes?.nombre || "Cliente";

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-rose-200/80 shadow-2xs space-y-2.5 transition-all hover:border-rose-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <span className="font-sora font-bold text-xs text-gray-900 block truncate max-w-[200px]">
              {clienteNombre}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
              {post.tipo_post === "reel" ? (
                <VideoIcon className="w-2.5 h-2.5 text-brand-magenta" />
              ) : (
                <Layers className="w-2.5 h-2.5 text-brand-blue" />
              )}
              {post.fecha_programada} • {post.hora_programada?.slice(0, 5)} hrs
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-sora font-bold text-[9px] uppercase tracking-wider shrink-0">
          Error Meta
        </span>
      </div>

      {/* Explicación en lenguaje humano */}
      <div className="bg-rose-50/60 p-2 rounded-xl text-[11px] text-rose-800 leading-relaxed font-inter border border-rose-100">
        {humanizeMetaError(post.error_mensaje)}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onOpenCalendar(post.calendarios?.cliente_id, post.calendario_id)}
          className="text-[11px] font-sora font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="truncate max-w-[150px]">
            {post.calendarios?.nombre ? `Abrir ${post.calendarios.nombre}` : "Abrir Calendario"}
          </span>
          <ChevronRight className="w-3 h-3 shrink-0" />
        </button>

        <button
          type="button"
          disabled={isRetrying}
          onClick={(e) => onRetry(post, e)}
          className="h-7 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-sora font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          <span>Reintentar</span>
        </button>
      </div>
    </div>
  );
}

