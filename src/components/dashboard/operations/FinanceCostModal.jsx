import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Calendar, Link as LinkIcon, CheckCircle2, Trash2 } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { updateCicloFinanzas } from "@/services/operationsService";
import ConfirmDeleteModal from "@/components/dashboard/common/ConfirmDeleteModal";

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
    comprobante_url: ""
  });

  useEffect(() => {
    if (ciclo) {
      setFormData({
        monto_cobrado: Number(ciclo.monto_cobrado) || 0,
        costo_operativo: Number(ciclo.costo_operativo) || 0,
        estado_pago: ciclo.estado_pago || "pendiente",
        fecha_pago: ciclo.fecha_pago ? ciclo.fecha_pago.slice(0, 10) : "",
        comprobante_url: ciclo.comprobante_url || ""
      });
    }
  }, [ciclo]);

  if (!ciclo) return null;

  const cobrado = Number(formData.monto_cobrado) || 0;
  const costo = Number(formData.costo_operativo) || 0;
  const margen = cobrado - costo;
  const rentabilidad = cobrado > 0 ? Math.round((margen / cobrado) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateCicloFinanzas(ciclo.id, {
      monto_cobrado: cobrado,
      costo_operativo: costo,
      estado_pago: formData.estado_pago,
      fecha_pago: formData.fecha_pago || null,
      comprobante_url: formData.comprobante_url || null
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
      comprobante_url: null
    });
    setIsDeleting(false);
    if (res.success) {
      toast.success("Costos operativos y comprobante restablecidos a $0.");
      setFormData((prev) => ({
        ...prev,
        costo_operativo: 0,
        comprobante_url: ""
      }));
      if (onUpdated) onUpdated(res.data);
      setShowDeleteConfirm(false);
    } else {
      toast.error(res.error || "No se pudieron restablecer los costos.");
    }
  };

  const resetCostsButton = (costo > 0 || Boolean(formData.comprobante_url)) ? (
    <button
      type="button"
      onClick={() => setShowDeleteConfirm(true)}
      disabled={loading || isDeleting}
      className="h-11 px-4 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-sora font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
      title="Eliminar costos registrados y comprobante"
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
        footerExtra={resetCostsButton}
      >
        <div className="space-y-4">
          {/* Card de Margen en Vivo */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sora font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                Margen Neto Proyectado
              </span>
              <span className="text-xl font-sora font-bold text-gray-900 tracking-tight">
                ${margen.toLocaleString("es-MX")} MXN
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-sora font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                Rentabilidad
              </span>
              <span className="text-sm font-sora font-bold text-brand-blue">
                {rentabilidad}%
              </span>
            </div>
          </div>

          {/* Montos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-blue" /> Monto Cobrado
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.monto_cobrado}
                onChange={(e) => setFormData({ ...formData, monto_cobrado: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-magenta" /> Costo Operativo
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.costo_operativo}
                onChange={(e) => setFormData({ ...formData, costo_operativo: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Estado de Pago y Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Estado de Pago
              </label>
              <select
                value={formData.estado_pago}
                onChange={(e) => setFormData({ ...formData, estado_pago: e.target.value })}
                className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer font-sora font-semibold"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" /> Fecha de Pago
              </label>
              <input
                type="date"
                value={formData.fecha_pago}
                onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Comprobante / Factura URL */}
          <div>
            <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-brand-blue" /> URL Comprobante / Factura
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.comprobante_url}
              onChange={(e) => setFormData({ ...formData, comprobante_url: e.target.value })}
              className="w-full text-sm font-inter bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </div>
      </BaseFormModal>

      {/* Modal de Confirmación Clínico para Eliminar/Restablecer Costos */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title="¿Restablecer costos operativos?"
        message={`Esta acción eliminará el costo operativo y el enlace del comprobante del ciclo de "${clienteNombre}". El costo se fijará en $0.`}
        confirmText="Restablecer a $0"
        isProcessing={isDeleting}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmResetCosts}
      />
    </>
  );
}
