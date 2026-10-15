import { useState } from "react";
import { ShieldCheck, Building2, Copy, Check, LockKeyhole, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { formatPrice } from "@/utils/formatters";

/**
 * ProposalActivationModal
 * Clinical protocol modal displayed when client clicks "Aceptar Propuesta" / "Activar Cuenta".
 * Details banking transfer information (SPEI) and outlines the production gatekeeper rule.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object} [props.propuesta] - Proposal payload or metadata
 * @param {object} [props.planSeleccionado] - Currently active pricing plan
 * @param {number} [props.montoTotal=0] - Total calculated investment amount
 */
export default function ProposalActivationModal({
  isOpen,
  onClose,
  propuesta = {},
  planSeleccionado = {},
  montoTotal = 0
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const contenido = propuesta?.contenido || propuesta?.content || {};
  const clientInfo = propuesta?.client || contenido?.client || {};
  const clientName = clientInfo?.name || propuesta?.cliente || "Cliente Estimado";
  const planName = planSeleccionado?.name || "Estratégico Personalizado";

  // Identificar si son 2 sesiones (o esquema de 2 pagos acordados)
  const planShoots = Number(planSeleccionado?.shoots || planSeleccionado?.rodajes || planSeleccionado?.sesiones) || 0;
  const planReels = Number(planSeleccionado?.reels) || 0;
  const featuresList = [
    ...(Array.isArray(contenido?.baseFeatures) ? contenido.baseFeatures : []),
    ...(Array.isArray(propuesta?.baseFeatures) ? propuesta.baseFeatures : [])
  ];
  const hasTwoCoverages = featuresList.some(
    (f) => typeof f === "string" && /2\s+(coberturas|rodajes|sesiones)/i.test(f)
  );

  const totalSessions =
    Number(contenido?.producciones_por_mes || propuesta?.producciones_por_mes) ||
    (planShoots >= 2 || planReels >= 8 || hasTwoCoverages ? 2 : 1);

  // Si son dos sesiones (o 2 pagos acordados): se abona únicamente el 50% inicial (1 por sesión).
  // No damos opción de 100% para evitar redundancia con el acuerdo previo de dos pagos al mes.
  const isDosSesiones =
    totalSessions >= 2 ||
    contenido?.paymentFrequency === "quincenal" ||
    contenido?.esquema_pago === "quincenal" ||
    contenido?.esquema_pago === "dos_pagos" ||
    Boolean(contenido?.billingDay2 || contenido?.dia_corte_pago_2) ||
    Boolean(propuesta?.cliente_data?.dia_corte_pago_2);

  const montoInicial = isDosSesiones ? Math.round(montoTotal / 2) : montoTotal;

  const bankDetails = {
    banco: "BBVA México",
    beneficiario: "The Formulabs S.A.S.",
    clabe: "012180015487920194",
    concepto: clientName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || "TheFormulab"
  };

  const handleCopy = (text, key, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const waPaymentLabel = isDosSesiones
    ? `del primer abono (50% - ${formatPrice(montoInicial)} MXN)`
    : `de activación (${formatPrice(montoTotal)} MXN)`;

  const waMessage = encodeURIComponent(
    `Hola The Formulab, acabo de realizar la transferencia ${waPaymentLabel} para el plan ${planName} de ${clientName}. Les comparto mi comprobante para validar la cuenta y agendar mi rodaje.`
  );
  const waUrl = `https://wa.me/529981234567?text=${waMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 md:p-8 font-inter">
        {/* Header Clínico */}
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#188ff0] text-[11px] font-mono font-bold uppercase tracking-wider border border-blue-100 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-[#188ff0]" />
            <span>Protocolo de Kickoff • Paso 1 de 2</span>
          </div>

          <DialogTitle className="font-sora text-xl md:text-2xl font-bold text-gray-900 tracking-tight pt-1">
            Activación de Cuenta y Servicio
          </DialogTitle>

          <DialogDescription className="text-xs text-gray-500 leading-relaxed">
            Para asegurar la asignación exclusiva de equipo y slots de filmación en agenda, iniciamos formalmente con tu primer abono.
          </DialogDescription>
        </DialogHeader>

        {/* Caja de Resumen Financiero */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Plan Seleccionado:</span>
            <span className="font-sora font-semibold text-gray-900">{planName}</span>
          </div>

          <div className="pt-2 border-t border-gray-200/60 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider block">
                Monto Inicial a Transferir
              </span>
              <span className="text-2xl font-bold font-sora text-gray-900">
                {formatPrice(montoInicial)} <span className="text-xs font-normal text-gray-500">MXN</span>
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue border border-blue-100">
              {isDosSesiones ? "Primer Abono (50%)" : "Primer Mes Adelantado"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            {isDosSesiones
              ? "*Cubre la primera sesión de filmación del ciclo (50%). El segundo 50% se abona para la segunda sesión."
              : "*Cubre el primer ciclo operativo acordado para inicio de producción."}
          </p>
        </div>

        {/* Tarjeta de Datos Bancarios (SPEI) */}
        <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 space-y-2.5 text-left text-xs">
          <div className="flex items-center gap-1.5 text-brand-blue font-sora font-bold text-xs pb-1 border-b border-blue-100/60">
            <Building2 className="w-3.5 h-3.5" />
            <span>Datos de Transferencia (SPEI)</span>
          </div>

          {/* Banco & Beneficiario */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Banco</span>
              <span className="font-semibold text-gray-800">{bankDetails.banco}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Beneficiario</span>
              <span className="font-semibold text-gray-800">{bankDetails.beneficiario}</span>
            </div>
          </div>

          {/* CLABE con botón rápido */}
          <div className="pt-1.5 flex items-center justify-between bg-white border border-blue-100/80 rounded-lg p-2.5">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Cuenta CLABE</span>
              <span className="font-mono font-bold text-gray-900 tracking-wider text-xs">{bankDetails.clabe}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankDetails.clabe, "clabe", "Cuenta CLABE")}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
              title="Copiar CLABE"
            >
              {copiedKey === "clabe" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Concepto con botón rápido */}
          <div className="flex items-center justify-between bg-white border border-blue-100/80 rounded-lg p-2.5">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Concepto / Referencia</span>
              <span className="font-mono font-semibold text-gray-800 text-xs">{bankDetails.concepto}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankDetails.concepto, "concepto", "Concepto")}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
              title="Copiar Concepto"
            >
              {copiedKey === "concepto" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Aviso Gatekeeper de Rodaje */}
        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 text-left">
          <LockKeyhole className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Paso 2 Automático:</strong>{" "}
            {isDosSesiones
              ? "Una vez acreditado tu primer abono del 50%, recibirás de inmediato tu acceso exclusivo para elegir en calendario tu primera sesión de grabación (la segunda sesión se desbloqueará al validar tu segundo abono)."
              : "Una vez acreditada tu transferencia, recibirás de inmediato tu acceso exclusivo para elegir en calendario el día y la hora de tu primera sesión de grabación."}
          </p>
        </div>

        {/* Footer de Acciones */}
        <div className="space-y-2.5 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 w-full active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ya transferí, enviar comprobante por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors cursor-pointer py-1 block mx-auto"
          >
            Volver a la propuesta
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
