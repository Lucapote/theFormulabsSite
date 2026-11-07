/**
 * FinanceMarginSummaryCard
 * Muestra el margen proyectado en vivo y porcentaje de rentabilidad del ciclo.
 */
export default function FinanceMarginSummaryCard({ margen = 0, rentabilidad = 0 }) {
  return (
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
  );
}

