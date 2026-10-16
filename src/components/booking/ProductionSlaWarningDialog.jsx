import { useMemo } from "react";
import { AlertTriangle, Clock, Calendar, Film, Loader2, Check, Timer } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { getSessionTypeInfo } from "@/utils/bookingHelpers";

/**
 * ProductionSlaWarningDialog
 * Modal clínico de SLA que previene desajustes operativos, transparentando
 * la regla de 72 horas, caducidad mensual, puntualidad y especificación técnica del rodaje.
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

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
      <AlertDialogContent className="max-w-lg w-full bg-white rounded-2xl border border-amber-200/80 shadow-2xl p-6 font-inter text-gray-900">
        <AlertDialogHeader className="space-y-1.5 text-left">
          {/* Badge Superior Clínico */}
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
            Protocolo de Rodaje • Términos Operativos
          </span>

          <AlertDialogTitle className="font-sora text-xl font-bold text-gray-900 tracking-tight mt-2">
            Confirmación de Fecha & Políticas de SLA
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs text-gray-500 font-inter">
            Por favor confirma que estás de acuerdo con los lineamientos de filmación para la fecha seleccionada
            {fechaSeleccionada ? ` (${fechaSeleccionada})` : ""}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Caja de Cláusulas Clínicas */}
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 text-xs space-y-3 text-amber-950 my-2">
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

        {/* Footer de Confirmación */}
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2 pt-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200 px-4 h-10 transition-all cursor-pointer m-0"
          >
            Revisar Fecha
          </AlertDialogCancel>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-full bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider px-6 h-10 shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Acepto y Confirmo Rodaje</span>
              </>
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
