import {
  Sparkles,
  TrendingUp,
  Zap,
  Camera,
  CheckCircle2
} from "lucide-react";
import ProposalCalculatorSummary from "./ProposalCalculatorSummary";

const ICON_MAP = {
  Sparkles,
  TrendingUp,
  Zap
};

/**
 * ProposalCalculatorSection
 * Interactive pricing plan selector and addon modules calculator.
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
  showMobileBreakdown = false,
  setShowMobileBreakdown
}) {
  const currentPlanObj = pricingPlans.find((p) => p.id === selectedPlan) || pricingPlans[0];

  return (
    <section id="pricing" className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full font-inter">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight font-sora">
          Arma tu Estrategia
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Selecciona el plan base y agrega los módulos que mejor se adapten al momento de tu marca.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Selection Area */}
        <div className="w-full lg:w-2/3 space-y-12">
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
                    className={`
                      relative cursor-pointer rounded-3xl p-6 transition-all duration-300 flex flex-col h-full
                      ${
                        isSelected
                          ? "bg-pink-50 border-2 border-pink-500 shadow-lg shadow-pink-100 transform -translate-y-1"
                          : "bg-white border-2 border-gray-100 shadow-sm hover:border-pink-200 hover:shadow-md"
                      }
                    `}
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

                    <div className="mb-5">
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
                      <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>

                      {plan.bonus && (
                        <div className="mt-3 p-2.5 bg-pink-100/70 border border-pink-300 rounded-xl text-xs font-bold text-pink-700 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                          <span>{plan.bonus}</span>
                        </div>
                      )}
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

          {/* Step 2: Add-ons */}
          {addons.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-100 text-pink-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-sora">Módulos Adicionales</h3>
                  <p className="text-sm text-gray-500">Personaliza y potencia tu estrategia (Opcional)</p>
                </div>
              </div>

              <div className="space-y-4">
                {addons.map((addon) => {
                  const isAddonActive =
                    addon.type === "checkbox" ? selectedAddons[addon.id] : Boolean(selectedAddons[addon.id]);
                  return (
                    <div
                      key={addon.id}
                      className={`
                        bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 transition-all duration-300
                        ${
                          isAddonActive
                            ? "border-pink-400 bg-gradient-to-r from-pink-50/50 to-white"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        }
                      `}
                    >
                      {addon.type === "checkbox" ? (
                        <div
                          className="cursor-pointer flex flex-col md:flex-row gap-4 items-start"
                          onClick={() => toggleAddon(addon.id)}
                        >
                          <div className="flex items-start gap-4 flex-grow">
                            <div
                              className={`mt-1 w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                                selectedAddons[addon.id] ? "bg-pink-500 border-pink-500" : "border-gray-300 bg-white"
                              }`}
                            >
                              {selectedAddons[addon.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1 font-sora">{addon.title}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">{addon.description}</p>
                              <span className="inline-block bg-pink-100 text-pink-700 font-bold px-3 py-1 rounded-lg text-sm">
                                {addon.priceLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 font-sora mb-1">{addon.title}</h4>
                          <p className="text-sm text-gray-500 mb-4 font-medium">{addon.description}</p>
                          <div className="space-y-3">
                            {addon.options?.map((opt) => {
                              const isSelected = selectedAddons[addon.id] === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => setRadioAddon(addon.id, opt.id)}
                                  className={`
                                    cursor-pointer p-4 rounded-2xl border-2 transition-all
                                    ${
                                      isSelected
                                        ? "bg-pink-50 border-pink-400 shadow-sm"
                                        : "bg-gray-50 border-transparent hover:bg-gray-100"
                                    }
                                  `}
                                >
                                  <div className="flex items-start gap-4">
                                    <div
                                      className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                        isSelected ? "border-pink-500 bg-pink-500" : "border-gray-400 bg-white"
                                      }`}
                                    >
                                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                                        <span className="font-bold text-gray-900 font-sora">{opt.name}</span>
                                        <span
                                          className={`font-bold text-sm mt-1 md:mt-0 ${
                                            isSelected ? "text-pink-600" : "text-gray-500"
                                          }`}
                                        >
                                          {opt.priceLabel}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 leading-relaxed">{opt.details}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          totalPrice={totalPrice}
          showMobileBreakdown={showMobileBreakdown}
          setShowMobileBreakdown={setShowMobileBreakdown}
        />
      </div>
    </section>
  );
}
