import { Sparkles, TrendingUp, Zap, Camera, CheckCircle2, Film } from "lucide-react";
import ProposalCalculatorSummary from "./ProposalCalculatorSummary";
import ProposalAddonCard from "./ProposalAddonCard";

const ICON_MAP = { Sparkles, TrendingUp, Zap };

/**
 * ProposalCalculatorSection
 * Interactive pricing plan selector, dynamic session scope, and addon modules calculator.
 */
export default function ProposalCalculatorSection({
  pricingPlans = [],
  addons = [],
  selectedPlan,
  setSelectedPlan,
  selectedAddons = {},
  toggleAddon,
  setRadioAddon,
  basePrice = 0,
  totalPrice = 0,
  extraSessionsCount = 0,
  setExtraSessionsCount,
  precioSesionExtra = 3500,
  baseShoots = 2,
  showMobileBreakdown = false,
  setShowMobileBreakdown,
  onAcceptProposal
}) {
  const currentPlanObj = pricingPlans.find((p) => p.id === selectedPlan) || pricingPlans[0];

  return (
    <section id="pricing" className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full font-inter">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight font-sora">
          Arma tu Estrategia
        </h2>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          Selecciona el plan base, ajusta la frecuencia de rodaje y agrega los módulos estratégicos para tu marca.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Selection Area */}
        <div className="w-full lg:w-2/3 space-y-10">
          {/* Step 1: Base Plans */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-100 text-pink-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-sora">Selecciona tu Plan Base</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pricingPlans.map((plan) => {
                const IconComp = ICON_MAP[plan.iconName] || Sparkles;
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 flex flex-col h-full ${
                      isSelected
                        ? "bg-pink-50 border-2 border-pink-500 shadow-lg shadow-pink-100 -translate-y-1"
                        : "bg-white border-2 border-gray-100 shadow-sm hover:border-pink-200 hover:shadow-md"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-3 rounded-full shadow-md uppercase tracking-wider">
                        Recomendado
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-tight font-sora">{plan.name}</h4>
                        <span className="text-xs text-gray-500 font-medium">{plan.subtitle}</span>
                      </div>
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-pink-100" : "bg-gray-50"}`}>
                        <IconComp className="w-6 h-6 text-pink-500" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-black text-gray-900 font-sora">{plan.priceLabel}</span>
                      <span className="text-sm text-gray-500 font-medium ml-1">{plan.period}</span>
                    </div>

                    <div className="flex-grow flex flex-col">
                      <div
                        className={`flex items-center gap-2 mb-3 p-2.5 rounded-xl font-bold text-sm ${
                          isSelected ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        {plan.reels} Reels / mes
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-pink-500 bg-pink-500" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Alcance Operativo & Sesiones de Filmación */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 text-[#188ff0] font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 font-sora">Sesiones de Filmación Mensuales</h3>
                <p className="text-sm text-gray-500">Configura la cobertura presencial para producción de contenido</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#188ff0] flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900 font-sora">
                        {baseShoots + extraSessionsCount} {baseShoots + extraSessionsCount === 1 ? "Sesión al mes" : "Sesiones al mes"}
                      </h4>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-blue border border-blue-100">
                        {baseShoots} {baseShoots === 1 ? "incluida" : "incluidas"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Cada sesión rinde para tu lote de reels pactado. Puedes sumar jornadas adicionales (+${precioSesionExtra.toLocaleString("es-MX")} MXN c/u).
                    </p>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2.5 bg-gray-50 p-1.5 rounded-full border border-gray-200 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={extraSessionsCount <= 0}
                    onClick={() => setExtraSessionsCount?.(Math.max(0, extraSessionsCount - 1))}
                    className="w-8 h-8 rounded-full bg-white text-gray-700 shadow-2xs hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center font-bold font-sora text-sm cursor-pointer transition-all active:scale-95"
                    title="Restar sesión extra"
                  >
                    -
                  </button>
                  <span className="font-sora font-extrabold text-xs min-w-16 text-center text-gray-900">
                    {extraSessionsCount > 0 ? `+${extraSessionsCount} extra` : "Base"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraSessionsCount?.(extraSessionsCount + 1)}
                    className="w-8 h-8 rounded-full bg-white text-gray-700 shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold font-sora text-sm cursor-pointer transition-all active:scale-95"
                    title="Agregar sesión extra"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Add-ons */}
          {addons.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-100 text-pink-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-sora">Módulos Adicionales</h3>
                  <p className="text-sm text-gray-500">Personaliza y potencia tu estrategia (Opcional)</p>
                </div>
              </div>

              <div className="space-y-4">
                {addons.map((addon) => (
                  <ProposalAddonCard
                    key={addon.id}
                    addon={addon}
                    selectedAddons={selectedAddons}
                    toggleAddon={toggleAddon}
                    setRadioAddon={setRadioAddon}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column Summary Component */}
        <ProposalCalculatorSummary
          currentPlanObj={currentPlanObj}
          basePrice={basePrice}
          selectedAddons={selectedAddons}
          addons={addons}
          extraSessionsCount={extraSessionsCount}
          precioSesionExtra={precioSesionExtra}
          totalPrice={totalPrice}
          showMobileBreakdown={showMobileBreakdown}
          setShowMobileBreakdown={setShowMobileBreakdown}
          onAcceptProposal={onAcceptProposal}
        />
      </div>
    </section>
  );
}
