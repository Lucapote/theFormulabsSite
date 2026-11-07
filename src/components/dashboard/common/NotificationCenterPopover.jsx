import { useState, useEffect, useCallback, useMemo } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { publishPostNow } from "@/services/calendarService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import FailedPostNotificationCard from "./notifications/FailedPostNotificationCard";
import PreReservaNotificationCard from "./notifications/PreReservaNotificationCard";
import FeedbackNotificationCard from "./notifications/FeedbackNotificationCard";
import NotificationZeroInboxCard from "./notifications/NotificationZeroInboxCard";

/**
 * NotificationCenterPopover
 * Centro de Asuntos Pendientes consolidado en la barra superior (Navbar)
 * para monitorear y resolver fallos de publicación Meta, cambios de clientes y pre-reservas.
 * Modularizado bajo SRP ($\le 250$ líneas) cumpliendo con GEMINI.md.
 */
export default function NotificationCenterPopover({ onNavigateTab, onNavigateToCalendar }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedPosts, setFailedPosts] = useState([]);
  const [pendingPreReservas, setPendingPreReservas] = useState([]);
  const [postsWithFeedback, setPostsWithFeedback] = useState([]);
  const [retryingPostId, setRetryingPostId] = useState(null);

  const loadActionItems = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Obtener posts en estado 'error'
      const { data: errorPosts, error: postErr } = await supabase
        .from("posts")
        .select("id, tipo_post, caption, fecha_programada, hora_programada, error_mensaje, reintentos, calendario_id, calendarios(id, nombre, cliente_id, clientes(id, nombre))")
        .eq("estado", "error")
        .order("fecha_programada", { ascending: false });

      if (!postErr && errorPosts) setFailedPosts(errorPosts);

      // 2. Obtener pre-reservas con comprobante pendientes de validar
      const { data: preReservas, error: preErr } = await supabase
        .from("producciones")
        .select("id, numero_sesion, fecha_produccion, estado, comprobante_url, cliente_id, clientes(id, nombre))")
        .eq("estado", "pre_reservada")
        .order("created_at", { ascending: false });

      if (!preErr && preReservas) setPendingPreReservas(preReservas);

      // 3. Obtener posts con observaciones/cambios solicitados por el cliente
      const { data: feedbackPosts, error: fbErr } = await supabase
        .from("posts")
        .select("id, tipo_post, caption, fecha_programada, hora_programada, notas_cambios, fecha_cambios, calendario_id, calendarios(id, nombre, cliente_id, clientes(id, nombre))")
        .not("notas_cambios", "is", null)
        .eq("estado", "en_edicion")
        .order("fecha_cambios", { ascending: false });

      if (!fbErr && feedbackPosts) setPostsWithFeedback(feedbackPosts);
    } catch (err) {
      console.error("Error cargando centro de notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActionItems();
    const interval = setInterval(loadActionItems, 25000);
    return () => clearInterval(interval);
  }, [loadActionItems]);

  const totalPending = useMemo(() => {
    return failedPosts.length + pendingPreReservas.length + postsWithFeedback.length;
  }, [failedPosts, pendingPreReservas, postsWithFeedback]);

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
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-2xs animate-pulse">
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
              <Bell className="w-4 h-4 text-brand-magenta" />
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
            <NotificationZeroInboxCard />
          ) : (
            <>
              {/* Sección 1: Fallos de Publicación en Meta */}
              {failedPosts.map((post) => (
                <FailedPostNotificationCard
                  key={post.id}
                  post={post}
                  isRetrying={retryingPostId === post.id}
                  onOpenCalendar={handleOpenSpecificCalendar}
                  onRetry={handleRetryPublish}
                />
              ))}

              {/* Sección 2: Pre-reservas con Comprobante Pendientes */}
              {pendingPreReservas.map((prod) => (
                <PreReservaNotificationCard
                  key={prod.id}
                  prod={prod}
                  onGoToOperations={handleGoToOperations}
                />
              ))}

              {/* Sección 3: Cambios Solicitados por el Cliente en Posts */}
              {postsWithFeedback.map((post) => (
                <FeedbackNotificationCard
                  key={`fb-${post.id}`}
                  post={post}
                  onOpenCalendar={handleOpenSpecificCalendar}
                />
              ))}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
