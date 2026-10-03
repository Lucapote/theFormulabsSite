import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Zap,
  Camera,
  Share2,
  Mail,
  Phone,
  Info,
  Calculator,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Download
} from "lucide-react";
import { PROPOSAL_DATA as defaultData } from "@/data/proposalData";
import { formatPrice } from "@/utils/formatters";

const ICON_MAP = {
  Sparkles,
  TrendingUp,
  Zap
};

const Instagram = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Section = ({ children, className = "", id = "" }) => (
  <section id={id} className={`py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto w-full ${className}`}>
    {children}
  </section>
);

const Heading = ({ children, className = "" }) => (
  <h2 className={`text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight ${className}`}>
    {children}
  </h2>
);

const Subtext = ({ children, className = "" }) => (
  <p className={`text-lg text-gray-600 leading-relaxed ${className}`}>
    {children}
  </p>
);

export default function ProposalView({ data = defaultData }) {
  const proposal = data || defaultData;
  const clientInfo = proposal.client || {};
  const baseFeatures = proposal.baseFeatures || [];
  const pricingPlans = proposal.pricingPlans || [];
  const addons = proposal.addons || [];
  const whyUs = proposal.whyUs || [];
  const conditions = proposal.conditions || [];
  const contact = proposal.contact || {};

  const clientData = {
    name: clientInfo.name || "Cliente Estimado",
    shortName: clientInfo.shortName || clientInfo.name || "Cliente",
    proposalTitle: clientInfo.proposalTitle || "Propuesta de Contenido",
    logoUrl: clientInfo.logoUrl || "/logo.png",
    greeting: clientInfo.greeting || "Te presentamos nuestra propuesta estratégica personalizada.",
    vision: clientInfo.vision || "Diseñamos una fórmula a medida para escalar la presencia de tu marca."
  };

  const [showSecondText, setShowSecondText] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecondText(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1]?.id || pricingPlans[0]?.id || "crecimiento");
  const [selectedAddons, setSelectedAddons] = useState({});
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const setRadioAddon = (addonId, optionId) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: prev[addonId] === optionId ? null : optionId
    }));
  };

  const currentPlanObj = pricingPlans.find((p) => p.id === selectedPlan) || pricingPlans[0];
  const basePrice = currentPlanObj?.price || 0;
  let addonsPrice = 0;

  addons.forEach((addon) => {
    if (addon.type === "checkbox" && selectedAddons[addon.id] && addon.priceValue) {
      addonsPrice += addon.priceValue;
    } else if (addon.type === "radio" && selectedAddons[addon.id] && addon.options) {
      const selectedOption = addon.options.find((opt) => opt.id === selectedAddons[addon.id]);
      if (selectedOption) addonsPrice += selectedOption.priceValue;
    }
  });

  const totalPrice = basePrice + addonsPrice;

  const selectedAddonList = [];
  addons.forEach((addon) => {
    if (addon.type === "checkbox" && selectedAddons[addon.id] && addon.priceValue) {
      selectedAddonList.push({
        title: addon.title,
        price: addon.priceValue,
        priceLabel: addon.priceLabel
      });
    } else if (addon.type === "radio" && selectedAddons[addon.id] && addon.options) {
      const opt = addon.options.find((o) => o.id === selectedAddons[addon.id]);
      if (opt) {
        selectedAddonList.push({
          title: `${addon.title} (${opt.name})`,
          price: opt.priceValue,
          priceLabel: opt.priceLabel
        });
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-gray-900 font-sans selection:bg-[#ef18d6]/20 selection:text-[#ef18d6] pb-24 md:pb-0 relative scroll-smooth">
      {/* VISTA WEB INTERACTIVA */}
      <div className="screen-only">
        <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent -z-10 pointer-events-none" />

        {/* Navigation Header */}
        <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex justify-between items-center">
            <img
              src={clientData.logoUrl}
              alt="The Formulab Logo"
              className="h-8 md:h-10 object-contain"
              onError={(e) => {
                const target = e.target;
                target.onerror = null;
                target.outerHTML = '<div class="font-black text-xl tracking-tighter flex items-center">the <span class="text-pink-500 ml-1">formu</span>lab</div>';
              }}
            />
            <span className="text-sm font-semibold text-brand-blue bg-brand-blue-50 border border-brand-blue-200 px-3 py-1.5 rounded-full hidden md:inline-block">
              Propuesta para {clientData.shortName}
            </span>
          </div>
        </nav>

        {/* Hero Header */}
        <Section className="!pt-12 md:!pt-20">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

            <p className="text-pink-500 font-bold tracking-widest uppercase text-sm mb-4">{clientData.proposalTitle}</p>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight font-sora">
              Hola, <span className="text-brand-blue font-sora">{clientData.name}</span>
            </h1>

            <div className="space-y-6">
              <Subtext className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                {clientData.greeting}
              </Subtext>

              <div className={`h-1 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full transition-all duration-700 ease-out ${showSecondText ? "w-20 opacity-100" : "w-0 opacity-0"}`} />

              <div className={`grid transition-all duration-1000 ease-in-out ${showSecondText ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <Subtext className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed pt-1">
                    {clientData.vision}
                  </Subtext>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Base Included Features */}
        <Section className="bg-gray-900 text-white rounded-[2rem] md:rounded-[3rem] !my-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-sora">La Base Estratégica</h2>
              <p className="text-gray-400 text-lg">Todos nuestros paquetes integran una base mensual sólida, diseñada para mantener tu marca relevante y estéticamente impecable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {baseFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-pink-400 shrink-0" />
                  <p className="text-white font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Interactive Pricing Calculator */}
        <Section id="pricing">
          <div className="text-center mb-12">
            <Heading>Arma tu Estrategia</Heading>
            <Subtext>Selecciona el plan base y agrega los módulos que mejor se adapten al momento de tu marca.</Subtext>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left Column: Selection Area */}
            <div className="w-full lg:w-2/3 space-y-12">
              {/* Step 1: Base Plans */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-pink-100 text-pink-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
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
                          ${isSelected ? "bg-pink-50 border-2 border-pink-500 shadow-lg shadow-pink-100 transform -translate-y-1" : "bg-white border-2 border-gray-100 shadow-sm hover:border-pink-200 hover:shadow-md"}
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
                          <div className={`flex items-center gap-2 mb-3 p-2.5 rounded-xl font-bold text-sm ${isSelected ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                            <Camera className="w-4 h-4" />
                            {plan.reels} Reels / mes
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {plan.description}
                          </p>

                          {plan.bonus && (
                            <div className="mt-3 p-2.5 bg-pink-100/70 border border-pink-300 rounded-xl text-xs font-bold text-pink-700 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                              <span>{plan.bonus}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex justify-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-pink-500 bg-pink-500" : "border-gray-300"}`}>
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
                    <div className="bg-pink-100 text-pink-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 font-sora">Módulos Adicionales</h3>
                      <p className="text-sm text-gray-500">Personaliza y potencia tu estrategia (Opcional)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {addons.map((addon) => {
                      const isAddonActive = addon.type === "checkbox" ? selectedAddons[addon.id] : Boolean(selectedAddons[addon.id]);
                      return (
                        <div
                          key={addon.id}
                          className={`
                            bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 transition-all duration-300
                            ${isAddonActive ? "border-pink-400 bg-gradient-to-r from-pink-50/50 to-white" : "border-gray-100 hover:border-gray-200 hover:shadow-md"}
                          `}
                        >
                          {addon.type === "checkbox" ? (
                            <div className="cursor-pointer flex flex-col md:flex-row gap-4 items-start" onClick={() => toggleAddon(addon.id)}>
                              <div className="flex items-start gap-4 flex-grow">
                                <div className={`mt-1 w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${selectedAddons[addon.id] ? "bg-pink-500 border-pink-500" : "border-gray-300 bg-white"}`}>
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
                                        ${isSelected ? "bg-pink-50 border-pink-400 shadow-sm" : "bg-gray-50 border-transparent hover:bg-gray-100"}
                                      `}
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${isSelected ? "border-pink-500 bg-pink-500" : "border-gray-400 bg-white"}`}>
                                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div className="flex-grow">
                                          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                                            <span className="font-bold text-gray-900 font-sora">{opt.name}</span>
                                            <span className={`font-bold text-sm mt-1 md:mt-0 ${isSelected ? "text-pink-600" : "text-gray-500"}`}>{opt.priceLabel}</span>
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
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Plan Base</p>
                        <p className="font-semibold text-lg">{currentPlanObj.name}</p>
                      </div>
                      <p className="font-bold text-lg">{formatPrice(basePrice)}</p>
                    </div>
                  )}

                  {Object.entries(selectedAddons).some(([_, val]) => val !== false && val !== null) && (
                    <div className="pt-4 border-t border-gray-800/80 space-y-4">
                      <p className="text-xs text-pink-400 font-bold uppercase tracking-wider">Módulos Extra</p>
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

                <div className="bg-white/10 rounded-2xl p-5 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1 font-medium">Inversión Estimada</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-pink-400 font-sora">{formatPrice(totalPrice)}</span>
                    <span className="text-gray-400 mb-2 font-semibold">MXN</span>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full mt-4 bg-brand-blue hover:bg-[#147bd0] text-white py-2.5 px-5 rounded-full font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>

                  <p className="text-[11px] text-gray-400 mt-4 leading-tight">*Pago mensual por adelantado. Precios no incluyen IVA en caso de requerir factura.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Resumen Comparativo entre Planes */}
        <Section className="bg-white">
          <Heading className="text-center mb-10">Resumen Comparativo</Heading>
          <div className="overflow-x-auto rounded-3xl shadow-xl border border-gray-100 pb-2">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-5 font-semibold w-[34%]">Características y Módulos</th>
                  {pricingPlans.map((plan) => (
                    <th key={plan.id} className="p-5 font-bold text-center w-[22%] relative">
                      {plan.highlight && <div className="absolute top-0 left-0 w-full h-1 bg-pink-500" />}
                      <span className="block text-lg font-sora">{plan.name}</span>
                      {plan.highlight && <span className="block text-[11px] text-pink-400 font-bold uppercase tracking-wider mt-1">Recomendado</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100 bg-pink-50/30">
                  <td className="p-5 font-semibold flex items-center gap-3"><Camera className="w-5 h-5 text-pink-500" /> Reels / mes</td>
                  {pricingPlans.map((plan) => (
                    <td key={`reels-${plan.id}`} className="p-5 text-center font-black text-xl text-gray-900 font-sora">{plan.reels}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-medium flex items-center gap-3"><Share2 className="w-5 h-5 text-gray-400" /> Carruseles / mes</td>
                  {pricingPlans.map((plan) => (
                    <td key={`carousel-${plan.id}`} className="p-5 text-center font-semibold">4</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="p-5 font-medium">Levantamiento (Visitas)</td>
                  {pricingPlans.map((plan) => (
                    <td key={`visits-${plan.id}`} className="p-5 text-center">2</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-medium">Banco de fotos & Calendarios</td>
                  {pricingPlans.map((plan) => (
                    <td key={`assets-${plan.id}`} className="p-5 text-center text-pink-500"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 bg-pink-50/20">
                  <td className="p-5 font-medium flex items-center gap-3"><Instagram className="w-5 h-5 text-pink-500" /> Colaboración Feed Pau</td>
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
                    <td key={`price-${plan.id}`} className="p-5 text-center font-black text-pink-600 text-lg font-sora">{plan.priceLabel}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Why Us & Conditions */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <HeartHandshake className="w-8 h-8 text-pink-500" />
                <Heading className="!mb-0">¿Por qué nosotros?</Heading>
              </div>
              <div className="space-y-6">
                {whyUs.map((reason, idx) => (
                  <div key={idx} className="flex items-start bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-pink-100 p-2 rounded-xl mr-4 shrink-0">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed mt-1">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <Info className="w-8 h-8 text-gray-400" />
                <Heading className="!mb-0">Condiciones</Heading>
              </div>
              <div className="bg-gray-100 p-8 md:p-10 rounded-[2rem] h-full border border-gray-200">
                <ul className="space-y-5">
                  {conditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <span className="text-pink-500 mr-3 font-bold text-lg mt-0.5">•</span>
                      <span className="leading-relaxed font-medium">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer / Contact Section */}
        <Section className="text-center pb-32 lg:pb-24">
          <div className="max-w-3xl mx-auto">
            <Heading>¿Listos para empezar?</Heading>
            <Subtext className="mb-10">No hay prisa por decidir, preferimos que elijan el paquete que de verdad tenga sentido para su marca en este momento. Si tienen dudas, aquí estamos.</Subtext>

            <div className="bg-gray-900 text-white rounded-[2rem] p-10 md:p-12 shadow-2xl relative overflow-hidden inline-block w-full">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-[80px] pointer-events-none" />

              <h3 className="text-3xl font-bold mb-2 relative z-10 font-sora">{contact.name || "The Formulab"}</h3>
              <p className="text-pink-400 font-bold tracking-widest uppercase text-xs mb-8 relative z-10">{contact.title || "Dirección de Estrategia"}</p>

              <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-gray-300 relative z-10">
                {contact.phone && (
                  <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full">
                    <Phone className="w-4 h-4 mr-2 text-pink-400" />
                    <span className="font-medium text-sm">{contact.phone}</span>
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full">
                    <Mail className="w-4 h-4 mr-2 text-pink-400" />
                    <span className="font-medium text-sm">{contact.email}</span>
                  </a>
                )}
                {contact.instagram && (
                  <a href={`https://instagram.com/${contact.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full">
                    <Instagram className="w-4 h-4 mr-2 text-pink-400" />
                    <span className="font-medium text-sm">{contact.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Mobile Floating Sticky Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 transition-all duration-300">
          <div className={`bg-gray-900 border-t border-gray-800 rounded-t-3xl overflow-hidden transition-all duration-500 ease-in-out ${showMobileBreakdown ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="p-6 pt-8 text-white overflow-y-auto max-h-[60vh]">
              <h4 className="font-bold text-lg mb-4 text-pink-400 border-b border-gray-800 pb-2 font-sora">Desglose Mensual</h4>
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="text-gray-300">Plan {currentPlanObj?.name}</span>
                <span className="font-bold">{formatPrice(basePrice)}</span>
              </div>
              {Object.entries(selectedAddons).some(([_, val]) => val !== false && val !== null) && (
                <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-3">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Módulos Extra</p>
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
              {showMobileBreakdown ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
            </div>

            <div>
              <p className="text-[11px] text-pink-400 font-bold uppercase tracking-wider mb-0.5">Inversión Estimada</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-sora">{formatPrice(totalPrice)}</span>
                <span className="text-xs font-semibold text-gray-400">MXN</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.print();
                }}
                className="bg-brand-blue hover:bg-[#147bd0] text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-colors flex items-center gap-2">
                Ver Detalle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* INFORME DE RESULTADO DE LABORATORIO (ESTILO CLÍNICO MINIMALISTA - IMPRESIÓN/PDF) */}
      {/* ============================================================================== */}
      <div id="lab-result-pdf-report" className="print-only font-sans text-gray-800 bg-white p-6 max-w-4xl mx-auto">
        {/* ENCABEZADO DE LABORATORIO */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <img
              src={clientData.logoUrl || "/logo.png"}
              alt="The Formulab Logo"
              className="h-12 object-contain mb-1"
              onError={(e) => {
                const target = e.target;
                target.onerror = null;
                target.outerHTML = '<div class="font-black text-2xl tracking-tighter text-gray-900">the <span class="text-pink-500">formu</span>lab</div>';
              }}
            />
          </div>
          <div className="text-right text-[11px] text-gray-500 leading-tight space-y-0.5">
            <p>Hora de la propuesta: <span className="text-gray-800 font-semibold">{new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span></p>
            <p>Fecha de propuesta: <span className="text-gray-800 font-semibold">{new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span></p>
            <p>Quien reporta: <span className="text-gray-800 font-semibold">{(contact.name || "The Formulab").toUpperCase()}</span></p>
            <p>Fecha del reporte: <span className="text-gray-800 font-semibold">{new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></p>
            <p>Vigencia: <span className="text-gray-800 font-semibold">15 Días Naturales</span></p>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL CON LÍNEA DOBLE */}
        <div className="border-b-2 border-gray-400 pb-1 mb-3">
          <h1 className="text-xl font-bold text-gray-700 tracking-tight text-center font-sora">
            Exámenes Laboratorio Clínico de Resultados y Diagnóstico
          </h1>
        </div>

        {/* METADATOS DEL CLIENTE / FICHA DE PACIENTE */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-700 mb-4 pb-2 border-b border-gray-400">
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-500 font-semibold">Paciente / Cliente:</span>
            <span className="font-bold text-gray-900 uppercase">{clientData.name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-500 font-semibold">RUT / ID:</span>
            <span className="font-bold text-gray-900">2475317236</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-500 font-semibold">Fecha de Solicitud:</span>
            <span className="font-bold text-gray-900">{new Date().toLocaleDateString("es-MX")}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-500 font-semibold">Dirección Creativa:</span>
            <span className="font-bold text-gray-900">{contact.name || "The Formulab"}</span>
          </div>

          <div className="flex justify-between pb-1">
            <span className="text-gray-500 font-semibold">Nº Historia / Folio:</span>
            <span className="font-bold text-gray-900">0036331</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-gray-500 font-semibold">Plan Solicitado:</span>
            <span className="font-bold text-gray-900 uppercase">Plan {currentPlanObj?.name || "SELECCIONADO"}</span>
          </div>
        </div>

        {/* TABLA DE RESULTADOS CLINICOS */}
        <table className="w-full text-xs border-collapse mb-3">
          <thead>
            <tr className="border-b-2 border-gray-400 text-gray-700 font-bold">
              <th className="py-1 text-left w-[45%]">Analito</th>
              <th className="py-1 text-center w-[30%]">Resultado</th>
              <th className="py-1 text-right w-[25%]">Valores de referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {/* SECCIÓN 1: FÓRMULA Y BIOMETRÍA DE CONTENIDO */}
            <tr>
              <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px]">
                FÓRMULA Y BIOMETRÍA DE CONTENIDO BASE ({(currentPlanObj?.name || "BASE")?.toUpperCase()})
              </td>
            </tr>

            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">REELS ORGÁNICOS (VERTICAL 9:16)</td>
              <td className="py-1 text-center font-bold text-gray-900">{currentPlanObj?.reels || 10}.00 x 10</td>
              <td className="py-1 text-right text-gray-500">5.00 - 12.00 Piezas</td>
            </tr>
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">CARRUSELES ESTRATÉGICOS</td>
              <td className="py-1 text-center font-bold text-gray-900">4.00 Piezas</td>
              <td className="py-1 text-right text-gray-500">4.00 Piezas / mes</td>
            </tr>
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">LEVANAMIENTO DE MUESTRA (VISITAS)</td>
              <td className="py-1 text-center font-bold text-gray-900">2.00 Visitas</td>
              <td className="py-1 text-right text-gray-500">2.00 Visitas / mes</td>
            </tr>
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">BANCO DE FOTOS Y CALENDARIOS</td>
              <td className="py-1 text-center font-bold text-gray-900">100.00 %</td>
              <td className="py-1 text-right text-gray-500">100.00 %</td>
            </tr>
            {currentPlanObj?.bonus && (
              <tr>
                <td className="py-1 pl-3 font-semibold italic text-gray-900">COLABORACIÓN FEED @PAUTHECREATIVE</td>
                <td className="py-1 text-center font-bold text-gray-900">1.00 Reel Incluido</td>
                <td className="py-1 text-right text-gray-700 font-semibold">Bonus Plan</td>
              </tr>
            )}

            <tr>
              <td colSpan={3} className="py-1 text-[10px] text-gray-500 italic">
                Tipo de muestra: Contenido Orgánico Vertical. Método: Levantamiento Presencial y Curaduría.
              </td>
            </tr>

            {/* SECCIÓN 2: MÓDULOS ADICIONALES */}
            <tr>
              <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
                MÓDULOS Y COMPLEMENTOS ADICIONALES
              </td>
            </tr>

            {selectedAddonList.length > 0 ? (
              selectedAddonList.map((addon, idx) => (
                <tr key={idx}>
                  <td className="py-1 pl-3 font-semibold italic text-gray-700 uppercase">{addon.title}</td>
                  <td className="py-1 text-center font-bold text-gray-900">+{formatPrice(addon.price)} MXN</td>
                  <td className="py-1 text-right text-gray-500">Aplicado</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-1 pl-3 font-semibold italic text-gray-500">COMPLEMENTOS EXTRA</td>
                <td className="py-1 text-center font-semibold text-gray-500">Sin adicionales</td>
                <td className="py-1 text-right text-gray-500">0.00 MXN</td>
              </tr>
            )}

            {/* SECCIÓN COMPARATIVA DE PLANES EN IMPRESIÓN/PDF */}
            <tr>
              <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
                ESTUDIO COMPARATIVO DE PLANES BASE
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="py-2">
                <table className="w-full text-center text-[10px] border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                      <th className="p-1.5 text-left w-[35%]">Plan</th>
                      <th className="p-1.5 w-[20%]">Reels / mes</th>
                      <th className="p-1.5 w-[20%]">Carruseles</th>
                      <th className="p-1.5 w-[25%] text-right pr-2 font-bold">Inversión Base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className={`border-b border-gray-200 ${plan.id === currentPlanObj?.id ? "bg-pink-50 font-bold" : ""}`}
                      >
                        <td className="p-1.5 text-left font-semibold">
                          {plan.name} {plan.id === currentPlanObj?.id ? "✓ (SELECCIONADO)" : ""}
                        </td>
                        <td className="p-1.5">{plan.reels} Reels</td>
                        <td className="p-1.5">4 Carruseles</td>
                        <td className="p-1.5 text-right pr-2 text-gray-900 font-bold">{plan.priceLabel} MXN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* SECCIÓN 3: RESULTADOS Y SEROLOGÍA DE INVERSIÓN */}
            <tr>
              <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
                RESUMEN Y DICTAMEN DE RESULTADO FINANCIERO
              </td>
            </tr>

            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">INVERSIÓN PLAN BASE ({(currentPlanObj?.name || "BASE")?.toUpperCase()})</td>
              <td className="py-1 text-center font-bold text-gray-900">{formatPrice(basePrice)} MXN</td>
              <td className="py-1 text-right text-gray-500">Tarifa Mensual</td>
            </tr>
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-700">INVERSIÓN COMPLEMENTOS ADICIONALES</td>
              <td className="py-1 text-center font-bold text-gray-900">{formatPrice(addonsPrice)} MXN</td>
              <td className="py-1 text-right text-gray-500">Módulos Extra</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-gray-400 font-bold">
              <td className="py-2 pl-3 text-gray-900 font-black text-sm uppercase">INVERSIÓN ESTIMADA TOTAL RESULTADO</td>
              <td className="py-2 text-center text-sm font-black text-gray-900">{formatPrice(totalPrice)} MXN / mes</td>
              <td className="py-2 text-right text-sm font-black text-gray-900">Aprobado</td>
            </tr>
          </tbody>
        </table>

        {/* SECCIÓN DE FIRMAS */}
        <div className="mt-14 pt-4 flex justify-between items-end text-xs">
          <div className="text-center w-56">
            <div className="w-48 border-b border-gray-400 mx-auto mb-1" />
            <p className="font-bold text-gray-900">{contact.name || "The Formulab"}</p>
            <p className="text-[10px] text-gray-600 font-semibold">{contact.title || "Dirección de Estrategia"}</p>
            <p className="text-[9px] text-gray-400">Céd. Prof.: 3208142</p>
          </div>

          <div className="text-right text-[11px] text-gray-500">
            <p className="mb-8">CANCÚN, Q. ROO, {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p>
            <div className="text-center w-56 inline-block">
              <div className="w-48 border-b border-gray-400 mx-auto mb-1" />
              <p className="font-bold text-gray-900">The Formulab Creative Labs</p>
              <p className="text-[10px] text-gray-600 font-semibold">Certificación de Diagnóstico</p>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA FOOTER BANNER */}
        <div className="mt-8 pt-2 border-t border-gray-400 text-[8px] text-gray-500 text-center uppercase tracking-wider space-y-0.5 font-mono">
          <p>
            NOMBRE: THE FORMULAB S.A. DE C.V. DIRECCIÓN: CANCÚN, QUINTANA ROO ESTADO: QUINTANA ROO PAÍS: México E-MAIL: {contact.email || "hola@theformulab.io"} WEB: theformulab.io
          </p>
          <p>Página 1 de 1</p>
        </div>
      </div>
    </div>
  );
}
