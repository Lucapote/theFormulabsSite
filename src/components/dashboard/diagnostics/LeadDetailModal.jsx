import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Instagram,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  DollarSign,
  Compass,
  CheckCircle2,
  ExternalLink,
  Target
} from "lucide-react";
import { formatLeadDate } from "@/utils/formatters";
import { LEAD_STATUS_OPTIONS } from "@/data/leadStatusData";

const QUESTION_TITLES = {
  objetivo: "1. Necesidad principal",
  nicho: "2. Industria o nicho",
  operacion: "3. Etapa operativa",
  gestion: "4. Gestión actual",
  inversion: "5. Presupuesto mensual"
};

export default function LeadDetailModal({ isOpen, onClose, lead, onStatusChange }) {
  if (!lead) return null;

  const {
    nombre = "Prospecto",
    whatsapp = "",
    instagram = "",
    ubicacion = "",
    cuando = "",
    score = 0,
    route = "C",
    route_name = "General",
    suggested_range = "",
    seconds_to_complete = null,
    src = null,
    utm_source = null,
    utm_medium = null,
    utm_campaign = null,
    referrer = null,
    created_at,
    answers = {}
  } = lead;

  const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const cleanInsta = instagram ? instagram.replace(/^@/, "").trim() : "";
  const instaUrl = cleanInsta ? `https://instagram.com/${cleanInsta}` : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 rounded-[2rem] bg-white border border-gray-100 shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-gray-100 pb-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-brand-blue uppercase bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Expediente Clínico · ID {lead.id?.slice(0, 8)}
            </span>
            <span className="text-xs text-gray-400 font-inter">
              {formatLeadDate(created_at)}
            </span>
          </div>

          <DialogTitle className="font-sora text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {nombre}
          </DialogTitle>

          {/* Quick Contact Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sora font-semibold flex items-center gap-1.5 transition-all shadow-xs shadow-emerald-200"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp (+{cleanPhone})</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            )}

            {instaUrl && (
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-sora font-semibold flex items-center gap-1.5 transition-all shadow-xs shadow-pink-200"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{cleanInsta}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 font-inter text-xs">
          {/* Card: Diagnóstico & Cualificación */}
          <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4 space-y-3">
            <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-magenta" />
              Diagnóstico y Servicio Recomendado
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-blue" /> Servicio Asignado
                </label>
                <div className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white flex items-center font-sora text-sm font-bold text-brand-blue shadow-xs">
                  {route_name || (route === "A" ? "Gestión Integral" : route === "B" ? "Proyecto Puntual" : route === "web" ? "Sitio Web" : "Mentoría Clínica")}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Presupuesto Reportado
                </label>
                <div className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white flex items-center font-sora text-xs font-bold text-gray-900 shadow-xs truncate">
                  {answers?.inversion?.label || "Sin especificar"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Estado Seguimiento
                </label>
                <select
                  value={lead.status || "en_espera"}
                  onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:border-gray-900 outline-none text-sm font-sora font-bold text-gray-900 bg-white cursor-pointer shadow-xs transition-colors"
                >
                  {LEAD_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {suggested_range && (
              <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200/80 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Rango de propuesta recomendado: <strong className="text-gray-900 font-sora font-bold">{suggested_range}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Card: Desglose de Respuestas Clínicas */}
          <div className="space-y-2.5">
            <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-blue" />
              Respuestas del Formulario ({Object.keys(answers || {}).length})
            </h4>

            <div className="space-y-2">
              {Object.entries(answers || {}).map(([key, val]) => {
                const title = QUESTION_TITLES[key] || key;
                const label = val?.label || "—";

                return (
                  <div
                    key={key}
                    className="bg-white border border-gray-200/70 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-0.5 flex-1">
                      <span className="text-[10px] font-sora font-bold text-gray-400 uppercase tracking-wider block">
                        {title}
                      </span>
                      <p className="text-xs font-semibold text-gray-800 font-inter">
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Logística & Atribución */}
          <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4 space-y-2">
            <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-gray-500" />
              Logística y Atribución
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Ubicación:</span>
                <span className="font-medium text-gray-800">{ubicacion || "No especificado"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Cuándo iniciar:</span>
                <span className="font-medium text-gray-800">{cuando || "No especificado"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">UTM Source:</span>
                <span className="font-mono text-gray-800">{utm_source || "directo"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Campaña:</span>
                <span className="font-mono text-gray-800">{utm_campaign || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
