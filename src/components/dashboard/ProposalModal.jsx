import { useState, useEffect } from "react";
import { FileText, DollarSign } from "lucide-react";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultTemplate } from "@/data/proposalData";

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
      priceEsencial,
      priceCrecimiento,
      priceEscala,
      pricePauMarca,
      pricePauCreadora,
      priceManejoRedes,
      priceMetaAds,
      existingContent: initialData?.contenido || defaultTemplate,
      id: initialData?.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-neutral-900 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <h3 className="font-sora font-extrabold text-lg tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 2-Step Tabs Header */}
        <div className="flex border-b border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-3 px-4 font-sora text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 1
                ? "border-brand-magenta text-brand-magenta bg-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Info & Textos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-3 px-4 font-sora text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 2
                ? "border-brand-magenta text-brand-magenta bg-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            2. Precios & Módulos
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INFO GENERAL Y TEXTOS */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                  Identificador (URL Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. mi-marca-cool"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Dirección pública: {window.location.origin}/{slug || "slug-ejemplo"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Case Cool México"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm focus:border-brand-magenta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                    Nombre Corto / Marca
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Case Cool"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm focus:border-brand-magenta focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                  Título de la Propuesta
                </label>
                <input
                  type="text"
                  placeholder="Propuesta de Contenido"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm focus:border-brand-magenta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                  Mensaje de Saludo (Párrafo 1)
                </label>
                <textarea
                  rows={4}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-none text-sm focus:border-brand-magenta focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sora text-neutral-800 uppercase tracking-wider mb-1">
                  Visión Estratégica (Párrafo 2)
                </label>
                <textarea
                  rows={4}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-none text-sm focus:border-brand-magenta focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRECIOS MONETARIOS */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-sora font-bold text-xs uppercase tracking-wider text-brand-magenta mb-3 pb-1 border-b border-neutral-200">
                  Planes Base Mensuales (MXN)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Plan Esencial (5 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceEsencial}
                      onChange={(e) => setPriceEsencial(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Plan Crecimiento (8 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceCrecimiento}
                      onChange={(e) => setPriceCrecimiento(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Plan Escala / Dominio (12 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceEscala}
                      onChange={(e) => setPriceEscala(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-sora font-bold text-xs uppercase tracking-wider text-brand-magenta mb-3 pb-1 border-b border-neutral-200">
                  Módulos Adicionales (Add-ons MXN)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Pau en Cámara - Modalidad Marca
                    </label>
                    <input
                      type="number"
                      value={pricePauMarca}
                      onChange={(e) => setPricePauMarca(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Pau en Cámara - Modalidad Creadora
                    </label>
                    <input
                      type="number"
                      value={pricePauCreadora}
                      onChange={(e) => setPricePauCreadora(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Manejo & Publicación Redes
                    </label>
                    <input
                      type="number"
                      value={priceManejoRedes}
                      onChange={(e) => setPriceManejoRedes(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">
                      Gestión de Meta Ads (Pauta)
                    </label>
                    <input
                      type="number"
                      value={priceMetaAds}
                      onChange={(e) => setPriceMetaAds(e.target.value)}
                      className="w-full h-10 px-3 border border-neutral-300 rounded-none text-sm font-mono focus:border-brand-magenta focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls inside Modal */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 border border-neutral-300 text-neutral-700 font-sora font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {activeTab === 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="h-10 px-5 bg-neutral-900 text-white font-sora font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Siguiente: Precios →
                </button>
              )}
              {activeTab === 2 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="h-10 px-4 border border-neutral-900 text-neutral-900 font-sora font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                >
                  ← Volver a Info
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-6 bg-brand-magenta text-white font-sora font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Propuesta"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
