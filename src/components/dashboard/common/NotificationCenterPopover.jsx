import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  AlertTriangle,
  Send,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Layers,
  Video as VideoIcon,
  ChevronRight,
  Loader2,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { publishPostNow } from "@/services/calendarService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";

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
 * NotificationCenterPopover
 * Centro de Asuntos Pendientes consolidado en la barra superior (Navbar)
 * para monitorear y resolver fallos de publicación Meta, cambios de clientes y pre-reservas.
 */
export default function NotificationCenterPopover({ onNavigateTab, onNavigateToCalendar }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedPosts, setFailedPosts] = useState([]);
  const [pendingPreReservas, setPendingPreReservas] = useState([]);
  const [postsWithFeedback, setPostsWithFeedback] = useState([]);
  const [retryingPostId, setRetryingPostId] = useState(null);

  // Cargar asuntos pendientes desde Supabase
  const loadActionItems = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Obtener posts en estado 'error'
      const { data: errorPosts, error: postErr } = await supabase
        .from("posts")
        .select(`
          id,
          tipo_post,
          caption,
          fecha_programada,
          hora_programada,
          error_mensaje,
          reintentos,
          calendario_id,
          calendarios (
            id,
            nombre,
            cliente_id,
            clientes (
              id,
              nombre
            )
          )
        `)
        .eq("estado", "error")
        .order("fecha_programada", { ascending: false });

      if (!postErr && errorPosts) {
        setFailedPosts(errorPosts);
      }

      // 2. Obtener pre-reservas con comprobante pendientes de validar
      const { data: preReservas, error: preErr } = await supabase
        .from("producciones")
        .select(`
          id,
          numero_sesion,
          fecha_produccion,
          estado,
          comprobante_url,
          cliente_id,
          clientes (
            id,
            nombre
          )
        `)
        .eq("estado", "pre_reservada")
        .order("created_at", { ascending: false });

      if (!preErr && preReservas) {
        setPendingPreReservas(preReservas);
      }

      // 3. Obtener posts con observaciones/cambios solicitados por el cliente
      const { data: feedbackPosts, error: fbErr } = await supabase
        .from("posts")
        .select(`
          id,
          tipo_post,
          caption,
          fecha_programada,
          hora_programada,
          notas_cambios,
          fecha_cambios,
          calendario_id,
          calendarios (
            id,
            nombre,
            cliente_id,
            clientes (
              id,
              nombre
            )
          )
        `)
        .not("notas_cambios", "is", null)
        .eq("estado", "en_edicion")
        .order("fecha_cambios", { ascending: false });

      if (!fbErr && feedbackPosts) {
        setPostsWithFeedback(feedbackPosts);
      }
    } catch (err) {
      console.error("Error cargando centro de notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActionItems();

    // Actualizar periódicamente cada 25 segundos
    const interval = setInterval(loadActionItems, 25000);
    return () => clearInterval(interval);
  }, [loadActionItems]);

  const totalPending = useMemo(() => {
    return failedPosts.length + pendingPreReservas.length + postsWithFeedback.length;
  }, [failedPosts, pendingPreReservas, postsWithFeedback]);

  // Reintento manual de publicación desde la campanita
  const handleRetryPublish = async (post, e) => {
    e.stopPropagation();
    if (!post?.id) return;
    setRetryingPostId(post.id);
    toast.loading("Reintentando publicación en Meta...", { id: `retry-${post.id}` });

    const res = await publishPostNow(post.id);
    if (res.success) {
      toast.success(res.message || "Publicación procesada con éxito.", { id: `retry-${post.id}` });
      loadActionItems();
    } else {
      toast.error(res.error || "No se pudo publicar.", { id: `retry-${post.id}` });
      loadActionItems();
    }
    setRetryingPostId(null);
  };

  const handleGoToCalendars = () => {
    setIsOpen(false);
    if (onNavigateTab) onNavigateTab("calendars");
  };

  const handleOpenSpecificCalendar = (clienteId, calendarioId) => {
    setIsOpen(false);
    if (onNavigateToCalendar && calendarioId) {
      onNavigateToCalendar(clienteId, calendarioId);
    } else if (onNavigateTab) {
      onNavigateTab("calendars");
    }
  };

  const handleGoToOperations = () => {
    setIsOpen(false);
    if (onNavigateTab) onNavigateTab("operaciones");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs text-gray-600 hover:text-gray-900 transition-all cursor-pointer outline-hidden focus:ring-2 focus:ring-[#188ff0]/20 active:scale-[0.98]"
          title="Centro de Asuntos Pendientes"
        >
          <Bell className="w-4 h-4 text-gray-700" />
          {totalPending > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-xs animate-pulse">
              {totalPending}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] sm:w-[420px] p-0 rounded-3xl border border-gray-100 shadow-2xl bg-white font-inter overflow-hidden z-50"
      >
        {/* Cabecera del Centro de Asuntos */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h4 className="font-sora font-bold text-xs uppercase tracking-wider text-white">
                Asuntos Pendientes
              </h4>
              <p className="text-[11px] text-gray-400 font-medium">
                {totalPending === 0
                  ? "Todo al día (0 alertas)"
                  : `${totalPending} asunto${totalPending > 1 ? "s" : ""} requiere${totalPending > 1 ? "n" : ""} tu atención`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadActionItems}
            disabled={loading}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Actualizar asuntos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Lista de Asuntos con Scroll */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-2.5 bg-gray-50/50">
          {totalPending === 0 ? (
            /* Estado Vacío: Zero Inbox */
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 space-y-2 shadow-xs my-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h5 className="font-sora font-bold text-xs text-gray-900">
                ¡Bandeja Despejada!
              </h5>
              <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                No hay publicaciones con error en Meta ni pre-reservas pendientes de validación.
              </p>
            </div>
          ) : (
            <>
              {/* SECCIÓN 1: FALLOS DE PUBLICACIÓN EN META */}
              {failedPosts.map((post) => {
                const clienteNombre = post.calendarios?.clientes?.nombre || "Cliente";
                const isRetrying = retryingPostId === post.id;

                return (
                  <div
                    key={post.id}
                    className="p-3.5 bg-white rounded-2xl border border-rose-200/80 shadow-xs space-y-2.5 transition-all hover:border-rose-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="font-sora font-bold text-xs text-gray-900 block truncate max-w-[200px]">
                            {clienteNombre}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                            {post.tipo_post === "reel" ? <VideoIcon className="w-2.5 h-2.5 text-pink-500" /> : <Layers className="w-2.5 h-2.5 text-brand-blue" />}
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
                        onClick={() => handleOpenSpecificCalendar(post.calendarios?.cliente_id, post.calendario_id)}
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
                        onClick={(e) => handleRetryPublish(post, e)}
                        className="h-7 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-sora font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                      >
                        {isRetrying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Reintentar</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* SECCIÓN 2: PRE-RESERVAS CON COMPROBANTE PENDIENTES */}
              {pendingPreReservas.map((prod) => {
                const clienteNombre = prod.clientes?.nombre || "Cliente";

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-2.5 transition-all hover:border-amber-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                          <Calendar className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="font-sora font-bold text-xs text-gray-900 block truncate max-w-[200px]">
                            {clienteNombre}
                          </span>
                          <span className="text-[10px] text-gray-400 font-inter">
                            Sesión #{prod.numero_sesion} • Solicitud de Rodaje
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-sora font-bold text-[9px] uppercase tracking-wider shrink-0">
                        Pre-Reserva
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 font-inter leading-relaxed">
                      El cliente agendó y adjuntó su comprobante de pago. Requiere tu validación para confirmarse.
                    </p>

                    <div className="flex items-center justify-end pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleGoToOperations}
                        className="h-7 px-3.5 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <span>Validar en Operaciones</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* SECCIÓN 3: CAMBIOS SOLICITADOS POR EL CLIENTE EN POSTS */}
              {postsWithFeedback.map((post) => {
                const clienteNombre = post.calendarios?.clientes?.nombre || "Cliente";
                const calendarioNombre = post.calendarios?.nombre;

                return (
                  <div
                    key={`fb-${post.id}`}
                    className="p-3.5 bg-white rounded-2xl border border-amber-200/90 shadow-xs space-y-2.5 transition-all hover:border-amber-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-sora font-bold text-[9px] uppercase tracking-wider shrink-0">
                          Cambios Pedidos
                        </span>
                      </div>

                        <div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono mt-0.5">
                            {post.tipo_post === "reel" ? <VideoIcon className="w-2.5 h-2.5 text-pink-500" /> : <Layers className="w-2.5 h-2.5 text-brand-blue" />}
                            {post.fecha_programada} • {post.hora_programada?.slice(0, 5)} hrs
                          </span>
                        </div>
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
                        onClick={() => handleOpenSpecificCalendar(post.calendarios?.cliente_id, post.calendario_id)}
                        className="h-7 px-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-sora font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <span className="truncate max-w-[200px]">
                          {calendarioNombre ? `Abrir ${calendarioNombre}` : "Revisar en Calendario"}
                        </span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
