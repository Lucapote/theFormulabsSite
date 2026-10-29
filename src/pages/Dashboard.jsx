import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createProposal, updateProposal } from "@/services/proposalService";
import { buildProposalContentJson } from "@/utils/proposalHelpers";
import { useDashboardData } from "@/hooks/useDashboardData";
import ProposalModal from "@/components/dashboard/proposals/ProposalModal";
import ClientsCalendarSection from "@/components/dashboard/calendar/ClientsCalendarSection";
import ProposalsTabSection from "@/components/dashboard/proposals/ProposalsTabSection";
import DiagnosticsTabSection from "@/components/dashboard/diagnostics/DiagnosticsTabSection";
import OperationsTabSection from "@/components/dashboard/operations/OperationsTabSection";
import BankSettingsModal from "@/components/dashboard/common/BankSettingsModal";
import DashboardHeader from "@/components/dashboard/common/DashboardHeader";
import DashboardTabs from "@/components/dashboard/common/DashboardTabs";

/**
 * Dashboard Page
 * Core operational portal for managing proposals, client calendars, operations, and diagnostics.
 * Strictly decoupled under 200 lines per GEMINI.md Rule 4.B and Rule 5.
 */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("proposals");
  const [showBankModal, setShowBankModal] = useState(false);

  // Proposal modal & action controls
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [targetCalendarInfo, setTargetCalendarInfo] = useState(null);

  // Reactive data hook
  const {
    diagnostics,
    loadingDb,
    proposals,
    loadingProposals,
    totalPropuestasReales,
    leadsPendientesCount,
    loadDiagnostics,
    loadProposals
  } = useDashboardData();

  const handleNavigateToCalendar = (clienteId, calendarioId) => {
    setActiveTab("calendars");
    setTargetCalendarInfo({ clienteId, calendarioId });
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada.");
    navigate("/login");
  };

  const handleSaveCreate = async (formData) => {
    if (!formData.slug || !formData.clientName) {
      toast.error("Por favor completa el identificador (slug) y el nombre del cliente.");
      return;
    }
    setIsSaving(true);
    const customContent = buildProposalContentJson(formData);
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

  const handleSaveEdit = async (formData) => {
    if (!formData.id || !formData.clientName) return;
    setIsSaving(true);
    const customContent = buildProposalContentJson(formData);
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
      <DashboardHeader
        user={user}
        onLogout={handleLogout}
        onOpenBankModal={() => setShowBankModal(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onNavigateToCalendar={handleNavigateToCalendar}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        <DashboardTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          totalPropuestasReales={totalPropuestasReales}
          diagnosticsCount={diagnostics.length}
          leadsPendientesCount={leadsPendientesCount}
        />

        {activeTab === "calendars" && (
          <ClientsCalendarSection
            initialClienteId={targetCalendarInfo?.clienteId}
            initialCalendarId={targetCalendarInfo?.calendarioId}
            onClearInitial={() => setTargetCalendarInfo(null)}
          />
        )}

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
            copiedSlug={copiedSlug}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "diagnostics" && <DiagnosticsTabSection />}
        {activeTab === "operaciones" && <OperationsTabSection setActiveTab={setActiveTab} />}
      </main>

      <ProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveCreate}
        title="Crear Nueva Propuesta de Contenido"
        isSaving={isSaving}
      />

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

      <BankSettingsModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
      />
    </div>
  );
}
