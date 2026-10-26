import { useMemo } from "react";
import { AlertTriangle, Clock, Calendar, Film, Check, Timer } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { getSessionTypeInfo } from "@/utils/bookingHelpers";

/**
 * ProductionSlaWarningDialog
 * Modal clínico de SLA que previene desajustes operativos, transparentando
 * la regla de 72 horas, caducidad mensual, puntualidad y especificación técnica del rodaje.
 * Clinical High-Tech Lab design system.
 */
export default function ProductionSlaWarningDialog({
  isOpen,
  onConfirm,
  onCancel,
  tipoProduccion = "organica",
  fechaSeleccionada = "",
  isSubmitting = false,
  duracionHoras = null
}) {
  const typeInfo = useMemo(
    () => getSessionTypeInfo(tipoProduccion, duracionHoras),
    [tipoProduccion, duracionHoras]
  );

  const headerBadge = (
    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
      Protocolo de Rodaje • Términos Operativos
    </span>
  );

  const submitLabel = (
    <span className="inline-flex items-center gap-1.5">
      <Check className="w-4 h-4" />
      <span>Acepto y Confirmo Rodaje</span>
    </span>
  );

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onCancel}
      onSubmit={(e) => {
        if (e) e.preventDefault();
        onConfirm?.();
      }}
      maxWidth="max-w-lg"
      badge={headerBadge}
      title="Confirmación de Fecha & Políticas de SLA"
      description={`Por favor confirma que estás de acuerdo con los lineamientos de filmación para la fecha seleccionada${
        fechaSeleccionada ? ` (${fechaSeleccionada})` : ""
      }.`}
      cancelText="Revisar Fecha"
      submitText={submitLabel}
      loadingText="Confirmando..."
      isLoading={isSubmitting}
      submitButtonClass="rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-200 active:scale-[0.98] transition-all"
    >
      {/* Caja de Cláusulas Clínicas */}
      <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 text-xs space-y-3 text-amber-950">
        {/* Punto 1: Ventana de Cancelación */}
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-900">Ventana de 72h:</strong> Cancelaciones dentro de los 3 días previos (72h) o inasistencia causan la pérdida del slot y requerirán costo adicional de reagendamiento por el bloqueo del crew técnico.
          </p>
        </div>

        {/* Punto 2: Caducidad Mensual */}
        <div className="flex items-start gap-2.5">
          <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-900">No Acumulables:</strong> Las sesiones corresponden al mes corriente y no son acumulables para meses posteriores.
          </p>
        </div>

        {/* Punto 3: Tolerancia y Tiempo Extra */}
        <div className="flex items-start gap-2.5">
          <Timer className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-900">Tolerancia y Tiempo Extra:</strong> Existe una tolerancia máxima de 30 minutos para el inicio del rodaje. Cualquier tiempo extra que exceda la jornada pactada de la sesión tendrá un costo adicional.
          </p>
        </div>

        {/* Punto 4: Nivel Técnico */}
        <div className="flex items-start gap-2.5 pt-2 border-t border-amber-200/60">
          <Film className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <span className="font-semibold text-amber-900 block">
              Nivel Técnico: Producción {typeInfo.title} ({typeInfo.hours} horas)
            </span>
            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-100/80 text-amber-900 border border-amber-300/60">
              {typeInfo.technicalDescription}
            </span>
          </div>
        </div>
      </div>
    </BaseFormModal>
  );
}
