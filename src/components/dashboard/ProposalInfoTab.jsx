/**
 * ProposalInfoTab
 * Tab 1 form inputs for general proposal information and text content.
 */
export default function ProposalInfoTab({
  slug = "",
  setSlug,
  clientName = "",
  setClientName,
  shortName = "",
  setShortName,
  proposalTitle = "",
  setProposalTitle,
  greeting = "",
  setGreeting,
  vision = "",
  setVision
}) {
  return (
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
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
          className="w-full h-11 px-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50"
        />
      </div>

      <div>
        <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
          Mensaje de Saludo Personalizado
        </label>
        <textarea
          rows={3}
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50 leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs font-sora font-bold text-gray-800 uppercase tracking-wider mb-2">
          Visión / Diagnóstico de la Marca
        </label>
        <textarea
          rows={4}
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-gray-50/50 leading-relaxed"
        />
      </div>
    </div>
  );
}
