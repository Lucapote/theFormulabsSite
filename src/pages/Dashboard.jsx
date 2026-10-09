import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, FileText, BarChart2, Users } from "lucide-react";
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
import ProposalsTabSection from "@/components/dashboard/ProposalsTabSection";
import DiagnosticsTabSection from "@/components/dashboard/DiagnosticsTabSection";
import ConfirmDeleteModal from "@/components/dashboard/ConfirmDeleteModal";

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
      {/* Top Navigation Bar */}
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
        {/* Navigation Tabs */}
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

        {/* TAB 1: PROPUESTAS */}
        {activeTab === "proposals" && (
          <ProposalsTabSection
            proposals={proposals}
            loadingProposals={loadingProposals}
            loadingDb={loadingDb}
            onRefresh={() => {
              loadDiagnostics();
              loadProposals();
            }}
            onCreateClick={() => setShowCreateModal(true)}
            onCopyLink={copyProposalLink}
            onEditClick={(item) => {
              setEditingItem(item);
              setShowEditModal(true);
            }}
            onDeleteClick={(item) => setDeletingItem(item)}
            copiedSlug={copiedSlug}
          />
        )}

        {/* TAB 3: DIAGNÓSTICOS */}
        {activeTab === "diagnostics" && (
          <DiagnosticsTabSection diagnostics={diagnostics} loadingDb={loadingDb} />
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

      {/* DELETE CONFIRMATION MODAL - Reusing ConfirmDeleteModal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        title="¿Eliminar propuesta?"
        message={`Estás a punto de eliminar la propuesta para "${deletingItem?.cliente || deletingItem?.slug || ""}". Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isProcessing={isDeleting}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
