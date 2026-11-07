import { MessageSquare, ArrowRight, Video as VideoIcon, Layers } from "lucide-react";

/**
 * FeedbackNotificationCard
 * Tarjeta para publicaciones donde el cliente ha dejado observaciones o cambios solicitados.
 */
export default function FeedbackNotificationCard({ post, onOpenCalendar }) {
  const clienteNombre = post.calendarios?.clientes?.nombre || "Cliente";
  const calendarioNombre = post.calendarios?.nombre;

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-amber-200/90 shadow-2xs space-y-2.5 transition-all hover:border-amber-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
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

        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-sora font-bold text-[9px] uppercase tracking-wider shrink-0">
          Cambios Pedidos
        </span>
      </div>

      <div className="bg-amber-50/60 p-2 rounded-xl text-[11px] text-amber-900 leading-relaxed font-inter border border-amber-100/80">
        <strong className="block text-[10px] font-sora text-amber-950 uppercase tracking-wider mb-0.5">
          Observaciones del Cliente:
        </strong>
        <p className="line-clamp-2">"{post.notas_cambios}"</p>
      </div>

      <div className="flex items-center justify-end pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onOpenCalendar(post.calendarios?.cliente_id, post.calendario_id)}
          className="h-7 px-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-sora font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
        >
          <span className="truncate max-w-[200px]">
            {calendarioNombre ? `Abrir ${calendarioNombre}` : "Revisar en Calendario"}
          </span>
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>
      </div>
    </div>
  );
}

