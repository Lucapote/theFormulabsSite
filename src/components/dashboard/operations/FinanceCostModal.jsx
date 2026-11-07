import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DollarSign, Trash2 } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { updateCicloFinanzas } from "@/services/operationsService";
import { uploadComprobanteAdmin } from "@/services/r2Service";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import FinanceMarginSummaryCard from "./subcomponents/FinanceMarginSummaryCard";
import FinanceAmountsFormFields from "./subcomponents/FinanceAmountsFormFields";
import ReceiptUploaderField from "./subcomponents/ReceiptUploaderField";

/**
 * FinanceCostModal
 * Modal clínico para registro de montos cobrados, costos operativos y comprobantes de pago.
 * Totalmente modularizado bajo SRP ($\le 250$ líneas) cumpliendo con GEMINI.md.
 */
export default function FinanceCostModal({
  isOpen,
  onClose,
  ciclo,
  clienteNombre = "",
  onUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    monto_cobrado: 0,
    costo_operativo: 0,
    estado_pago: "pendiente",
    fecha_pago: "",
    comprobante_url: "",
    comprobante_2_url: ""
  });
  const [uploadingReceipt1, setUploadingReceipt1] = useState(false);
  const [uploadingReceipt2, setUploadingReceipt2] = useState(false);

  useEffect(() => {
    if (ciclo) {
      setFormData({
        monto_cobrado: Number(ciclo.monto_cobrado) || 0,
        costo_operativo: Number(ciclo.costo_operativo) || 0,
        estado_pago: ciclo.estado_pago || "pendiente",
        fecha_pago: ciclo.fecha_pago ? ciclo.fecha_pago.slice(0, 10) : "",
        comprobante_url: ciclo.comprobante_url || "",
        comprobante_2_url: ciclo.comprobante_2_url || ""
      });
    }
  }, [ciclo]);

  if (!ciclo) return null;

  const isDosPagos =
    ciclo.cliente?.esquema_pago === "quincenal" ||
    ciclo.cliente?.esquema_pago === "dos_pagos" ||
    Boolean(ciclo.cliente?.dia_corte_pago_2);

  const cobrado = Number(formData.monto_cobrado) || 0;
  const costo = Number(formData.costo_operativo) || 0;
  const margen = cobrado - costo;
  const rentabilidad = cobrado > 0 ? Math.round((margen / cobrado) * 100) : 0;

  const handleFileUpload = async (file, targetField) => {
    if (!file || !ciclo?.id) return;
    const isFirst = targetField === "comprobante_url";
    if (isFirst) setUploadingReceipt1(true);
    else setUploadingReceipt2(true);

    try {
      const res = await uploadComprobanteAdmin({ file, cicloId: ciclo.id });
      if (res.success && res.publicUrl) {
        setFormData((prev) => ({ ...prev, [targetField]: res.publicUrl }));
        toast.success(`Comprobante subido a Cloudflare R2 con éxito`);
      } else {
        toast.error(res.error || "No se pudo subir el comprobante");
      }
    } catch (err) {
      toast.error(err.message || "Error al subir archivo");
    } finally {
      if (isFirst) setUploadingReceipt1(false);
      else setUploadingReceipt2(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateCicloFinanzas(ciclo.id, {
      monto_cobrado: cobrado,
      costo_operativo: costo,
      estado_pago: formData.estado_pago,
      fecha_pago: formData.fecha_pago || null,
      comprobante_url: formData.comprobante_url || null,
      comprobante_2_url: formData.comprobante_2_url || null,
      comprobante_en_revision: false
    });

    setLoading(false);

    if (res.success) {
      toast.success("Finanzas del ciclo actualizadas correctamente.");
      if (onUpdated) onUpdated(res.data);
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar las finanzas.");
    }
  };

  const handleConfirmResetCosts = async () => {
    setIsDeleting(true);
    const res = await updateCicloFinanzas(ciclo.id, {
      costo_operativo: 0,
      comprobante_url: null,
      comprobante_2_url: null,
      comprobante_en_revision: false
    });
    setIsDeleting(false);
    if (res.success) {
      toast.success("Costos operativos y comprobantes restablecidos.");
      setFormData((prev) => ({
        ...prev,
        costo_operativo: 0,
        comprobante_url: "",
        comprobante_2_url: ""
      }));
      if (onUpdated) onUpdated(res.data);
      setShowDeleteConfirm(false);
    } else {
      toast.error(res.error || "No se pudieron restablecer los costos.");
    }
  };

  const resetCostsButton =
    costo > 0 || Boolean(formData.comprobante_url) || Boolean(formData.comprobante_2_url) ? (
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading || isDeleting}
        className="h-11 px-4 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-sora font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        title="Eliminar costos registrados y comprobantes"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Restablecer Costos</span>
      </button>
    ) : null;

  return (
    <>
      <BaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        className="h-[95vh] max-h-[95vh]"
        bodyClassName="max-h-none flex-1 overflow-y-auto min-h-0"
        eyebrow="FINANZAS Y CONTROL"
        eyebrowColor="text-brand-magenta"
        icon={DollarSign}
        title="Finanzas del Ciclo"
        description={clienteNombre ? `Cliente: ${clienteNombre}` : undefined}
        maxWidth="max-w-md"
        cancelText="Cancelar"
        submitText="Guardar Finanzas"
        loadingText="Guardando..."
        isLoading={loading}
        submitButtonClass="bg-[#188ff0] hover:bg-blue-600 text-white shadow-md shadow-blue-200 active:scale-[0.98] transition-all"
        footerExtra={resetCostsButton}
      >
        <div className="space-y-4">
          {/* Card de Margen en Vivo */}
          <FinanceMarginSummaryCard margen={margen} rentabilidad={rentabilidad} />

          {/* Formulario de Montos y Fechas */}
          <FinanceAmountsFormFields
            formData={formData}
            isDosPagos={isDosPagos}
            onChangeField={(field, val) => setFormData((prev) => ({ ...prev, [field]: val }))}
          />

          {/* Comprobante 1er Pago / Único */}
          <ReceiptUploaderField
            label={isDosPagos ? "Comprobante 1er Pago" : "Comprobante de Pago"}
            value={formData.comprobante_url}
            isUploading={uploadingReceipt1}
            accentColor="text-brand-blue"
            buttonHoverBorder="hover:border-brand-blue"
            spinnerColor="text-brand-blue"
            onChange={(val) => setFormData((prev) => ({ ...prev, comprobante_url: val }))}
            onUpload={(file) => handleFileUpload(file, "comprobante_url")}
            onClear={() => setFormData((prev) => ({ ...prev, comprobante_url: "" }))}
          />

          {/* Comprobante 2do Pago (si aplica) */}
          {isDosPagos && (
            <ReceiptUploaderField
              label="Comprobante 2do Pago"
              value={formData.comprobante_2_url}
              isUploading={uploadingReceipt2}
              accentColor="text-brand-magenta"
              buttonHoverBorder="hover:border-brand-magenta"
              spinnerColor="text-brand-magenta"
              onChange={(val) => setFormData((prev) => ({ ...prev, comprobante_2_url: val }))}
              onUpload={(file) => handleFileUpload(file, "comprobante_2_url")}
              onClear={() => setFormData((prev) => ({ ...prev, comprobante_2_url: "" }))}
            />
          )}
        </div>
      </BaseFormModal>

      {/* Modal de Confirmación Clínico para Eliminar/Restablecer Costos */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title="¿Restablecer costos operativos?"
        message={`Esta acción eliminará el costo operativo y los enlaces de comprobantes del ciclo de "${clienteNombre}". El costo se fijará en $0.`}
        confirmText="Restablecer a $0"
        isProcessing={isDeleting}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmResetCosts}
      />
    </>
  );
}
