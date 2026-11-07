import { DollarSign, TrendingUp, CheckCircle2, Calendar } from "lucide-react";

/**
 * FinanceAmountsFormFields
 * Subcomponente para los inputs de montos cobrado/costo y estado/fecha de pago.
 */
export default function FinanceAmountsFormFields({
  formData,
  isDosPagos,
  onChangeField
}) {
  return (
    <>
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
            onChange={(e) => onChangeField("monto_cobrado", e.target.value)}
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
            onChange={(e) => onChangeField("costo_operativo", e.target.value)}
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
            onChange={(e) => onChangeField("estado_pago", e.target.value)}
            className="w-full text-xs font-inter bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer font-sora font-semibold"
          >
            <option value="pendiente">Pendiente</option>
            {isDosPagos && <option value="primer_pago">1er Abono (50%)</option>}
            <option value="pagado">{isDosPagos ? "Pagado Completo" : "Pagado"}</option>
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
            onChange={(e) => onChangeField("fecha_pago", e.target.value)}
            className="w-full text-sm font-inter bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
          />
        </div>
      </div>
    </>
  );
}

