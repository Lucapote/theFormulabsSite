import { Trash2 } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import SlugPreviewField from "@/components/common/SlugPreviewField";
import ProductionScheduleFields from "./subcomponents/ProductionScheduleFields";
import ProductionLogisticsFields from "./subcomponents/ProductionLogisticsFields";
import { useProductionDetailManager } from "@/hooks/useProductionDetailManager";

/**
 * ProductionDetailModal
 * Modal clínico administrativo para gestionar, actualizar, cancelar o borrar la sesión de rodaje.
 */
export default function ProductionDetailModal({
  isOpen,
  onClose,
  produccion,
  clienteNombre = "",
  ciclo = null,
  onUpdated,
  onDeleted
}) {
  const {
    loading,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    formData,
    setFormData,
    defaultSuggestedName,
    displayName,
    reservationUrl,
    riskInfo,
    associatedReceiptUrl,
    esSegundoTramo,
    handleOpenMaps,
    handleCancelDate,
    handleDelete,
    handleSubmit
  } = useProductionDetailManager({
    produccion,
    ciclo,
    onUpdated,
    onDeleted,
    onClose
  });

  if (!produccion) return null;

  const headerBadge = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#188ff0] border border-blue-400/30 inline-flex items-center gap-1.5">
        Sesión #{produccion.numero_sesion || 1} • {produccion.tipo?.toUpperCase() || "RODAJE"}
      </span>
      {Boolean(produccion.precio_extra) && (
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 inline-flex items-center gap-1">
          +${Number(produccion.precio_extra).toLocaleString()} Extra
        </span>
      )}
    </div>
  );

  const headerDescription = (
    <span>
      Cliente: <strong className="text-gray-200 font-bold">{clienteNombre || "Cliente"}</strong>
      {ciclo ? ` • Ciclo ${ciclo.mes}/${ciclo.anio}` : ""}
    </span>
  );

  return (
    <>
      <BaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        className="h-[95vh] max-h-[95vh]"
        bodyClassName="max-h-none flex-1 overflow-y-auto min-h-0"
        maxWidth="max-w-lg"
        badge={headerBadge}
        title={displayName}
        description={headerDescription}
        cancelText="Cancelar"
        submitText="Guardar Cambios"
        loadingText="Guardando..."
        isLoading={loading}
        submitButtonClass="bg-[#188ff0] hover:bg-blue-600 text-white shadow-md shadow-blue-200 active:scale-[0.98] transition-all cursor-pointer"
        footerExtra={
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (typeof document !== "undefined") document.activeElement?.blur?.();
              setShowDeleteConfirm(true);
            }}
            className="h-9 px-3.5 rounded-full text-rose-600 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200 text-xs font-sora font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Eliminar</span>
          </button>
        }
      >
        <div className="space-y-4 w-full min-w-0 max-w-full overflow-hidden">
          <ProductionScheduleFields
            formData={formData}
            setFormData={setFormData}
            defaultSuggestedName={defaultSuggestedName}
            riskInfo={riskInfo}
            associatedReceiptUrl={associatedReceiptUrl}
            esSegundoTramo={esSegundoTramo}
            loading={loading}
            handleCancelDate={handleCancelDate}
          />

          <ProductionLogisticsFields
            formData={formData}
            setFormData={setFormData}
            ciclo={ciclo}
            produccion={produccion}
            handleOpenMaps={handleOpenMaps}
          />

          {reservationUrl && (
            <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-xl p-3 w-full min-w-0 max-w-full overflow-hidden">
              <SlugPreviewField
                label="Enlace público para que el cliente elija o confirme su fecha:"
                prefix="theformulab.io/reservar/produccion?token="
                slug={produccion.token_reserva}
                copyable
                fullUrl={reservationUrl}
              />
            </div>
          )}
        </div>
      </BaseFormModal>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isProcessing={isDeleting}
        title={`¿Eliminar Sesión #${produccion.numero_sesion}?`}
        message={
          produccion.precio_extra || produccion.comprobante_url
            ? `Esta acción eliminará definitivamente la sesión. ${
                produccion.comprobante_url
                  ? "Se purgará el comprobante de Cloudflare R2 sin dejar archivos huérfanos. "
                  : ""
              }${
                produccion.precio_extra
                  ? `Se descontará su valor ($${Number(produccion.precio_extra).toLocaleString()}) del monto cobrado del ciclo.`
                  : ""
              }`
            : "Esta acción eliminará definitivamente el registro de la sesión de rodaje de la base de datos."
        }
        confirmText="Eliminar Sesión"
      />
    </>
  );
}
