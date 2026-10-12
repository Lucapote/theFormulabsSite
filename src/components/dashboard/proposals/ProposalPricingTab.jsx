import { DollarSign } from "lucide-react";

/**
 * ProposalPricingTab
 * Tab 2 form inputs for base pricing plans and addon module prices.
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
  setPriceMetaAds
}) {
  return (
    <div className="space-y-6 font-inter">
      {/* Base Plans Pricing */}
      <div>
        <h4 className="text-xs font-sora font-extrabold text-pink-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Planes Base de Producción
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-gray-100 bg-pink-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Esencial (8 Reels)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={priceEsencial}
                onChange={(e) => setPriceEsencial(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-pink-500 outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Crecimiento (12 Reels)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={priceCrecimiento}
                onChange={(e) => setPriceCrecimiento(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-purple-50/30">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Escala (16 Reels)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={priceEscala}
                onChange={(e) => setPriceEscala(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-purple-500 outline-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Addons Pricing */}
      <div>
        <h4 className="text-xs font-sora font-extrabold text-brand-blue uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Módulos Complementarios (Addons)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Pau a Cámara (Marca)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={pricePauMarca}
                onChange={(e) => setPricePauMarca(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Pau a Cámara (Creadora)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={pricePauCreadora}
                onChange={(e) => setPricePauCreadora(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Gestión / Publicación Redes
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={priceManejoRedes}
                onChange={(e) => setPriceManejoRedes(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
            <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">
              Gestión Meta Ads (Trafficker)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
              <input
                type="number"
                value={priceMetaAds}
                onChange={(e) => setPriceMetaAds(e.target.value)}
                className="w-full h-10 pl-7 pr-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-brand-blue outline-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
