import { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  ClipboardCheck,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Video
} from "lucide-react";
import { getSessionDisplayName } from "@/utils/formatters";

const STATUS_CONFIG = {
  agendada: {
    label: "Agendada",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  fecha_propuesta: {
    label: "Fecha Propuesta",
    bg: "bg-blue-50 text-brand-blue border-blue-200"
  },
  pre_reservada: {
    label: "Pre-Reservada",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  pendiente_agendamiento: {
    label: "Pendiente de Reserva",
    bg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  rodaje_completado: {
    label: "Rodaje Completado",
    bg: "bg-gray-100 text-gray-700 border-gray-200"
  }
};

/**
 * UpcomingProductionSpotlight
 * Tarjeta heroica destacada para el centro de mando operativo.
 * Enfatiza la fecha, hora, locación y progreso de requerimientos de la próxima sesión.
 */
export default function UpcomingProductionSpotlight({
  prod,
  ciclo = {},
  cliente = {},
  onOpenModal = null
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!prod) return null;

  const sessionName = getSessionDisplayName(prod, ciclo?.mes, prod.numero_sesion || 1);
  const statusInfo = STATUS_CONFIG[prod.estado] || STATUS_CONFIG.pendiente_agendamiento;

  const reqs = Array.isArray(prod.requerimientos) ? prod.requerimientos : [];
  const totalReqs = reqs.length;
  const completedReqs = reqs.filter((r) => r.completado).length;
  const percentage = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;
  const todoListo = totalReqs > 0 && completedReqs === totalReqs;

  const formatDateDisplay = (isoStr) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return null;
    }
  };

  const getProgressWidthClass = (pct) => {
    if (pct >= 100) return "w-full";
    if (pct >= 75) return "w-3/4";
    if (pct >= 50) return "w-1/2";
    if (pct >= 25) return "w-1/4";
    if (pct > 0) return "w-1/12";
    return "w-0";
  };

  const formattedDate = formatDateDisplay(prod.fecha_produccion);
  const publicBookingUrl = prod.token_reserva
    ? `${window.location.origin}/reservar/produccion?token=${prod.token_reserva}`
    : null;

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!publicBookingUrl) {
      toast.error("Esta sesión no cuenta con token de reserva.");
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(publicBookingUrl);
      setCopiedLink(true);
      toast.success("Enlace de reserva copiado al portapapeles");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onOpenModal?.(prod)}
      className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#ef18d6] shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3.5 relative overflow-hidden text-left font-inter"
    >
      {/* Cabecera de Próxima Sesión */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1 shrink-0">
            <Video className="w-3 h-3 text-brand-blue" />
            Próximo Rodaje
          </span>
          <h4 className="text-sm font-sora font-extrabold text-gray-900 truncate">
            {sessionName}
          </h4>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${statusInfo.bg}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Fecha, Horario y Locación Destacados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1 border-y border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50/80 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-gray-400 block font-semibold leading-tight">
              Fecha de Rodaje
            </span>
            <span className="text-xs sm:text-sm font-sora font-bold text-gray-900 truncate block">
              {formattedDate || "Fecha por definir (Auto-reserva)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-gray-400 block font-semibold leading-tight">
              Locación
            </span>
            <span
              className="text-xs font-inter font-medium text-gray-800 truncate block"
              title={prod.locacion || cliente.locacion_default || "Instalaciones del cliente"}
            >
              {prod.locacion || cliente.locacion_default || "Instalaciones del cliente"}
            </span>
          </div>
        </div>
      </div>

      {/* Bloque Clínico de Requerimientos (X/Y listos) */}
      <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-200/80 space-y-1.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <ClipboardCheck className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span className="text-xs font-sora font-semibold text-gray-800 truncate">
              Requerimientos de Rodaje
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              totalReqs === 0
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : todoListo
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-brand-blue border-blue-200"
            }`}
          >
            {totalReqs === 0 ? "0 requerimientos" : `${completedReqs}/${totalReqs} listos`}
          </span>
        </div>

        {totalReqs > 0 && (
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${getProgressWidthClass(percentage)} ${
                todoListo ? "bg-emerald-500" : "bg-brand-blue"
              }`}
            />
          </div>
        )}
      </div>

      {/* Botones de Acción Rápida */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          {publicBookingUrl && (
            <>
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-7 px-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-sora font-semibold inline-flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
                title="Copiar enlace de reserva para el cliente"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-gray-500" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>

              <a
                href={publicBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors active:scale-95"
                title="Abrir enlace de auto-reserva"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-sora font-semibold text-brand-blue group-hover:translate-x-0.5 transition-transform">
          <span>Ver sesión</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

