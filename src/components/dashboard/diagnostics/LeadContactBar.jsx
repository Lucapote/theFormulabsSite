import { MessageCircle, Instagram, MapPin } from "lucide-react";

/**
 * LeadContactBar
 * Barra clínica con botones tipo píldora de alta conversión para contacto directo con el lead.
 */
export default function LeadContactBar({
  whatsapp = "",
  instagram = "",
  ubicacion = "",
  nombre = "Prospecto"
}) {
  const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${nombre}! Te escribo desde The Formulab sobre tu diagnóstico de contenido.`)}`
    : null;
  const cleanInsta = instagram ? instagram.replace(/^@/, "").trim() : "";
  const instaUrl = cleanInsta ? `https://instagram.com/${cleanInsta}` : null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-gray-50/80 border border-gray-100 rounded-2xl p-3 text-xs font-inter">
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sora font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Directo</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 font-sora text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Sin WhatsApp
        </span>
      )}

      {instaUrl ? (
        <a
          href={instaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E1306C] hover:bg-[#cc245e] text-white font-sora font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Ver Instagram</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 font-sora text-xs">
          <Instagram className="w-3.5 h-3.5" /> Sin Instagram
        </span>
      )}

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700 font-medium shadow-2xs">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="truncate max-w-[200px]">{ubicacion || "Ubicación no especificada"}</span>
      </div>
    </div>
  );
}
