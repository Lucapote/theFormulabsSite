import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Calendar, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { updateCicloFinanzas } from "@/services/operationsService";

export default function FinanceCostModal({
  isOpen,
  onClose,
  ciclo,
  clienteNombre = "",
  onUpdated
}) {
  const [loading, setLoading] = useState(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border-gray-100">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="font-sora text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
            Finanzas del Ciclo &mdash; {clienteNombre}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Card de Margen en Vivo */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
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
              <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-blue" /> Monto Cobrado
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.monto_cobrado}
                onChange={(e) => setFormData({ ...formData, monto_cobrado: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-pink-500" /> Costo Operativo
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.costo_operativo}
                onChange={(e) => setFormData({ ...formData, costo_operativo: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Estado de Pago y Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Estado de Pago
              </label>
              <select
                value={formData.estado_pago}
                onChange={(e) => setFormData({ ...formData, estado_pago: e.target.value })}
                className="w-full text-xs font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" /> Fecha de Pago
              </label>
              <input
                type="date"
                value={formData.fecha_pago}
                onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                className="w-full text-sm font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Comprobante / Factura URL */}
          <div>
            <label className="text-xs font-sora font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-brand-blue" /> URL Comprobante / Factura
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.comprobante_url}
              onChange={(e) => setFormData({ ...formData, comprobante_url: e.target.value })}
              className="w-full text-sm font-inter bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <DialogFooter className="pt-2 sm:space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-sora font-bold uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Finanzas"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
