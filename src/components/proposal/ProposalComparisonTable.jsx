import { Camera, Share2, CheckCircle2, Instagram } from "lucide-react";

/**
 * ProposalComparisonTable
 * Comparative feature matrix table comparing base plans and addon modules.
 */
export default function ProposalComparisonTable({ pricingPlans = [], addons = [] }) {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full bg-white font-inter">
      <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center mb-10 leading-tight font-sora">
        Resumen Comparativo
      </h2>

      <div className="overflow-x-auto rounded-3xl shadow-xl border border-gray-100 pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-5 font-semibold w-[34%] font-sora">Características y Módulos</th>
              {pricingPlans.map((plan) => (
                <th key={plan.id} className="p-5 font-bold text-center w-[22%] relative">
                  {plan.highlight && <div className="absolute top-0 left-0 w-full h-1 bg-pink-500" />}
                  <span className="block text-lg font-sora">{plan.name}</span>
                  {plan.highlight && (
                    <span className="block text-[11px] text-pink-400 font-bold uppercase tracking-wider mt-1">
                      Recomendado
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100 bg-pink-50/30">
              <td className="p-5 font-semibold flex items-center gap-3">
                <Camera className="w-5 h-5 text-pink-500" /> Reels / mes
              </td>
              {pricingPlans.map((plan) => (
                <td key={`reels-${plan.id}`} className="p-5 text-center font-black text-xl text-gray-900 font-sora">
                  {plan.reels}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-5 font-medium flex items-center gap-3">
                <Share2 className="w-5 h-5 text-gray-400" /> Carruseles / mes
              </td>
              {pricingPlans.map((plan) => (
                <td key={`carousel-${plan.id}`} className="p-5 text-center font-semibold">
                  4
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="p-5 font-medium">Levantamiento (Visitas)</td>
              {pricingPlans.map((plan) => (
                <td key={`visits-${plan.id}`} className="p-5 text-center">
                  2
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-5 font-medium">Banco de fotos & Calendarios</td>
              {pricingPlans.map((plan) => (
                <td key={`assets-${plan.id}`} className="p-5 text-center text-pink-500">
                  <CheckCircle2 className="w-5 h-5 mx-auto" />
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 bg-pink-50/20">
              <td className="p-5 font-medium flex items-center gap-3">
                <Instagram className="w-5 h-5 text-pink-500" /> Colaboración Feed Pau
              </td>
              {pricingPlans.map((plan) => (
                <td key={`feed-colab-${plan.id}`} className="p-5 text-center font-medium">
                  {plan.bonus ? (
                    <span className="inline-flex items-center gap-1.5 bg-pink-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1 Reel Incluido
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Subencabezado para Módulos Adicionales */}
            <tr className="bg-gray-100/90 border-t border-b border-gray-200">
              <td colSpan={pricingPlans.length + 1} className="py-3 px-5 font-bold text-xs text-gray-500 uppercase tracking-wider">
                Módulos Adicionales Opcionales
              </td>
            </tr>

            {/* Filas Dinámicas de Módulos Adicionales */}
            {addons.map((addon) => {
              let badgeText = addon.priceLabel || "";
              if (addon.type === "radio" && addon.options && addon.options.length > 0) {
                badgeText = `Desde ${addon.options[0].priceLabel}`;
              }
              return (
                <tr key={`addon-row-${addon.id}`} className="border-b border-gray-100 bg-white hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 md:p-5 font-medium text-gray-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                      <span>{addon.title}</span>
                    </div>
                  </td>
                  {pricingPlans.map((plan) => (
                    <td key={`addon-col-${addon.id}-${plan.id}`} className="p-4 md:p-5 text-center">
                      <span className="inline-block bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        {badgeText}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr className="bg-gray-50/80 border-t-2 border-gray-200">
              <td className="p-5 font-bold text-gray-900 text-base font-sora">Inversión Base Mensual</td>
              {pricingPlans.map((plan) => (
                <td key={`price-${plan.id}`} className="p-5 text-center font-black text-pink-600 text-lg font-sora">
                  {plan.priceLabel}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
