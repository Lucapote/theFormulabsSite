import { useState, useEffect } from "react";
import { FileText, DollarSign, X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
          <div>
            <span className="text-[10px] font-sora font-bold text-pink-400 uppercase tracking-widest block">
              CONFIGURADOR ESTRATÉGICO
            </span>
            <h3 className="font-sora font-extrabold text-lg tracking-tight">{title}</h3>
          </div>
          <button
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
          {/* TAB 1: INFO GENERAL Y TEXTOS */}
          {activeTab === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Identificador (URL Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. mi-marca-cool"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-2xl text-sm font-mono focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                  Enlace público: <span className="font-mono text-pink-600">{window.location.origin}/{slug || "slug-ejemplo"}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Case Cool México"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Nombre Corto / Marca
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Case Cool"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Título de la Propuesta
                </label>
                <input
                  type="text"
                  placeholder="Propuesta de Contenido"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Mensaje de Saludo (Párrafo 1)
                </label>
                <textarea
                  rows={4}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50 leading-relaxed text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Visión Estratégica (Párrafo 2)
                </label>
                <textarea
                  rows={4}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50 leading-relaxed text-gray-800"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRECIOS MONETARIOS */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-sora font-extrabold text-xs uppercase tracking-wider text-pink-600 mb-4 pb-2 border-b border-gray-100">
                  Planes Base Mensuales (MXN)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Plan Esencial (5 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceEsencial}
                      onChange={(e) => setPriceEsencial(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-200/80">
                    <label className="block text-[11px] font-sora font-bold text-pink-700 uppercase mb-2">
                      Plan Crecimiento (8 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceCrecimiento}
                      onChange={(e) => setPriceCrecimiento(e.target.value)}
                      className="w-full h-11 px-3 border border-pink-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Plan Escala / Dominio (12 Reels)
                    </label>
                    <input
                      type="number"
                      value={priceEscala}
                      onChange={(e) => setPriceEscala(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-sora font-extrabold text-xs uppercase tracking-wider text-pink-600 mb-4 pb-2 border-b border-gray-100">
                  Módulos Adicionales (Add-ons MXN)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Pau en Cámara - Modalidad Marca
                    </label>
                    <input
                      type="number"
                      value={pricePauMarca}
                      onChange={(e) => setPricePauMarca(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Pau en Cámara - Modalidad Creadora
                    </label>
                    <input
                      type="number"
                      value={pricePauCreadora}
                      onChange={(e) => setPricePauCreadora(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Manejo & Publicación Redes
                    </label>
                    <input
                      type="number"
                      value={priceManejoRedes}
                      onChange={(e) => setPriceManejoRedes(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80">
                    <label className="block text-[11px] font-sora font-bold text-gray-800 uppercase mb-2">
                      Gestión de Meta Ads (Pauta)
                    </label>
                    <input
                      type="number"
                      value={priceMetaAds}
                      onChange={(e) => setPriceMetaAds(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm font-mono focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls inside Modal */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 border border-gray-300 text-gray-700 font-sora font-bold text-xs rounded-full hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {activeTab === 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all cursor-pointer"
                >
                  Siguiente: Precios →
                </button>
              )}
              {activeTab === 2 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="h-11 px-5 border border-gray-900 text-gray-900 font-sora font-bold text-xs rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                >
                  ← Volver a Info
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all cursor-pointer disabled:opacity-50"
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
