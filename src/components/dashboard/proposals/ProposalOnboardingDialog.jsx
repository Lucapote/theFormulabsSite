import { RefreshCw, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export const getProposalConversionDetails = (proposal) => {
  if (!proposal) return null;
  const contenido = proposal.contenido || proposal.content || {};
  const clientData = contenido.client || {};

  const nombre = (clientData.name || proposal.cliente || "Cliente Estimado").trim();
  const empresa = (clientData.company || clientData.shortName || clientData.name || nombre).trim();

  // Plan y Finanzas
  const selectedPlanId = contenido.selectedPlanId || contenido.selectedPlan;
  const plansList = Array.isArray(contenido.pricingPlans) ? contenido.pricingPlans : [];
  const currentPlan =
    (selectedPlanId ? plansList.find((p) => p.id === selectedPlanId) : null) ||
    plansList.find((p) => p.highlight) ||
    plansList[0] ||
    {};

  const monto = Number(contenido.totalPrice || currentPlan.price) || 0;
  const montoFormateado = monto > 0 ? `$${monto.toLocaleString("es-MX")} MXN` : "Por definir";

  // Esquema
  const esquema =
    contenido.paymentFrequency === "quincenal" || contenido.esquema_pago === "quincenal"
      ? "quincenal"
      : "mensual";
  const dia1 = Number(contenido.billingDay || contenido.dia_corte_pago) || 1;
  const dia2 = Number(contenido.billingDay2 || contenido.dia_corte_pago_2) || 15;
  const esquemaTexto =
    esquema === "quincenal"
      ? `Quincenal (Cortes días ${dia1} y ${dia2})`
      : `Mensual (Corte día ${dia1})`;

  // Sesiones por mes
  let producciones = 1;
  const scopeProducciones = Number(contenido.scope?.producciones_por_mes);
  const extraSessions = Number(contenido.pricing?.extraSessionsCount) || 0;

  if (scopeProducciones > 0) {
    producciones = scopeProducciones + extraSessions;
  } else if (Number(contenido.producciones_por_mes) > 0) {
    producciones = Number(contenido.producciones_por_mes) + extraSessions;
  } else {
    const planReels = Number(currentPlan.reels) || 0;
    const planShoots = Number(currentPlan.shoots || currentPlan.rodajes || currentPlan.sesiones) || 0;
    const hasTwoCoverages =
      Array.isArray(contenido.baseFeatures) &&
      contenido.baseFeatures.some(
        (f) => typeof f === "string" && /2\s+(coberturas|rodajes|sesiones)/i.test(f)
      );

    if (planShoots >= 2 || planReels > 10 || hasTwoCoverages) {
      producciones = 2 + extraSessions;
    } else {
      producciones = 1 + extraSessions;
    }
  }

  // Locación
  const locacion =
    clientData.location ||
    clientData.address ||
    contenido.location ||
    contenido.address ||
    null;

  return {
    nombre,
    empresa,
    montoFormateado,
    esquemaTexto,
    producciones,
    locacion: locacion ? String(locacion).trim() : null
  };
};

export default function ProposalOnboardingDialog({
  isOpen,
  onClose,
  proposal,
  isConverting,
  onConfirm
}) {
  if (!proposal) return null;
  const details = getProposalConversionDetails(proposal);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isConverting) onClose();
      }}
    >
      <AlertDialogContent className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 font-inter overflow-hidden">
        <AlertDialogHeader className="text-left space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue mb-1">
            <UserPlus className="w-5 h-5 text-[#188ff0]" />
          </div>
          <AlertDialogTitle className="font-sora text-xl font-extrabold text-gray-900 tracking-tight">
            Dar de Alta Nuevo Cliente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-gray-500 font-normal leading-relaxed">
            Se creará la ficha del cliente y su ciclo operativo con los siguientes parámetros extraídos de la versión seleccionada:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {details && (
          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 space-y-2.5 text-xs my-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Cliente:</span>
              <span className="font-bold text-gray-900 font-sora text-right truncate max-w-[220px]">
                {details.nombre}
                {details.empresa && details.empresa !== details.nombre ? ` (${details.empresa})` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Retainer Mensual:</span>
              <span className="font-sora font-bold text-gray-900 text-sm">
                {details.montoFormateado}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Sesiones / Mes:</span>
              <span className="font-sora font-semibold text-gray-800">
                {details.producciones} {details.producciones === 1 ? "producción" : "producciones"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Esquema:</span>
              <span className="font-sora font-semibold text-gray-800">
                {details.esquemaTexto}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 pt-0.5">
              <span className="text-gray-500 font-medium shrink-0">Locación base:</span>
              {details.locacion ? (
                <span className="font-medium text-gray-800 text-right truncate max-w-[200px]" title={details.locacion}>
                  {details.locacion}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200/70 text-gray-600">
                  Sin especificar (se puede editar luego)
                </span>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-3 flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={isConverting}
            onClick={onClose}
            className="h-10 px-5 rounded-full font-sora font-bold text-xs uppercase tracking-wider border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer transition-all m-0"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isConverting}
            onClick={onConfirm}
            className="h-10 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-blue-200 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] m-0"
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Activando...
              </>
            ) : (
              "Confirmar y Activar Cliente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
