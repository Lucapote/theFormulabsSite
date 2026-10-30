import { useState, useEffect } from "react";
import { Clapperboard, MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { getDatosBancarios } from "@/services/configService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

/**
 * ProposalActivationModal
 * Rediseño quirúrgico y enfocado a conversión para la activación de propuesta.
 * 2 bloques claros: Monto Heroico y Datos Bancarios dinámicos con copiado rápido.
 */
export default function ProposalActivationModal({
  isOpen,
  onClose,
  propuesta = {},
  planSeleccionado = {},
  montoTotal = 0
}) {
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    banco: "BBVA México",
    beneficiario: "The Formulabs",
    clabe: "012345678901234567",
    concepto_default: "Servicio de Contenido",
    telefono: "529981234567"
  });

  const contenido = propuesta?.contenido || propuesta?.content || {};
  const clientInfo = propuesta?.client || contenido?.client || {};
  const clientName = clientInfo?.name || propuesta?.cliente || "Cliente";
  const planName = planSeleccionado?.name || "Estratégico Personalizado";

  useEffect(() => {
    if (isOpen) {
      getDatosBancarios().then((res) => {
        if (res?.success && res?.data) {
          setBankDetails(res.data);
        }
      });
    }
  }, [isOpen]);

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

  const isDosSesiones =
    totalSessions >= 2 ||
    contenido?.paymentFrequency === "quincenal" ||
    contenido?.esquema_pago === "quincenal" ||
    contenido?.esquema_pago === "dos_pagos" ||
    Boolean(contenido?.billingDay2 || contenido?.dia_corte_pago_2) ||
    Boolean(propuesta?.cliente_data?.dia_corte_pago_2);

  const montoInicial = isDosSesiones ? Math.round(montoTotal / 2) : montoTotal;
  const montoSegundo = isDosSesiones ? montoTotal - montoInicial : 0;
  const montoEfectivo = montoInicial || montoTotal;
  const conceptoSugerido = clientName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || bankDetails.concepto_default || "TheFormulab";

  const copyClabe = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bankDetails.clabe);
      setCopied(true);
      toast.success("Cuenta CLABE copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const waPaymentLabel = isDosSesiones
    ? `del primer abono ($${Number(montoInicial).toLocaleString("es-MX")} MXN de un total de $${Number(montoTotal).toLocaleString("es-MX")} MXN)`
    : `de activación ($${Number(montoTotal).toLocaleString("es-MX")} MXN)`;

  const waMessage = encodeURIComponent(
    `Hola The Formulab, acabo de realizar la transferencia ${waPaymentLabel} para el plan ${planName} de ${clientName}. Les comparto mi comprobante para validar la cuenta y agendar mi rodaje.`
  );
  const cleanPhone = (bankDetails.telefono || "529981234567").replace(/\D/g, "") || "529981234567";
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xl p-5 sm:p-6 font-inter text-center max-h-[92vh] overflow-y-auto">
        {/* Header Sintético y Minimalista */}
        <DialogHeader className="space-y-0.5 text-center sm:text-center">
          <Clapperboard className="w-5 h-5 text-[#188ff0] mx-auto mb-1" />
          <DialogTitle className="font-sora text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            ¡Todo listo para comenzar!
          </DialogTitle>
          <DialogDescription className="text-[11px] text-gray-500 max-w-xs mx-auto">
            Realiza tu transferencia de activación para agendar tu rodaje.
          </DialogDescription>
        </DialogHeader>

        {/* Bloque 1: Inversión Total & Distribución de Cobros (Compacto) */}
        <div className="my-2.5 p-3 bg-gray-50/90 border border-gray-100 rounded-xl sm:rounded-2xl text-left space-y-2">
          {/* Fila: Total General del Contrato */}
          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-gray-200/70">
            <span className="font-inter text-gray-500 font-medium">Inversión Total del Plan</span>
            <div className="text-right">
              <span className="font-sora text-xs sm:text-sm font-bold text-gray-900">
                ${Number(montoTotal).toLocaleString("es-MX")}
              </span>
              <span className="text-[10px] font-mono text-gray-400 ml-1">MXN</span>
            </div>
          </div>

          {/* Distribución de Cobros */}
          {isDosSesiones ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Cobro 1: Inmediato (Hero / Prioridad Alta) */}
              <div className="p-2 sm:p-2.5 bg-white border-2 border-brand-blue/40 rounded-lg sm:rounded-xl shadow-2xs relative text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold text-brand-blue uppercase tracking-wider">
                    1er Abono (50%)
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                </div>
                <div className="font-sora text-base sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
                  ${Number(montoInicial).toLocaleString("es-MX")}
                  <span className="text-[9px] font-bold text-gray-400 ml-0.5">MXN</span>
                </div>
                <span className="text-[10px] font-inter font-semibold text-emerald-600 block leading-tight mt-0.5">
                  ● A transferir hoy
                </span>
              </div>

              {/* Cobro 2: Programado (Secundario) */}
              <div className="p-2 sm:p-2.5 bg-gray-100/60 border border-gray-200/70 rounded-lg sm:rounded-xl opacity-80 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    2do Abono (50%)
                  </span>
                </div>
                <div className="font-sora text-base sm:text-lg font-bold text-gray-600 tracking-tight mt-0.5">
                  ${Number(montoSegundo).toLocaleString("es-MX")}
                  <span className="text-[9px] font-medium text-gray-400 ml-0.5">MXN</span>
                </div>
                <span className="text-[10px] font-inter text-gray-400 block leading-tight mt-0.5">
                  Segundo corte / Sesión 2
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-center shadow-2xs">
              <span className="font-mono text-[9px] font-bold text-brand-blue uppercase tracking-wider block mb-0.5">
                Monto a Transferir (100% Activación)
              </span>
              <div className="font-sora text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                ${Number(montoTotal).toLocaleString("es-MX")}{" "}
                <span className="text-xs font-bold text-gray-400">MXN</span>
              </div>
            </div>
          )}
        </div>

        {/* Bloque 2: Datos Bancarios Clave (Minimalista) */}
        <div className="bg-blue-50/40 border border-blue-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-left space-y-2 text-xs">
          {/* Fila Banco / Beneficiario */}
          <div className="text-[11px] text-gray-600 flex items-center justify-between flex-wrap gap-1">
            <span>
              Banco: <strong className="text-gray-900 font-semibold">{bankDetails.banco}</strong>
            </span>
            <span>
              Beneficiario: <strong className="text-gray-900 font-semibold">{bankDetails.beneficiario}</strong>
            </span>
          </div>

          {/* Fila CLABE destacada (Click to Copy) */}
          <div className="flex items-center justify-between bg-white border border-blue-200/80 rounded-lg p-2 shadow-2xs">
            <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 tracking-wider">
              {bankDetails.clabe}
            </span>
            <button
              type="button"
              onClick={copyClabe}
              className="rounded-full h-6 px-2.5 bg-[#188ff0] hover:bg-blue-600 text-white font-sora text-[10px] font-bold transition-all active:scale-[0.98] inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-white" />}
              <span>{copied ? "Copiada" : "Copiar"}</span>
            </button>
          </div>

          {/* Concepto sugerido */}
          <div className="text-[10px] text-gray-500 flex items-center justify-between">
            <span>Concepto sugerido:</span>
            <strong className="font-mono text-gray-800 bg-white/80 px-1.5 py-0.5 rounded border border-blue-100/60">
              {conceptoSugerido}
            </strong>
          </div>
        </div>

        {/* Botón Principal de Conversión */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 sm:h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Enviar Comprobante por WhatsApp</span>
        </a>

        {/* Micro-texto legal y Gatekeeper */}
        <p className="text-[10px] text-gray-400 mt-2 leading-tight">
          Al transferir, tu enlace de reserva se habilitará para agendar de Lun a Vie con 3 días de anticipación.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors mt-1.5 block mx-auto cursor-pointer"
        >
          Volver a la propuesta
        </button>
      </DialogContent>
    </Dialog>
  );
}
