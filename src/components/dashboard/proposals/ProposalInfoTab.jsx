import SlugPreviewField from "@/components/common/SlugPreviewField";

/**
 * Normaliza cualquier texto a un slug limpio para URL.
 */
export const slugify = (text) =>
  (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/[^\w-]+/g, "") // Remueve caracteres no alfanuméricos
    .replace(/--+/g, "-"); // Evita guiones dobles

/**
 * ProposalInfoTab
 * Pestaña 1 del modal de propuestas: Información general, contacto y textos estratégicos.
 * Layout calibrado con grid de 2 columnas y generación reactiva de URL Slug.
 */
export default function ProposalInfoTab({
  slug = "",
  setSlug,
  isSlugModified = false,
  setIsSlugModified,
  clientName = "",
  setClientName,
  shortName = "",
  setShortName,
  email = "",
  setEmail,
  whatsapp = "",
  setWhatsapp,
  instagram = "",
  setInstagram,
  location = "",
  setLocation,
  proposalTitle = "",
  setProposalTitle,
  greeting = "",
  setGreeting,
  vision = "",
  setVision
}) {
  const handleClientNameChange = (e) => {
    const val = e.target.value;
    setClientName(val);
    if (!isSlugModified && setSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setIsSlugModified?.(true);
    setSlug?.(slugify(e.target.value));
  };

  return (
    <div className="space-y-4 font-inter text-gray-900">
      {/* Grid Calibrada de 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fila 1: Nombre del Cliente & Nombre Corto / Empresa */}
        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Nombre del Cliente *
          </label>
          <input
            type="text"
            required
            placeholder="ej. Case Cool México"
            value={clientName || ""}
            onChange={handleClientNameChange}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Nombre Corto / Empresa
          </label>
          <input
            type="text"
            placeholder="ej. Case Cool"
            value={shortName || ""}
            onChange={(e) => setShortName?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Fila 2: Email de Contacto & WhatsApp / Teléfono */}
        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Email de Contacto
          </label>
          <input
            type="email"
            placeholder="contacto@cliente.com"
            value={email || ""}
            onChange={(e) => setEmail?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            WhatsApp / Teléfono
          </label>
          <input
            type="text"
            placeholder="+52 55 1234 5678"
            value={whatsapp || ""}
            onChange={(e) => setWhatsapp?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Fila 3: Instagram (@handle) & Locación / Dirección base */}
        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Instagram (@handle)
          </label>
          <input
            type="text"
            placeholder="@marca_cliente"
            value={instagram || ""}
            onChange={(e) => setInstagram?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Locación / Dirección base
          </label>
          <input
            type="text"
            placeholder="ej. Roma Norte, CDMX"
            value={location || ""}
            onChange={(e) => setLocation?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Fila 4: URL Slug (Ancho Completo) */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight">
              Identificador (URL Slug) *
            </label>
            {isSlugModified && (
              <button
                type="button"
                onClick={() => {
                  setIsSlugModified?.(false);
                  setSlug?.(slugify(clientName));
                }}
                className="text-[10px] font-sora font-semibold text-[#188ff0] hover:underline cursor-pointer"
              >
                Restaurar automático
              </button>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="ej. mi-marca-cool"
            value={slug || ""}
            onChange={handleSlugChange}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <SlugPreviewField
            prefix="theformulab.io/"
            slug={slug || ""}
            className="mt-2"
          />
        </div>
      </div>

      {/* Textos y Narrativa Estratégica */}
      <div className="space-y-4 pt-3 border-t border-gray-100">
        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Título de la Propuesta
          </label>
          <input
            type="text"
            value={proposalTitle || ""}
            onChange={(e) => setProposalTitle?.(e.target.value)}
            className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Mensaje de Saludo Personalizado
          </label>
          <textarea
            rows={3}
            value={greeting || ""}
            onChange={(e) => setGreeting?.(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed resize-none"
          />
        </div>

        <div>
          <label className="font-sora text-xs font-semibold text-gray-700 tracking-tight block mb-1.5">
            Visión / Diagnóstico de la Marca
          </label>
          <textarea
            rows={4}
            value={vision || ""}
            onChange={(e) => setVision?.(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:border-[#188ff0] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed resize-none"
          />
        </div>
      </div>
    </div>
  );
}
