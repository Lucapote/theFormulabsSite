import {
  Clock,
  Calendar,
  MessageCircle,
  Film,
  CheckCircle2,
  Timer
} from "lucide-react";
import { getSessionTypeInfo } from "@/utils/bookingHelpers";

/**
 * BookingSideContextPanel
 * Panel contextual lateral exclusivo para pantallas Laptop y Desktop (>= 1024px).
 * Proporciona certidumbre operativa, especificaciones de rodaje y políticas SLA fijas
 * al lado del formulario de reserva.
 */
export default function BookingSideContextPanel({
  produccion = {},
  cliente = {},
  ciclo = {}
}) {
  const clientName = cliente?.nombre || produccion?.cliente?.nombre || "Cliente";
  const displayCompany =
    cliente?.empresa && cliente.empresa !== clientName ? cliente.empresa : null;

  const tipo = produccion?.tipo || cliente?.tipo_sesion_default || "organica";
  const sessionHours =
    produccion?.duracion_horas || (tipo === "institucional" ? 6 : 4);
  const typeInfo = getSessionTypeInfo(tipo, sessionHours);

  const cleanPhone = "529982148831";
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola The Formulab, tengo dudas sobre mi reserva de rodaje (${clientName}${
      displayCompany ? ` - ${displayCompany}` : ""
    }).`
  )}`;

  return (
    <aside className="bg-white/90 backdrop-blur-lg border border-gray-200/90 rounded-3xl p-6 shadow-sm space-y-5 font-inter text-left sticky top-24">
      {/* Cabecera del Panel */}
      <div className="space-y-1.5 pb-4 border-b border-gray-100">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue border border-blue-100 text-xs font-sora font-semibold">
          <span>Expediente de Producción</span>
        </span>
        <h3 className="text-lg font-sora font-extrabold text-gray-900 tracking-tight">
          Información del Rodaje
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Revisa las especificaciones técnicas asignadas a tu cuenta y los lineamientos de filmación.
        </p>

        {typeInfo?.technicalDescription && (
          <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
            <Film className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong className="font-semibold block font-sora text-brand-blue">
                Producción {typeInfo.title}:
              </strong>{" "}
              {typeInfo.technicalDescription}
            </p>
          </div>
        )}
      </div>

      {/* Protocolos de Rodaje & SLA (Cápsula Rosa de Marca) */}
      <div className="bg-pink-50/80 border border-pink-200/90 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-pink-200/70">
          <div className="w-5 h-5 rounded-md bg-[#ef18d6] text-white flex items-center justify-center shadow-xs shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-sora font-bold text-[#ef18d6] tracking-wider uppercase">
            Lineamientos Operativos de Rodaje
          </span>
        </div>

        <div className="space-y-3 font-inter text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ef18d6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <p className="text-pink-950 leading-relaxed text-xs">
              <strong className="font-semibold text-pink-900">Ventana de 72h:</strong> Cambios o cancelaciones deben solicitarse con al menos 3 días hábiles de anticipación.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ef18d6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Timer className="w-3.5 h-3.5" />
            </div>
            <p className="text-pink-950 leading-relaxed text-xs">
              <strong className="font-semibold text-pink-900">Puntualidad:</strong> 30 minutos de tolerancia para inicio del llamado por bloqueo de crew técnico.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ef18d6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-pink-950 leading-relaxed text-xs">
              <strong className="font-semibold text-pink-900">Vigencia:</strong> Las sesiones corresponden al ciclo contratado y no son acumulables.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Asistencia WhatsApp */}
      <div className="pt-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-sora font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Contactar a tu Productor por WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
