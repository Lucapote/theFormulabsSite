import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, MapPin, Clock, Sparkles, ExternalLink, Mail, UserCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatLeadDate } from "@/utils/formatters";
import { LEAD_STATUS_OPTIONS } from "@/data/leadStatusData";
import { sendLeadEmailNotification } from "@/services/leadService";
import { createProposalFromLead } from "@/services/proposalCrudService";
import LeadToClientModal from "./LeadToClientModal";

const QUESTION_TITLES = {
  objetivo: "Necesidad principal",
  nicho: "Industria o nicho",
  operacion: "Etapa operativa",
  gestion: "Gestión actual",
  inversion: "Presupuesto mensual"
};

const formatDuration = (s) => {
  if (!s || s <= 0) return null;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m === 0 ? `${sec}s` : `${m}m ${sec > 0 ? `${sec}s` : ""}`.trim();
};

export default function LeadDetailModal({ isOpen, onClose, lead, onStatusChange }) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  if (!lead) return null;

  const {
    nombre = "Prospecto", whatsapp = "", instagram = "", ubicacion = "",
    cuando = "", suggested_range = "", seconds_to_complete = null, created_at,
    answers = {}
  } = lead;

  const cleanPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const cleanInsta = instagram ? instagram.replace(/^@/, "").trim() : "";
  const instaUrl = cleanInsta ? `https://instagram.com/${cleanInsta}` : null;
  const duration = formatDuration(seconds_to_complete);
  const answersList = Object.entries(answers || {});

  const handleResendEmail = async () => {
    setIsSendingEmail(true);
    const toastId = toast.loading("Enviando alerta...");
    const res = await sendLeadEmailNotification(lead);
    setIsSendingEmail(false);
    if (res.success) toast.success("Alerta enviada correctamente por Resend", { id: toastId });
    else toast.error(res.error || "No se pudo enviar la alerta por correo.", { id: toastId });
  };

  const handleCreateProposal = async () => {
    setIsCreatingProposal(true);
    const toastId = toast.loading("Generando propuesta desde el expediente...");
    const res = await createProposalFromLead(lead);
    setIsCreatingProposal(false);

    if (res.success && res.data?.propuesta) {
      const propuesta = res.data.propuesta;
      toast.success(`Borrador de propuesta creado para ${lead.nombre || "el prospecto"}`, {
        id: toastId,
        action: {
          label: "Abrir Propuesta",
          onClick: () => window.open(`/${propuesta.slug}`, "_blank")
        }
      });
      onStatusChange?.(lead.id, "propuesta_creada");
    } else {
      toast.error(res.error || "No se pudo generar la propuesta desde el lead.", { id: toastId });
    }
  };

  const isClienteActivo = lead.status === "cliente_activo";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto font-inter">
          {/* Header con Jerarquía Clínica */}
          <DialogHeader className="space-y-2 border-b border-gray-100 pb-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#188ff0] border border-blue-100">
                Expediente Clínico · ID {lead.id?.slice(0, 8)}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={lead.status || "en_espera"}
                  onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
                  className="h-8 px-2.5 rounded-full border border-gray-200 text-xs font-sora font-semibold text-gray-800 bg-white cursor-pointer shadow-2xs outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {LEAD_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={handleResendEmail}
                  className="h-8 px-3 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-sora font-medium flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  title="Reenviar alerta por email"
                >
                  <Mail className={`w-3.5 h-3.5 text-brand-blue ${isSendingEmail ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">{isSendingEmail ? "Enviando..." : "Alerta Email"}</span>
                </button>
              </div>
            </div>

            <DialogTitle className="font-sora text-2xl font-bold text-gray-900 tracking-tight">
              {nombre}
            </DialogTitle>

            <p className="text-xs text-gray-500 font-medium">
              Registrado el {formatLeadDate(created_at)}{duration ? ` • Tiempo de llenado: ${duration}` : ""}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-3 text-xs">
            {/* Bloque A: Ficha de Contacto Rápida (Grid de 3 columnas) */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">WhatsApp</span>
                  {waUrl ? (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1 truncate">
                      <span>+{cleanPhone}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                    </a>
                  ) : <span className="text-gray-400 italic">Sin especificar</span>}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ef18d6] shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Instagram</span>
                  {instaUrl ? (
                    <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="text-[#ef18d6] font-semibold hover:underline flex items-center gap-1 truncate">
                      <span>@{cleanInsta}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                    </a>
                  ) : <span className="text-gray-400 italic">Sin especificar</span>}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Ubicación / Ciudad</span>
                  <span className="text-gray-700 font-medium truncate block">{ubicacion || "No especificada"}</span>
                </div>
              </div>
            </div>

            {/* Bloque B: Logística y Timing */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-2">
              <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#188ff0]" /> Logística y Timing de Inicio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-gray-600">¿Cuándo busca iniciar?</span>
                  <span className="font-sora text-xs font-semibold px-3 py-1 bg-white border border-blue-200 text-[#188ff0] rounded-full inline-block self-start shadow-2xs">
                    {cuando || "Por definir"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-gray-600">Presupuesto / Rango Sugerido:</span>
                  <span className="font-mono text-xs font-bold text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-full inline-block self-start shadow-2xs">
                    {suggested_range || answers?.inversion?.label || "Sin especificar"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque C: Desglose Clínico de Respuestas */}
            <div className="space-y-2.5">
              <h4 className="font-sora text-xs font-bold text-gray-900 uppercase tracking-wider pt-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-magenta" /> Desglose Clínico de Respuestas ({answersList.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {answersList.map(([key, val], idx) => (
                  <div key={key} className="bg-white border border-gray-200/80 rounded-xl p-3.5 space-y-1.5 shadow-xs hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 mr-1.5">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-gray-800 leading-snug">{QUESTION_TITLES[key] || val?.question || key}</span>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-2 font-medium">
                      {val?.label || val?.answer || (typeof val === "string" ? val : "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer con Acciones */}
          <div className="mt-6 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleCreateProposal}
                disabled={isCreatingProposal}
                className="rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-md shadow-blue-100 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                {isCreatingProposal ? "Generando..." : "Generar Propuesta"}
              </Button>

              {isClienteActivo ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-sora font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cliente Activo
                </span>
              ) : (
                <Button
                  type="button"
                  onClick={() => setShowClientModal(true)}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Convertir en Cliente
                </Button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 px-5 h-9 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Conversión Directa a Cliente */}
      <LeadToClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        lead={lead}
        onClientCreated={(newClient) => {
          onStatusChange?.(lead.id, "cliente_activo");
          setShowClientModal(false);
        }}
      />
    </>
  );
}
