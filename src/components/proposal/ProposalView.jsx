import { useState, useEffect } from "react";
import { PROPOSAL_DATA as defaultData } from "@/data/proposalData";
import { trackProposalEvent } from "@/services/proposalService";
import ProposalHeroHeader from "./ProposalHeroHeader";
import ProposalBaseFeatures from "./ProposalBaseFeatures";
import ProposalCalculatorSection from "./ProposalCalculatorSection";
import ProposalComparisonTable from "./ProposalComparisonTable";
import ProposalWhyUsAndConditions from "./ProposalWhyUsAndConditions";
import ProposalLabPdfReport from "./ProposalLabPdfReport";
import ProposalActivationModal from "./ProposalActivationModal";

/**
 * ProposalView
 * Orchestrator container component for rendering interactive proposal view & printable lab report.
 */
export default function ProposalView({ data = defaultData }) {
  const proposal = data || defaultData;
  const { client: clientInfo = {}, baseFeatures = [], pricingPlans = [], addons = [], whyUs = [], conditions = [], contact = {} } = proposal;

  const clientData = {
    name: clientInfo.name || "Cliente Estimado",
    shortName: clientInfo.shortName || clientInfo.name || "Cliente",
    proposalTitle: clientInfo.proposalTitle || "Propuesta de Contenido",
    logoUrl: clientInfo.logoUrl || "/logo.png",
    greeting: clientInfo.greeting || "Te presentamos nuestra propuesta estratégica personalizada.",
    vision: clientInfo.vision || "Diseñamos una fórmula a medida para escalar la presencia de tu marca."
  };

  const [showSecondText, setShowSecondText] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSecondText(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const scope = proposal?.contenido?.scope || proposal?.content?.scope || {};
  const baseShoots = Number(scope.producciones_por_mes || proposal?.contenido?.producciones_por_mes || 2);
  const precioSesionExtra = Number(scope.precio_sesion_extra) || 3500;

  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1]?.id || pricingPlans[0]?.id || "crecimiento");
  const [selectedAddons, setSelectedAddons] = useState({});
  const [extraSessionsCount, setExtraSessionsCount] = useState(
    Number(proposal?.contenido?.pricing?.extraSessionsCount) || 0
  );
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);

  const toggleAddon = (id) => setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  const setRadioAddon = (id, optId) => setSelectedAddons((prev) => ({ ...prev, [id]: prev[id] === optId ? null : optId }));

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

  const extraSessionsPrice = extraSessionsCount * precioSesionExtra;
  const totalPrice = basePrice + addonsPrice + extraSessionsPrice;

  const handleOpenActivationModal = () => {
    // Registro analítico del evento de aceptación/contratación
    trackProposalEvent(proposal, "proposal_accept_clicked", {
      planId: currentPlanObj?.id,
      planName: currentPlanObj?.name,
      extraSessionsCount,
      totalSessions: baseShoots + extraSessionsCount,
      totalPrice
    });
    setShowActivationModal(true);
  };

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

  if (extraSessionsCount > 0) {
    selectedAddonList.push({
      title: `Producción Extra (${extraSessionsCount} ${extraSessionsCount === 1 ? "sesión" : "sesiones"})`,
      price: extraSessionsPrice,
      priceLabel: `+$${extraSessionsPrice.toLocaleString("es-MX")} MXN`
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-gray-900 font-inter selection:bg-[#ef18d6]/20 selection:text-[#ef18d6] pb-24 md:pb-0 relative scroll-smooth">
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
            <div className="flex items-center gap-3">
              <span className="text-xs font-sora font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full shadow-xs hidden md:inline-block">
                Propuesta para {clientData.shortName}
              </span>
              <button
                type="button"
                onClick={handleOpenActivationModal}
                className="text-xs font-sora font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Aceptar Propuesta
              </button>
            </div>
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
          extraSessionsCount={extraSessionsCount}
          setExtraSessionsCount={setExtraSessionsCount}
          precioSesionExtra={precioSesionExtra}
          baseShoots={baseShoots}
          showMobileBreakdown={showMobileBreakdown}
          setShowMobileBreakdown={setShowMobileBreakdown}
          onAcceptProposal={handleOpenActivationModal}
        />

        {/* Resumen Comparativo entre Planes */}
        <ProposalComparisonTable pricingPlans={pricingPlans} addons={addons} />

        {/* Why Us & Conditions */}
        <ProposalWhyUsAndConditions
          whyUs={whyUs}
          conditions={conditions}
          contact={contact}
          onAcceptProposal={handleOpenActivationModal}
        />
      </div>

      {/* Modal Clínico de Activación de Cuenta y Datos SPEI */}
      <ProposalActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        propuesta={{
          ...proposal,
          contenido: {
            ...(proposal?.contenido || proposal?.content || {}),
            scope: {
              ...(proposal?.contenido?.scope || {}),
              producciones_por_mes: baseShoots,
              precio_sesion_extra: precioSesionExtra
            },
            pricing: {
              basePrice,
              extraSessionsCount,
              totalPrice
            },
            producciones_por_mes: baseShoots + extraSessionsCount
          }
        }}
        planSeleccionado={currentPlanObj}
        montoTotal={totalPrice}
      />

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
