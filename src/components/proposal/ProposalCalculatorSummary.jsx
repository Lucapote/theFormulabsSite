import { Calculator, Download, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/utils/formatters";

/**
 * ProposalCalculatorSummary
 * Displays desktop sticky pricing summary box and mobile floating bar/breakdown.
 */
export default function ProposalCalculatorSummary({
  currentPlanObj,
  basePrice = 0,
  selectedAddons = {},
  addons = [],
  totalPrice = 0,
  showMobileBreakdown = false,
  setShowMobileBreakdown,
  onAcceptProposal
}) {
  const hasAddonsSelected = Object.entries(selectedAddons).some(
    ([_, val]) => val !== false && val !== null
  );

  return (
    <>
      {/* Right Column: Desktop Sticky Summary */}
      <div className="hidden lg:block w-1/3 sticky top-28">
        <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl text-white border border-gray-800">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
            <Calculator className="w-7 h-7 text-pink-400" />
            <h3 className="text-2xl font-bold font-sora">Resumen Mensual</h3>
          </div>

          <div className="space-y-5 mb-8">
            {currentPlanObj && (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Plan Base
                  </p>
                  <p className="font-semibold text-lg">{currentPlanObj.name}</p>
                </div>
                <p className="font-bold text-lg">{formatPrice(basePrice)}</p>
              </div>
            )}

            {hasAddonsSelected && (
              <div className="pt-4 border-t border-gray-800/80 space-y-4">
                <p className="text-xs text-pink-400 font-bold uppercase tracking-wider">
                  Módulos Extra
                </p>
                {addons.map((addon) => {
                  if (addon.type === "checkbox" && selectedAddons[addon.id] && addon.priceValue) {
                    return (
                      <div key={addon.id} className="flex justify-between items-start text-sm">
                        <p className="text-gray-300 pr-4 leading-snug">{addon.title}</p>
                        <p className="font-semibold whitespace-nowrap">{formatPrice(addon.priceValue)}</p>
                      </div>
                    );
                  }
                  if (addon.type === "radio" && selectedAddons[addon.id] && addon.options) {
                    const opt = addon.options.find((o) => o.id === selectedAddons[addon.id]);
                    if (opt) {
                      return (
                        <div key={addon.id} className="flex justify-between items-start text-sm">
                          <p className="text-gray-300 pr-4 leading-snug">{opt.name}</p>
                          <p className="font-semibold whitespace-nowrap">{formatPrice(opt.priceValue)}</p>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-2xl p-5 border border-white/5 space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1 font-medium">Inversión Estimada</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-pink-400 font-sora">
                  {formatPrice(totalPrice)}
                </span>
                <span className="text-gray-400 mb-2 font-semibold">MXN</span>
              </div>
            </div>

            {onAcceptProposal && (
              <button
                type="button"
                onClick={onAcceptProposal}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-5 rounded-full font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aceptar Propuesta
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 px-5 rounded-full font-sora font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF
            </button>

            <p className="text-[11px] text-gray-400 pt-1 leading-tight">
              *Pago mensual por adelantado. Precios no incluyen IVA en caso de requerir factura.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Floating Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 transition-all duration-300">
        <div
          className={`bg-gray-900 border-t border-gray-800 rounded-t-3xl overflow-hidden transition-all duration-500 ease-in-out ${
            showMobileBreakdown ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 pt-8 text-white overflow-y-auto max-h-[60vh]">
            <h4 className="font-bold text-lg mb-4 text-pink-400 border-b border-gray-800 pb-2 font-sora">
              Desglose Mensual
            </h4>
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-gray-300">Plan {currentPlanObj?.name}</span>
              <span className="font-bold">{formatPrice(basePrice)}</span>
            </div>
            {hasAddonsSelected && (
              <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  Módulos Extra
                </p>
                {addons.map((addon) => {
                  if (addon.type === "checkbox" && selectedAddons[addon.id] && addon.priceValue) {
                    return (
                      <div key={addon.id} className="flex justify-between items-start text-sm">
                        <p className="text-gray-400 pr-4">{addon.title}</p>
                        <p className="font-semibold">{formatPrice(addon.priceValue)}</p>
                      </div>
                    );
                  }
                  if (addon.type === "radio" && selectedAddons[addon.id] && addon.options) {
                    const opt = addon.options.find((o) => o.id === selectedAddons[addon.id]);
                    if (opt) {
                      return (
                        <div key={addon.id} className="flex justify-between items-start text-sm">
                          <p className="text-gray-400 pr-4">{opt.name}</p>
                          <p className="font-semibold">{formatPrice(opt.priceValue)}</p>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-6 text-center">*Precios no incluyen IVA.</p>
          </div>
        </div>

        <div
          className="bg-gray-900 text-white p-4 pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative cursor-pointer"
          onClick={() => setShowMobileBreakdown(!showMobileBreakdown)}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 rounded-t-xl px-4 py-1 flex items-center justify-center">
            {showMobileBreakdown ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div>
            <p className="text-[11px] text-pink-400 font-bold uppercase tracking-wider mb-0.5">
              Inversión Estimada
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-sora">{formatPrice(totalPrice)}</span>
              <span className="text-xs font-semibold text-gray-400">MXN</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAcceptProposal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcceptProposal();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-full font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aceptar
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.print();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-full font-sora font-semibold text-xs shadow-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
