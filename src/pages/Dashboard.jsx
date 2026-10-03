import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Database,
  RefreshCw,
  FileText,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  BarChart2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultTemplate } from "@/data/proposalData";
import { formatPriceLabel, formatAddonLabel } from "@/utils/formatters";
import {
  fetchProposals,
  createProposal,
  updateProposal,
  deleteProposal
} from "@/services/proposalService";
import ProposalModal from "@/components/dashboard/ProposalModal";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("proposals");

  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Proposals state
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load diagnostics from Supabase
  const loadDiagnostics = async () => {
    if (!supabase) return;
    setLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("diagnostics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);

      if (!error && data) {
        setDiagnostics(data || []);
      }
    } catch (err) {
      console.error("Error loading diagnostics:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Load proposals using proposalService
  const loadProposals = async () => {
    setLoadingProposals(true);
    const res = await fetchProposals();
    if (res.success) {
      setProposals(res.data);
    }
    setLoadingProposals(false);
  };

  useEffect(() => {
    loadDiagnostics();
    loadProposals();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada.");
    navigate("/login");
  };

  // Helper to construct custom content object
  const buildContentJson = (formData) => {
    const existingContent = formData.existingContent || defaultTemplate;
    const plans = existingContent.pricingPlans || defaultTemplate.pricingPlans;
    const updatedPlans = plans.map((plan) => {
      if (plan.id === "esencial") {
        return { ...plan, price: Number(formData.priceEsencial), priceLabel: formatPriceLabel(formData.priceEsencial) };
      }
      if (plan.id === "crecimiento") {
        return { ...plan, price: Number(formData.priceCrecimiento), priceLabel: formatPriceLabel(formData.priceCrecimiento) };
      }
      if (plan.id === "escala") {
        return { ...plan, price: Number(formData.priceEscala), priceLabel: formatPriceLabel(formData.priceEscala) };
      }
      return plan;
    });

    const addonsList = existingContent.addons || defaultTemplate.addons;
    const updatedAddons = addonsList.map((addon) => {
      if (addon.id === "addon_pau_camara" && addon.options) {
        return {
          ...addon,
          options: addon.options.map((opt) => {
            if (opt.id === "pau_marca") {
              return { ...opt, priceValue: Number(formData.pricePauMarca), priceLabel: formatAddonLabel(formData.pricePauMarca) };
            }
            if (opt.id === "pau_creadora") {
              return { ...opt, priceValue: Number(formData.pricePauCreadora), priceLabel: formatAddonLabel(formData.pricePauCreadora) };
            }
            return opt;
          })
        };
      }
      if (addon.id === "addon_manejo") {
        return { ...addon, priceValue: Number(formData.priceManejoRedes), priceLabel: formatAddonLabel(formData.priceManejoRedes) };
      }
      if (addon.id === "addon_meta_ads") {
        return { ...addon, priceValue: Number(formData.priceMetaAds), priceLabel: formatAddonLabel(formData.priceMetaAds) };
      }
      return addon;
    });

    return {
      ...existingContent,
      client: {
        ...(existingContent.client || {}),
        name: formData.clientName,
        shortName: formData.shortName || formData.clientName,
        proposalTitle: formData.proposalTitle || "Propuesta de Contenido",
        greeting: formData.greeting || defaultTemplate.client.greeting,
        vision: formData.vision || defaultTemplate.client.vision
      },
      pricingPlans: updatedPlans,
      addons: updatedAddons
    };
  };

  // Create Proposal Submit Handler
  const handleSaveCreate = async (formData) => {
    if (!formData.slug || !formData.clientName) {
      toast.error("Por favor completa el identificador (slug) y el nombre del cliente.");
      return;
    }

    setIsSaving(true);
    const customContent = buildContentJson(formData);
    const res = await createProposal({
      slug: formData.slug,
      cliente: formData.clientName,
      contenido: customContent
    });

    if (res.success) {
      toast.success(`Propuesta para "${formData.clientName}" creada con éxito.`);
      setShowCreateModal(false);
      loadProposals();
    } else {
      toast.error(res.error || "No se pudo crear la propuesta.");
    }
    setIsSaving(false);
  };

  // Edit Proposal Submit Handler
  const handleSaveEdit = async (formData) => {
    if (!formData.id || !formData.clientName) return;

    setIsSaving(true);
    const customContent = buildContentJson(formData);
    const res = await updateProposal(formData.id, {
      slug: formData.slug,
      cliente: formData.clientName,
      contenido: customContent
    });

    if (res.success) {
      toast.success(`Propuesta "${formData.clientName}" actualizada.`);
      setShowEditModal(false);
      setEditingItem(null);
      loadProposals();
    } else {
      toast.error(res.error || "No se pudo actualizar la propuesta.");
    }
    setIsSaving(false);
  };

  // Delete Proposal Handler
  const handleDelete = async (item) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la propuesta para "${item.cliente || item.slug}"?`)) {
      return;
    }

    const res = await deleteProposal(item.id);
    if (res.success) {
      toast.success(`Propuesta para "${item.cliente || item.slug}" eliminada.`);
      loadProposals();
    } else {
      toast.error(res.error || "Error al eliminar la propuesta.");
    }
  };

  const copyProposalLink = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("Enlace copiado al portapapeles.");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-inter">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/logo.png" alt="The Formulab" className="h-7 w-auto object-contain" />
            </a>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 border border-brand-magenta/30 text-brand-magenta font-bold">
              ÁREA PROTEGIDA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 border-r border-neutral-200 pr-4">
              <User className="w-3.5 h-3.5 text-brand-magenta" />
              <span>{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="h-9 px-4 rounded-none border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-sora font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="container max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-neutral-200">
          <div>
            <span className="text-xs font-mono text-brand-magenta font-bold uppercase tracking-wider block mb-1">
              PANEL GENERAL DE CONTROL
            </span>
            <h1 className="text-3xl font-sora font-extrabold tracking-tight text-neutral-900">
              Dashboard de Estrategias
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadDiagnostics();
                loadProposals();
              }}
              className="h-10 px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 font-sora font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProposals || loadingDb ? "animate-spin text-brand-magenta" : ""}`} />
              Recargar
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-5 bg-brand-magenta text-white font-sora font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva Propuesta
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-neutral-200 mb-8">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`pb-4 px-6 font-sora text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "proposals"
                ? "border-brand-magenta text-brand-magenta"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Propuestas Activas ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`pb-4 px-6 font-sora text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "diagnostics"
                ? "border-brand-magenta text-brand-magenta"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Diagnósticos Recibidos ({diagnostics.length})
          </button>
        </div>

        {/* TAB 1: PROPUESTAS TABLE */}
        {activeTab === "proposals" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-sora font-bold text-neutral-900">Gestor de Propuestas</h2>
              <span className="text-xs text-neutral-500 font-mono">
                {proposals.length} propuesta(s) registradas
              </span>
            </div>

            {loadingProposals ? (
              <div className="p-12 text-center border border-neutral-200 bg-neutral-50">
                <RefreshCw className="w-6 h-6 text-brand-magenta animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono text-neutral-500 uppercase">Cargando propuestas...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-neutral-300 bg-neutral-50">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="font-sora font-bold text-neutral-800 text-sm mb-1">No hay propuestas creadas</p>
                <p className="text-xs text-neutral-500 mb-4">
                  Crea tu primera propuesta personalizada para tus clientes.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-9 px-4 bg-brand-magenta text-white font-sora font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear Propuesta
                </button>
              </div>
            ) : (
              <div className="border border-neutral-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-neutral-900 text-white font-sora text-xs uppercase tracking-wider">
                      <th className="p-4 w-[25%]">Cliente / Marca</th>
                      <th className="p-4 w-[20%]">URL (Slug)</th>
                      <th className="p-4 w-[20%]">Fecha de Creación</th>
                      <th className="p-4 w-[35%] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {proposals.map((item) => (
                      <tr key={item.id || item.slug} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-4">
                          <span className="font-sora font-bold text-neutral-900 block">
                            {item.cliente || item.shortName || item.slug}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {item.contenido?.client?.proposalTitle || "Propuesta de Contenido"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs font-semibold text-brand-magenta bg-brand-magenta/5 border border-brand-magenta/20 px-2.5 py-1">
                            /{item.slug}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-neutral-500">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })
                            : "Fecha N/A"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyProposalLink(item.slug)}
                              title="Copiar enlace público"
                              className="h-8 px-2.5 border border-neutral-300 hover:border-neutral-900 text-neutral-700 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedSlug === item.slug ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                              <span>{copiedSlug === item.slug ? "Copiado" : "Copiar"}</span>
                            </button>

                            <Link
                              to={`/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver propuesta en vivo"
                              className="h-8 px-2.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white border border-neutral-200 text-neutral-800 font-mono text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Ver</span>
                            </Link>

                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowEditModal(true);
                              }}
                              title="Editar propuesta"
                              className="h-8 px-2.5 bg-neutral-900 text-white hover:bg-brand-magenta font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => handleDelete(item)}
                              title="Eliminar propuesta"
                              className="h-8 px-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-mono text-xs flex items-center transition-colors cursor-pointer"
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
            )}
          </div>
        )}

        {/* TAB 2: DIAGNOSTICS TABLE */}
        {activeTab === "diagnostics" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-sora font-bold text-neutral-900">Diagnósticos del Test Interactivo</h2>
              <span className="text-xs text-neutral-500 font-mono">Últimos 15 resultados</span>
            </div>

            {loadingDb ? (
              <div className="p-12 text-center border border-neutral-200 bg-neutral-50">
                <RefreshCw className="w-6 h-6 text-brand-magenta animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono text-neutral-500 uppercase">Cargando diagnósticos...</p>
              </div>
            ) : diagnostics.length === 0 ? (
              <div className="p-12 text-center border border-neutral-200 bg-neutral-50 text-neutral-500 text-sm">
                <Database className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                No se registraron respuestas de diagnóstico aún.
              </div>
            ) : (
              <div className="border border-neutral-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-900 text-white font-sora text-xs uppercase tracking-wider">
                      <th className="p-4 w-[35%]">Email</th>
                      <th className="p-4 w-[25%]">Diagnóstico Emitido</th>
                      <th className="p-4 w-[20%]">Fecha</th>
                      <th className="p-4 w-[20%]">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {diagnostics.map((diag) => (
                      <tr key={diag.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-4 font-mono font-medium text-neutral-900">{diag.email}</td>
                        <td className="p-4 font-sora font-bold text-brand-magenta">
                          {diag.result_data?.title || "Diagnóstico Completo"}
                        </td>
                        <td className="p-4 text-xs font-mono text-neutral-500">
                          {new Date(diag.created_at).toLocaleDateString("es-MX")}
                        </td>
                        <td className="p-4 text-xs text-neutral-500 font-mono">
                          {diag.answers ? `${Object.keys(diag.answers).length} Respuestas` : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE PROPOSAL MODAL */}
      <ProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveCreate}
        title="Crear Nueva Propuesta de Contenido"
        isSaving={isSaving}
      />

      {/* EDIT PROPOSAL MODAL */}
      <ProposalModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEdit}
        title={`Editar Propuesta: ${editingItem?.cliente || editingItem?.slug || ""}`}
        initialData={editingItem}
        isSaving={isSaving}
      />
    </div>
  );
}
