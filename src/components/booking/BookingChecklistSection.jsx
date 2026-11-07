import { useState, useEffect } from "react";
import { Check, ClipboardCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { actualizarChecklistProduccion } from "@/services/operationsService";

/**
 * BookingChecklistSection
 * Sección inline para el 3er paso [Requerimientos] dentro de la tarjeta unificada de reserva.
 * Ocupa exactamente el mismo ancho y estilo de la tarjeta, adaptada al viewport sin scroll.
 */
export default function BookingChecklistSection({
  requerimientos = [],
  token = "",
  onRequerimientosUpdated = null,
  onBack = null,
  readOnly = false
}) {
  const [items, setItems] = useState(requerimientos);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setItems(Array.isArray(requerimientos) ? requerimientos : []);
  }, [requerimientos]);

  const total = items.length;
  const completados = items.filter((i) => i.completado).length;
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
  const todoListo = total > 0 && completados === total;

  const getProgressWidthClass = (pct) => {
    if (pct >= 100) return "w-full";
    if (pct >= 75) return "w-3/4";
    if (pct >= 50) return "w-1/2";
    if (pct >= 25) return "w-1/4";
    if (pct > 0) return "w-1/12";
    return "w-0";
  };

  const handleToggle = async (item) => {
    if (readOnly || !token) return;

    const nextCompletado = !item.completado;
    const nextItems = items.map((i) =>
      i.id === item.id
        ? { ...i, completado: nextCompletado, updated_at: new Date().toISOString() }
        : i
    );

    setItems(nextItems);
    setUpdatingId(item.id);

    const res = await actualizarChecklistProduccion(token, nextItems);
    setUpdatingId(null);

    if (res.success) {
      if (onRequerimientosUpdated) onRequerimientosUpdated(nextItems);
      if (nextCompletado) {
        toast.success(`Marcado: "${item.texto.slice(0, 30)}..."`, { duration: 1800 });
      }
    } else {
      setItems(items);
      toast.error("No se pudo guardar el cambio.");
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-3 font-inter text-left">
      {/* Cabecera de Requerimientos */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-sora font-extrabold text-gray-900 tracking-tight truncate">
              Requerimientos de Rodaje
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-inter truncate">
              Marca los puntos antes del día de filmación
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider inline-flex items-center gap-1 shrink-0 ${
            todoListo
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-blue-50 text-brand-blue border border-blue-100"
          }`}
        >
          {todoListo ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>100% LISTO</span>
            </>
          ) : (
            <span>
              {completados}/{total} LISTOS
            </span>
          )}
        </span>
      </div>

      {/* Barra de Progreso */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${getProgressWidthClass(porcentaje)} ${
            todoListo ? "bg-emerald-500" : "bg-brand-blue"
          }`}
        />
      </div>

      {/* Lista de Checkboxes Táctiles */}
      <div className="space-y-1.5 pt-1">
        {total === 0 ? (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
            No hay requerimientos específicos registrados para esta sesión.
          </div>
        ) : (
          items.map((item) => {
            const isUpdating = updatingId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={readOnly || isUpdating}
                onClick={() => handleToggle(item)}
                className={`w-full min-h-[42px] p-2 sm:p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] select-none ${
                  item.completado
                    ? "bg-emerald-50/60 border-emerald-200/80 shadow-2xs"
                    : "bg-gray-50/70 hover:bg-gray-100/80 border-gray-200/80"
                } ${readOnly ? "cursor-default active:scale-100" : ""}`}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                    item.completado
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "bg-white border-gray-300 text-transparent"
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 text-brand-blue animate-spin" />
                  ) : (
                    <Check
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        item.completado ? "opacity-100 stroke-[3]" : "opacity-0"
                      }`}
                    />
                  )}
                </div>

                <span
                  className={`text-xs font-inter leading-snug flex-1 ${
                    item.completado
                      ? "line-through text-gray-400 font-normal"
                      : "text-gray-800 font-medium"
                  }`}
                >
                  {item.texto}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Botón de Retorno si se provee callback */}
      {onBack && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Reserva</span>
          </button>
        </div>
      )}
    </div>
  );
}

