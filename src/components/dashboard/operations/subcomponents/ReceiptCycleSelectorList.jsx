import { Building } from "lucide-react";
import { formatPrice } from "@/utils/formatters";

/**
 * ReceiptCycleSelectorList
 * Columna lateral con lista interactiva de ciclos pendientes para dictamen.
 */
export default function ReceiptCycleSelectorList({
  pendingCycles = [],
  activeCicloId,
  onSelectCiclo
}) {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-gray-50/70 flex flex-col min-h-0">
      <div className="p-3 border-b border-gray-200 bg-white">
        <span className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider">
          Clientes Pendientes ({pendingCycles.length})
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pendingCycles.map((cicloItem) => {
          const cl = cicloItem.cliente || {};
          const isSelected = activeCicloId === cicloItem.id;
          const itemIsDosPagos = cl.esquema_pago === "dos_pagos";
          const itemTarget =
            itemIsDosPagos && cicloItem.estado_pago === "pendiente"
              ? "1er Abono"
              : "Pago Total";

          return (
            <button
              key={cicloItem.id}
              type="button"
              onClick={() => onSelectCiclo(cicloItem.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? "bg-white border-[#188ff0] shadow-sm ring-1 ring-[#188ff0]/20"
                  : "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-sora font-bold text-xs text-gray-900 line-clamp-1">
                  {cl.nombre || "Cliente sin nombre"}
                </span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-[#188ff0] border border-blue-200 text-[10px] font-mono font-bold">
                  {itemTarget}
                </span>
              </div>
              {cl.empresa && (
                <p className="font-inter text-[11px] text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
                  <Building className="w-3 h-3 text-gray-400 shrink-0" />
                  {cl.empresa}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 pt-1.5 border-t border-gray-100">
                <span>Retainer: {formatPrice(cicloItem.monto_cobrado || cl.monto_retainer || 0)}</span>
                <span className="text-[10px] text-gray-400 uppercase">
                  Ciclo {cicloItem.mes}/{cicloItem.anio}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

