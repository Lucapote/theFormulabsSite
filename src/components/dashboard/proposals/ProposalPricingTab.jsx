import { DollarSign, Film } from "lucide-react";

/**
 * ProposalPricingTab
 * Tab 2 form inputs for base pricing plans, addon module prices, and operational scope.
 */
export default function ProposalPricingTab({
  priceEsencial,
  setPriceEsencial,
  priceCrecimiento,
  setPriceCrecimiento,
  priceEscala,
  setPriceEscala,
  pricePauMarca,
  setPricePauMarca,
  pricePauCreadora,
  setPricePauCreadora,
  priceManejoRedes,
  setPriceManejoRedes,
  priceMetaAds,
  setPriceMetaAds,
  produccionesPorMes = 2,
  setProduccionesPorMes,
  precioSesionExtra = 3500,
  setPrecioSesionExtra,
  tipoSesionDefault = "reels_batch",
  setTipoSesionDefault,
  extraSessionsCount = 0,
  setExtraSessionsCount
}) {
  const numBasePrice = Number(priceCrecimiento) || 0;
  const numExtraSessions = Number(extraSessionsCount) || 0;
  const numPrecioExtra = Number(precioSesionExtra) || 0;
  const finalCalculatedPrice = numBasePrice + (numExtraSessions * numPrecioExtra);

  return (
    <div className="space-y-6 font-inter">
      {/* Base Plans Pricing */}
      <div>
        <h4 className="text-xs font-sora font-extrabold text-brand-magenta uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Planes Base de Producción
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Esencial (8 Reels)", val: priceEsencial, set: setPriceEsencial, bg: "bg-pink-50/30", focus: "focus:border-brand-magenta" },
            { label: "Crecimiento (12 Reels)", val: priceCrecimiento, set: setPriceCrecimiento, bg: "bg-blue-50/30", focus: "focus:border-brand-blue" },
            { label: "Escala (16 Reels)", val: priceEscala, set: setPriceEscala, bg: "bg-purple-50/30", focus: "focus:border-purple-500" }
          ].map((plan) => (
            <div key={plan.label} className={`p-4 rounded-2xl border border-gray-100 ${plan.bg}`}>
              <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
                {plan.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  value={plan.val}
                  onChange={(e) => plan.set(e.target.value)}
                  className={`w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold ${plan.focus} outline-none bg-white`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Addons Pricing */}
      <div>
        <h4 className="text-xs font-sora font-extrabold text-brand-blue uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Módulos Complementarios (Addons)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Pau a Cámara (Marca)", val: pricePauMarca, set: setPricePauMarca },
            { label: "Pau a Cámara (Creadora)", val: pricePauCreadora, set: setPricePauCreadora },
            { label: "Gestión / Publicación Redes", val: priceManejoRedes, set: setPriceManejoRedes },
            { label: "Gestión Meta Ads (Trafficker)", val: priceMetaAds, set: setPriceMetaAds }
          ].map((addon) => (
            <div key={addon.label} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
              <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
                {addon.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  value={addon.val}
                  onChange={(e) => addon.set(e.target.value)}
                  className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control de Sesiones de Producción & Alcance Operativo */}
      <div>
        <h4 className="text-xs font-sora font-extrabold text-brand-blue uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Film className="w-4 h-4" /> Control de Sesiones de Producción
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Sesiones Incluidas al Mes
            </label>
            <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-gray-200">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setProduccionesPorMes?.(num)}
                  className={`h-7 rounded-lg text-[11px] font-sora font-bold transition-all cursor-pointer ${
                    Number(produccionesPorMes) === num
                      ? "bg-brand-blue text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {num} {num === 1 ? "sesión" : "sesiones"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Precio Unitario por Sesión Adicional ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={precioSesionExtra}
                onChange={(e) => setPrecioSesionExtra?.(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Tipo de Rodaje Base
            </label>
            <select
              value={tipoSesionDefault}
              onChange={(e) => setTipoSesionDefault?.(e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:border-brand-blue outline-none bg-white cursor-pointer"
            >
              <option value="reels_batch">Lote de Reels (Orgánica)</option>
              <option value="organica">Orgánica (4 horas)</option>
              <option value="profesional">Profesional (6 horas)</option>
              <option value="hibrido">Híbrido (Foto + Video)</option>
              <option value="fotos">Solo Fotografía</option>
            </select>
          </div>
        </div>

        {/* Cálculo en Tiempo Real */}
        <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue bg-blue-100/70 px-2 py-0.5 rounded-full">
                Cálculo en Tiempo Real
              </span>
              <span className="text-xs text-gray-500 font-inter">
                precioBase + (sesionesExtras * precioSesionExtra)
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              ${numBasePrice.toLocaleString("es-MX")} base + ({numExtraSessions} extras × ${numPrecioExtra.toLocaleString("es-MX")})
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setExtraSessionsCount?.(Math.max(0, numExtraSessions - 1))}
                className="w-6 h-6 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title="Restar sesión extra"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold text-gray-800 px-1.5 min-w-12 text-center">
                {numExtraSessions > 0 ? `+${numExtraSessions} ext` : "0 ext"}
              </span>
              <button
                type="button"
                onClick={() => setExtraSessionsCount?.(numExtraSessions + 1)}
                className="w-6 h-6 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title="Sumar sesión extra"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">Total Plan</span>
              <span className="text-sm font-sora font-extrabold text-gray-900">
                ${finalCalculatedPrice.toLocaleString("es-MX")} MXN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
