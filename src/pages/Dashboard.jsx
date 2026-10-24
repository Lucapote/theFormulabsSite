import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, FileText, BarChart2, Users, Clapperboard, ChevronDown, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PROPOSAL_TEMPLATE as defaultTemplate } from "@/data/proposalData";
import { formatPriceLabel, formatAddonLabel } from "@/utils/formatters";
import {
  fetchProposals,
  createProposal,
  updateProposal
} from "@/services/proposalService";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import ProposalModal from "@/components/dashboard/proposals/ProposalModal";
import ClientsCalendarSection from "@/components/dashboard/calendar/ClientsCalendarSection";
import ProposalsTabSection from "@/components/dashboard/proposals/ProposalsTabSection";
import DiagnosticsTabSection from "@/components/dashboard/diagnostics/DiagnosticsTabSection";
import OperationsTabSection from "@/components/dashboard/operations/OperationsTabSection";
import BankSettingsModal from "@/components/dashboard/common/BankSettingsModal";
import { useWindowFocusRefresh } from "@/hooks/useWindowFocusRefresh";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("proposals");
  const [showBankModal, setShowBankModal] = useState(false);

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

  // Conteo de propuestas reales (expedientes raíz) excluyendo versiones iteradas
  const totalPropuestasReales = useMemo(() => {
    return (proposals || []).filter((p) => !p.propuesta_padre_id).length;
  }, [proposals]);

  // Conteo reactivo de leads pendientes/nuevos sin atender
  const leadsPendientesCount = useMemo(() => {
    return (diagnostics || []).filter((d) => d.status === "nuevo").length;
  }, [diagnostics]);

  // Load diagnostics from Supabase (soporta refresco silencioso sin parpadeo)
  const loadDiagnostics = useCallback(async (isSilent = false) => {
    if (!supabase) return;
    if (!isSilent) setLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id, status")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDiagnostics(data || []);
      }
    } catch (err) {
      console.error("Error loading diagnostics:", err);
    } finally {
      if (!isSilent) setLoadingDb(false);
    }
  }, []);

  // Load proposals using proposalService (soporta refresco silencioso sin parpadeo)
  const loadProposals = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingProposals(true);
    const res = await fetchProposals();
    if (res.success) {
      setProposals(res.data);
    }
    if (!isSilent) setLoadingProposals(false);
  }, []);

  useEffect(() => {
    loadDiagnostics();
    loadProposals();
  }, [loadDiagnostics, loadProposals]);

  // Sincronización en tiempo real para conteo global de leads/diagnósticos en tabs
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("dashboard-leads-count-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const nuevo = payload.new;
          setDiagnostics((prev) => [nuevo, ...prev.filter((d) => d.id !== nuevo.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => {
          const actualizado = payload.new;
          setDiagnostics((prev) =>
            prev.map((d) => (d.id === actualizado.id ? { ...d, ...actualizado } : d))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "leads" },
        (payload) => {
          const eliminado = payload.old;
          setDiagnostics((prev) => prev.filter((d) => d.id !== eliminado.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sincronización pasiva sin parpadeo de pantalla al recuperar el foco
  useWindowFocusRefresh(() => {
    loadDiagnostics(true);
    loadProposals(true);
  }, { minIntervalMs: 8000 });

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

    const existingScope = existingContent.scope || {};
    const existingPricing = existingContent.pricing || {};

    const scope = {
      producciones_por_mes: Number(formData.produccionesPorMes) || existingScope.producciones_por_mes || 2,
      precio_sesion_extra: Number(formData.precioSesionExtra) || existingScope.precio_sesion_extra || 3500,
      tipo_sesion_default: formData.tipoSesionDefault || existingScope.tipo_sesion_default || "reels_batch"
    };

    const basePrice = Number(formData.priceCrecimiento) || existingPricing.basePrice || 14500;
    const extraSessionsCount = Number(formData.extraSessionsCount !== undefined ? formData.extraSessionsCount : existingPricing.extraSessionsCount) || 0;
    const totalPrice = basePrice + (extraSessionsCount * scope.precio_sesion_extra);

    const pricing = {
      basePrice,
      extraSessionsCount,
      totalPrice
    };

    return {
      ...existingContent,
      token,
      client: {
        ...(existingContent.client || {}),
        name: formData.clientName,
        shortName: formData.shortName || formData.clientName,
        email: formData.email !== undefined ? formData.email : (existingContent.client?.email || ""),
        whatsapp: formData.whatsapp !== undefined ? formData.whatsapp : (existingContent.client?.whatsapp || ""),
        instagram: formData.instagram !== undefined ? formData.instagram : (existingContent.client?.instagram || ""),
        location: formData.location !== undefined ? formData.location : (existingContent.client?.location || ""),
        proposalTitle: formData.proposalTitle || "Propuesta de Contenido",
        greeting: formData.greeting || defaultTemplate.client.greeting,
        vision: formData.vision || defaultTemplate.client.vision
      },
      pricingPlans: updatedPlans,
      addons: updatedAddons,
      scope,
      pricing,
      producciones_por_mes: scope.producciones_por_mes,
      tipo_sesion_default: scope.tipo_sesion_default
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

          <div className="flex items-center gap-2.5 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center h-10 px-3.5 sm:px-4 rounded-full text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs gap-2 transition-all cursor-pointer outline-hidden focus:ring-2 focus:ring-[#188ff0]/20 active:scale-[0.98]"
                >
                  <User className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[200px]">{user?.email}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border border-gray-100 shadow-xl bg-white font-inter">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Cuenta Conectada</span>
                  <span className="text-xs font-semibold text-gray-800 truncate block">{user?.email}</span>
                </div>
                <DropdownMenuItem
                  onClick={() => setShowBankModal(true)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-sora font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#188ff0]" />
                  <span>Datos</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-sora font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            Propuestas ({totalPropuestasReales})
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
            onClick={() => setActiveTab("operaciones")}
            className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "operaciones"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Clapperboard className="w-4 h-4 text-brand-blue" />
            Operaciones
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "diagnostics"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-brand-blue" />
            <span>Diagnósticos</span>
            <span className={activeTab === "diagnostics" ? "text-gray-300 font-normal" : "text-gray-400 font-normal"}>
              ({diagnostics.length})
            </span>
            {leadsPendientesCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#188ff0] text-white rounded-full">
                {leadsPendientesCount}
              </span>
            )}
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
            copiedSlug={copiedSlug}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 3: DIAGNÓSTICOS */}
        {activeTab === "diagnostics" && (
          <DiagnosticsTabSection />
        )}

        {/* TAB 4: OPERACIONES */}
        {activeTab === "operaciones" && (
          <OperationsTabSection setActiveTab={setActiveTab} />
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

      {/* BANK SETTINGS MODAL */}
      <BankSettingsModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
      />
    </div>
  );
}
