import { MessageCircle, Instagram, Eye, Trash2, Calendar, MapPin, DollarSign } from "lucide-react";
import { formatLeadDate } from "@/utils/formatters";
import { LEAD_STATUS_CONFIG } from "@/data/leadStatusData";

export default function LeadCardItem({ lead, onViewDetail, onDelete }) {
  if (!lead) return null;

  const {
    nombre = "Prospecto",
    whatsapp = "",
    instagram = "",
    score = 0,
    route = "C",
    route_name = "General",
    suggested_range = "",
    ubicacion = "",
    status = "en_espera",
    created_at
  } = lead;

  const currentStatus = LEAD_STATUS_CONFIG[status] || LEAD_STATUS_CONFIG.en_espera;

  // Formatear enlace a WhatsApp
  const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  // Formatear enlace a Instagram
  const cleanInsta = instagram ? instagram.replace(/^@/, "").trim() : "";
  const instaUrl = cleanInsta ? `https://instagram.com/${cleanInsta}` : null;

  // Badge de Servicio Requerido (Ruta)
  const routePillClass =
    route === "A"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : route === "B"
      ? "bg-blue-50 text-brand-blue border-blue-200"
      : route === "web"
      ? "bg-cyan-50 text-cyan-700 border-cyan-200"
      : "bg-pink-50 text-brand-magenta border-pink-200";

  return (
    <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 group">
      {/* 1. Encabezado con Nombre y Badges en font-sora idénticos a PostCardItem */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sora text-base font-extrabold text-gray-900 tracking-tight leading-snug truncate">
            {nombre}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {/* Badge de Estado con dot idéntico a PostCardItem */}
            <span
              className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${currentStatus.colorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
              {currentStatus.label}
            </span>

            {/* Badge de Servicio Requerido en font-sora */}
            <span
              className={`inline-flex items-center font-sora font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${routePillClass}`}
            >
              {route_name || (route === "A" ? "Gestión Integral" : route === "B" ? "Proyecto Puntual" : route === "web" ? "Sitio Web" : "Mentoría Clínica")}
            </span>
          </div>
        </div>

        {/* Canales directos de contacto */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 font-sora font-bold text-xs transition-colors"
              title="Abrir chat de WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>+{cleanPhone}</span>
            </a>
          )}

          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200/80 text-pink-700 font-sora font-bold text-xs transition-colors"
              title="Abrir perfil de Instagram"
            >
              <Instagram className="w-3.5 h-3.5 shrink-0 text-pink-600" />
              <span>@{cleanInsta}</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Metadata: Ubicación, Fecha y Rango de Inversión en font-inter */}
      <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100/80 pt-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-inter font-medium text-gray-500">
          {ubicacion ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate max-w-[160px]">{ubicacion}</span>
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}

          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>{formatLeadDate(created_at)}</span>
          </span>
        </div>

        {suggested_range && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-0.5 font-inter">
            <DollarSign className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span className="truncate">
              Presupuesto: <strong className="text-gray-900 font-sora font-bold">{suggested_range}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. Acciones del pie de tarjeta idénticas a PostCardItem */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <div className="text-[11px] font-sora font-bold text-gray-400">
          Expediente
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onViewDetail(lead)}
            className="h-8 px-3.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Expediente</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(lead)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            title="Eliminar expediente"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
