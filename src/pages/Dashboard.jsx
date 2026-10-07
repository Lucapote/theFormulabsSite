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
  BarChart2,
  Sparkles,
  Eye,
  Users
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
import ClientsCalendarSection from "@/components/dashboard/ClientsCalendarSection";

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
  const [deletingItem, setDeletingItem] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

    const token = existingContent.token || (Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6));

    return {
      ...existingContent,
      token,
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
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    const res = await deleteProposal(deletingItem.id);
    if (res.success) {
      toast.success(`Propuesta para "${deletingItem.cliente || deletingItem.slug}" eliminada.`);
      setDeletingItem(null);
      loadProposals();
    } else {
      toast.error(res.error || "Error al eliminar la propuesta.");
    }
    setIsDeleting(false);
  };

  const copyProposalLink = (item) => {
    const slug = item.slug;
    const token = item.contenido?.token;
    const fullUrl = token
      ? `${window.location.origin}/${slug}?token=${token}`
      : `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("Enlace privado copiado al portapapeles.");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter pb-20 w-full max-w-full overflow-x-hidden">
      {/* Top Navigation Bar matching ProposalView style */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs py-2">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="The Formulab" className="h-9 w-auto object-contain" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center h-10 px-4 rounded-full text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 gap-2">
              <User className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="h-10 px-3.5 sm:px-5 rounded-full border border-gray-300 hover:border-gray-900 text-gray-800 hover:bg-gray-900 hover:text-white font-sora font-bold text-xs tracking-wider uppercase transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        {/* Navigation Tabs Pill Style */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "proposals"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4 text-pink-400" />
            Propuestas ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab("calendars")}
            className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "calendars"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4 text-pink-500" />
            Calendarios
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "diagnostics"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-brand-blue" />
            Diagnósticos ({diagnostics.length})
          </button>
        </div>

        {/* TAB 2: CLIENTES Y CALENDARIOS */}
        {activeTab === "calendars" && <ClientsCalendarSection />}

        {/* TAB 1: PROPUESTAS TABLE */}
        {activeTab === "proposals" && (
          <div className="space-y-6">
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
                    onClick={() => {
                      loadDiagnostics();
                      loadProposals();
                    }}
                    className="h-10 sm:h-11 px-3 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
                    title="Actualizar datos"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingProposals || loadingDb ? "animate-spin text-pink-500" : ""}`} />
                    <span className="hidden sm:inline">Actualizar</span>
                  </button>

                  <button
                    onClick={() => setShowCreateModal(true)}
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
                  onClick={() => setShowCreateModal(true)}
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
                                onClick={() => copyProposalLink(item)}
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
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowEditModal(true);
                                }}
                                title="Editar propuesta"
                                className="h-9 px-3.5 bg-gray-900 hover:bg-pink-500 text-white rounded-full text-xs font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              <button
                                onClick={() => setDeletingItem(item)}
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
        )}

        {/* TAB 2: DIAGNOSTICS TABLE */}
        {activeTab === "diagnostics" && (
          <div className="space-y-4">
            {loadingDb ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
                <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-sora font-bold text-gray-700">Cargando diagnósticos...</p>
              </div>
            ) : diagnostics.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg text-gray-500 text-sm">
                <Database className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No se registraron respuestas de diagnóstico aún.
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-900 text-white font-sora text-xs">
                        <th className="p-5 font-bold w-[35%]">Email</th>
                        <th className="p-5 font-bold w-[25%]">Diagnóstico Emitido</th>
                        <th className="p-5 font-bold w-[20%]">Fecha</th>
                        <th className="p-5 font-bold w-[20%]">Detalles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {diagnostics.map((diag) => (
                        <tr key={diag.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="p-5 font-mono font-medium text-gray-900">{diag.email}</td>
                          <td className="p-5 font-sora font-bold text-pink-600">
                            {diag.result_data?.title || "Diagnóstico Completo"}
                          </td>
                          <td className="p-5 text-xs text-gray-500 font-medium">
                            {new Date(diag.created_at).toLocaleDateString("es-MX")}
                          </td>
                          <td className="p-5 text-xs text-gray-500 font-mono">
                            {diag.answers ? `${Object.keys(diag.answers).length} Respuestas` : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-sora font-extrabold text-gray-900 mb-2">
              ¿Eliminar propuesta?
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Estás a punto de eliminar la propuesta para{" "}
              <span className="font-bold text-gray-900 font-sora">
                "{deletingItem.cliente || deletingItem.slug}"
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-11 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
