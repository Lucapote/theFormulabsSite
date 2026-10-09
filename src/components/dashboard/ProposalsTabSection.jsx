import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Eye,
  Check,
  Copy,
  ExternalLink,
  Edit2,
  Trash2
} from "lucide-react";

/**
 * ProposalsTabSection
 * Renders the proposals list tab, including hero welcome card and data table.
 */
export default function ProposalsTabSection({
  proposals = [],
  loadingProposals = false,
  loadingDb = false,
  onRefresh,
  onCreateClick,
  onCopyLink,
  onEditClick,
  onDeleteClick,
  copiedSlug
}) {
  return (
    <div className="space-y-6 font-inter">
      {/* Hero Welcome Card matching ProposalView */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <p className="hidden sm:block text-pink-500 font-bold tracking-widest uppercase text-xs mb-2 font-sora">
              PANEL DE CONTROL GENERAL
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-sora">
              Gestor de <span className="text-brand-blue">Estrategias</span>
            </h1>
            <p className="hidden sm:block text-gray-600 text-base mt-2 font-medium">
              Crea, personaliza y supervisa las propuestas enviadas a tus clientes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={onRefresh}
              className="h-10 sm:h-11 px-3 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProposals || loadingDb ? "animate-spin text-pink-500" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={onCreateClick}
              className="h-10 sm:h-11 px-4 sm:px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Propuesta</span>
            </button>
          </div>
        </div>
      </div>

      {loadingProposals ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-sora font-bold text-gray-700">Cargando propuestas clínicas...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <FileText className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h3 className="font-sora font-extrabold text-gray-900 text-lg mb-1">No hay propuestas creadas</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Comienza creando tu primera propuesta de contenido personalizada para tus clientes.
          </p>
          <button
            onClick={onCreateClick}
            className="h-11 px-6 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Crear Propuesta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-900 text-white font-sora text-xs">
                  <th className="p-5 font-bold w-[26%]">Cliente / Marca</th>
                  <th className="p-5 font-bold w-[20%]">URL (Slug)</th>
                  <th className="p-5 font-bold w-[14%] text-center">Vistas</th>
                  <th className="p-5 font-bold w-[15%]">Fecha</th>
                  <th className="p-5 font-bold w-[25%] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {proposals.map((item) => (
                  <tr key={item.id || item.slug} className="hover:bg-pink-50/40 transition-colors">
                    <td className="p-5">
                      <span className="font-sora font-bold text-gray-900 text-base block">
                        {item.cliente || item.shortName || item.slug}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.contenido?.client?.proposalTitle || "Propuesta de Contenido"}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-block font-mono text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                        /{item.slug}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        <Eye className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        {item.contenido?.views || item.views || 0}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-gray-500 font-medium">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })
                        : "Fecha N/A"}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onCopyLink(item)}
                          title="Copiar enlace privado"
                          className="h-9 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedSlug === item.slug ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span>{copiedSlug === item.slug ? "Copiado" : "Copiar"}</span>
                        </button>

                        <Link
                          to={item.contenido?.token ? `/${item.slug}?token=${item.contenido.token}` : `/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver propuesta en vivo"
                          className="h-9 px-3.5 bg-blue-50 hover:bg-[#188ff0] text-[#188ff0] hover:text-white rounded-full text-xs font-sora font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>Ver</span>
                        </Link>

                        <button
                          onClick={() => onEditClick(item)}
                          title="Editar propuesta"
                          className="h-9 px-3.5 bg-gray-900 hover:bg-pink-500 text-white rounded-full text-xs font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => onDeleteClick(item)}
                          title="Eliminar propuesta"
                          className="h-9 px-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-full text-xs font-sora transition-all flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
