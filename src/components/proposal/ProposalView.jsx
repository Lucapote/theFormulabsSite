import { useState, useEffect } from "react";
import { PROPOSAL_DATA as defaultData } from "@/data/proposalData";
import ProposalHeroHeader from "./ProposalHeroHeader";
import ProposalBaseFeatures from "./ProposalBaseFeatures";
import ProposalCalculatorSection from "./ProposalCalculatorSection";
import ProposalComparisonTable from "./ProposalComparisonTable";
import ProposalWhyUsAndConditions from "./ProposalWhyUsAndConditions";
import ProposalLabPdfReport from "./ProposalLabPdfReport";

/**
 * ProposalView
 * Orchestrator container component for rendering interactive proposal view & printable lab report.
 */
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
        <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm font-inter">
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
            <span className="text-xs font-sora font-bold text-white bg-[#188ff0] border border-[#188ff0] px-4 py-1.5 rounded-full shadow-xs hidden md:inline-block">
              Propuesta para {clientData.shortName}
            </span>
          </div>
        </nav>

        {/* Hero Header */}
        <ProposalHeroHeader clientData={clientData} showSecondText={showSecondText} />

        {/* Base Included Features */}
        <ProposalBaseFeatures baseFeatures={baseFeatures} />

        {/* Interactive Pricing Calculator */}
        <ProposalCalculatorSection
          pricingPlans={pricingPlans}
          addons={addons}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          selectedAddons={selectedAddons}
          toggleAddon={toggleAddon}
          setRadioAddon={setRadioAddon}
          basePrice={basePrice}
          totalPrice={totalPrice}
          showMobileBreakdown={showMobileBreakdown}
          setShowMobileBreakdown={setShowMobileBreakdown}
        />

        {/* Resumen Comparativo entre Planes */}
        <ProposalComparisonTable pricingPlans={pricingPlans} addons={addons} />

        {/* Why Us & Conditions */}
        <ProposalWhyUsAndConditions whyUs={whyUs} conditions={conditions} contact={contact} />
      </div>

      {/* INFORME DE RESULTADO DE LABORATORIO (PDF IMPRESIÓN) */}
      <ProposalLabPdfReport
        clientData={clientData}
        currentPlanObj={currentPlanObj}
        selectedAddonList={selectedAddonList}
        pricingPlans={pricingPlans}
        basePrice={basePrice}
        addonsPrice={addonsPrice}
        totalPrice={totalPrice}
        contact={contact}
      />
    </div>
  );
}
