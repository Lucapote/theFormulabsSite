import { useState, useEffect } from "react";
import { FileText, DollarSign, X } from "lucide-react";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultTemplate } from "@/data/proposalData";
import ProposalInfoTab from "./ProposalInfoTab";
import ProposalPricingTab from "./ProposalPricingTab";

/**
 * ProposalModal
 * Strategic proposal configurator modal with 2-step tabbed workflow.
 */
export default function ProposalModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialData = null,
  isSaving = false
}) {
  const [activeTab, setActiveTab] = useState(1);

  // General fields
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [shortName, setShortName] = useState("");
  const [proposalTitle, setProposalTitle] = useState("Propuesta de Contenido");
  const [greeting, setGreeting] = useState(defaultTemplate.client.greeting);
  const [vision, setVision] = useState(defaultTemplate.client.vision);

  // Pricing fields
  const [priceEsencial, setPriceEsencial] = useState(10000);
  const [priceCrecimiento, setPriceCrecimiento] = useState(14500);
  const [priceEscala, setPriceEscala] = useState(18500);

  // Addons fields
  const [pricePauMarca, setPricePauMarca] = useState(2000);
  const [pricePauCreadora, setPricePauCreadora] = useState(3000);
  const [priceManejoRedes, setPriceManejoRedes] = useState(3000);
  const [priceMetaAds, setPriceMetaAds] = useState(2500);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(1);
      if (initialData) {
        const content = initialData.contenido || defaultTemplate;
        const client = content.client || {};
        const plans = content.pricingPlans || defaultTemplate.pricingPlans;
        const addons = content.addons || defaultTemplate.addons;

        setSlug(initialData.slug || "");
        setClientName(initialData.cliente || client.name || "");
        setShortName(client.shortName || initialData.cliente || "");
        setProposalTitle(client.proposalTitle || "Propuesta de Contenido");
        setGreeting(client.greeting || defaultTemplate.client.greeting);
        setVision(client.vision || defaultTemplate.client.vision);

        const p1 = plans.find((p) => p.id === "esencial")?.price || 10000;
        const p2 = plans.find((p) => p.id === "crecimiento")?.price || 14500;
        const p3 = plans.find((p) => p.id === "escala")?.price || 18500;
        setPriceEsencial(p1);
        setPriceCrecimiento(p2);
        setPriceEscala(p3);

        const pauAddon = addons.find((a) => a.id === "addon_pau_camara");
        const pPauM = pauAddon?.options?.find((o) => o.id === "pau_marca")?.priceValue || 2000;
        const pPauC = pauAddon?.options?.find((o) => o.id === "pau_creadora")?.priceValue || 3000;
        const pManejo = addons.find((a) => a.id === "addon_manejo")?.priceValue || 3000;
        const pMeta = addons.find((a) => a.id === "addon_meta_ads")?.priceValue || 2500;

        setPricePauMarca(pPauM);
        setPricePauCreadora(pPauC);
        setPriceManejoRedes(pManejo);
        setPriceMetaAds(pMeta);
      } else {
        setSlug("");
        setClientName("");
        setShortName("");
        setProposalTitle("Propuesta de Contenido");
        setGreeting(defaultTemplate.client.greeting);
        setVision(defaultTemplate.client.vision);
        setPriceEsencial(10000);
        setPriceCrecimiento(14500);
        setPriceEscala(18500);
        setPricePauMarca(2000);
        setPricePauCreadora(3000);
        setPriceManejoRedes(3000);
        setPriceMetaAds(2500);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      slug,
      clientName,
      shortName,
      proposalTitle,
      greeting,
      vision,
      priceEsencial: Number(priceEsencial) || 0,
      priceCrecimiento: Number(priceCrecimiento) || 0,
      priceEscala: Number(priceEscala) || 0,
      pricePauMarca: Number(pricePauMarca) || 0,
      pricePauCreadora: Number(pricePauCreadora) || 0,
      priceManejoRedes: Number(priceManejoRedes) || 0,
      priceMetaAds: Number(priceMetaAds) || 0,
      existingContent: initialData?.contenido || defaultTemplate,
      id: initialData?.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto font-inter">
      <div className="bg-white rounded-[2rem] border border-gray-100 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
          <div>
            <span className="text-[10px] font-sora font-bold text-pink-400 uppercase tracking-widest block">
              CONFIGURADOR ESTRATÉGICO
            </span>
            <h3 className="font-sora font-extrabold text-lg tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Tabs Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-3 px-4 font-sora text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 1
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4 text-pink-500" />
            1. Info & Textos Generales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-3 px-4 font-sora text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 2
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-4 h-4 text-brand-blue" />
            2. Precios & Módulos
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeTab === 1 ? (
            <ProposalInfoTab
              slug={slug}
              setSlug={setSlug}
              clientName={clientName}
              setClientName={setClientName}
              shortName={shortName}
              setShortName={setShortName}
              proposalTitle={proposalTitle}
              setProposalTitle={setProposalTitle}
              greeting={greeting}
              setGreeting={setGreeting}
              vision={vision}
              setVision={setVision}
            />
          ) : (
            <ProposalPricingTab
              priceEsencial={priceEsencial}
              setPriceEsencial={setPriceEsencial}
              priceCrecimiento={priceCrecimiento}
              setPriceCrecimiento={setPriceCrecimiento}
              priceEscala={priceEscala}
              setPriceEscala={setPriceEscala}
              pricePauMarca={pricePauMarca}
              setPricePauMarca={setPricePauMarca}
              pricePauCreadora={pricePauCreadora}
              setPricePauCreadora={setPricePauCreadora}
              priceManejoRedes={priceManejoRedes}
              setPriceManejoRedes={setPriceManejoRedes}
              priceMetaAds={priceMetaAds}
              setPriceMetaAds={setPriceMetaAds}
            />
          )}

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 transition-all cursor-pointer"
            >
              {isSaving ? "Guardando..." : "Guardar Propuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
