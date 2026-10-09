import { useState, useEffect } from "react";
import { Users, RefreshCw, UserPlus, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getClientes,
  createCliente,
  deleteCliente,
  getCalendariosByCliente,
  createCalendario,
  deleteCalendario,
  generateSlug,
  formatCalendarUrlPath,
  createDraftPlaceholderPosts
} from "@/services/calendarService";

import MediaGallery from "@/components/dashboard/MediaGallery";
import ScheduledPostsList from "@/components/dashboard/ScheduledPostsList";

import ClientListSidebar from "./ClientListSidebar";
import ClientCalendarsGrid from "./ClientCalendarsGrid";
import CreateClientModal from "./CreateClientModal";
import CreateCalendarModal from "./CreateCalendarModal";
import ActiveCalendarHeader from "./ActiveCalendarHeader";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

const TIPO_CONTENIDO_OPTIONS = [
  "Reels",
  "Carruseles",
  "Fotos / Estáticos",
  "Historias / Stories"
];

const PLATAFORMAS_OPTIONS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "LinkedIn",
  "YouTube"
];

/**
 * ClientsCalendarSection
 * Main orchestrator container component for managing clients, their content calendars,
 * and navigating active calendar media galleries and scheduled posts.
 */
export default function ClientsCalendarSection() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const [calendarios, setCalendarios] = useState([]);
  const [loadingCalendarios, setLoadingCalendarios] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [calendarSubTab, setCalendarSubTab] = useState("posts"); // 'posts' | 'gallery'
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const handlePostUpdated = () => setGalleryRefreshKey((prev) => prev + 1);

  // Modals state
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Form states - Client
  const [clientForm, setClientForm] = useState({ nombre: "", empresa: "", email: "" });
  const [isSavingClient, setIsSavingClient] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Eliminar",
    onConfirm: null,
    isProcessing: false
  });

  // Form states - Calendar
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const DEFAULT_CALENDAR_FORM = {
    nombre: "",
    mes: currentMonth,
    anio: currentYear,
    slug: "",
    tiposSeleccionados: ["Reels", "Carruseles"],
    plataformasSeleccionadas: ["Instagram", "Facebook"],
    cantReels: 4,
    cantCarruseles: 4,
    isSlugModified: false
  };

  const [calendarForm, setCalendarForm] = useState(DEFAULT_CALENDAR_FORM);
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const openNewCalendarModal = () => {
    if (!selectedCliente) {
      toast.error("Por favor crea o selecciona un cliente primero.");
      return;
    }
    setCalendarForm({ ...DEFAULT_CALENDAR_FORM });
    setShowCalendarModal(true);
  };

  const toggleTipoContenido = (tipo) => {
    setCalendarForm((prev) => {
      const list = prev.tiposSeleccionados || [];
      const exists = list.includes(tipo);
      const updated = exists ? list.filter((t) => t !== tipo) : [...list, tipo];
      return { ...prev, tiposSeleccionados: updated };
    });
  };

  const togglePlataforma = (plat) => {
    setCalendarForm((prev) => {
      const list = prev.plataformasSeleccionadas || [];
      const exists = list.includes(plat);
      const updated = exists ? list.filter((p) => p !== plat) : [...list, plat];
      return { ...prev, plataformasSeleccionadas: updated };
    });
  };

  // Load clients
  const loadClientes = async (preserveSelectedId = null) => {
    setLoadingClientes(true);
    const res = await getClientes();
    if (res.success) {
      const list = res.data || [];
      setClientes(list);
      if (list.length > 0) {
        if (preserveSelectedId) {
          const found = list.find((c) => c.id === preserveSelectedId);
          setSelectedCliente(found || list[0]);
        } else if (!selectedCliente) {
          setSelectedCliente(list[0]);
        }
      } else {
        setSelectedCliente(null);
      }
    } else {
      toast.error(res.error || "No se pudieron cargar los clientes");
    }
    setLoadingClientes(false);
  };

  // Load calendars for selected client
  const loadCalendarios = async (clienteId) => {
    if (!clienteId) {
      setCalendarios([]);
      return;
    }
    setLoadingCalendarios(true);
    const res = await getCalendariosByCliente(clienteId);
    if (res.success) {
      setCalendarios(res.data || []);
    } else {
      toast.error(res.error || "Error al cargar los calendarios");
    }
    setLoadingCalendarios(false);
  };

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente?.id) {
      loadCalendarios(selectedCliente.id);
    } else {
      setCalendarios([]);
    }
  }, [selectedCliente]);

  // Create Client Submit
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!clientForm.nombre.trim()) {
      toast.error("Por favor ingresa el nombre del cliente.");
      return;
    }

    setIsSavingClient(true);
    const res = await createCliente(clientForm);
    if (res.success) {
      toast.success(`Cliente "${clientForm.nombre}" creado exitosamente.`);
      setClientForm({ nombre: "", empresa: "", email: "" });
      setShowClientModal(false);
      await loadClientes(res.data?.id);
    } else {
      toast.error(res.error || "No se pudo crear el cliente.");
    }
    setIsSavingClient(false);
  };

  // Create Calendar Submit
  const handleSaveCalendar = async (e) => {
    e.preventDefault();
    if (!selectedCliente) {
      toast.error("Selecciona un cliente primero.");
      return;
    }
    if (!calendarForm.nombre.trim()) {
      toast.error("Por favor ingresa el nombre del calendario.");
      return;
    }

    setIsSavingCalendar(true);

    const strTipo =
      calendarForm.tiposSeleccionados.length > 0
        ? calendarForm.tiposSeleccionados.join(" y ")
        : "Reels y Carruseles";

    const strPlataformas =
      calendarForm.plataformasSeleccionadas.length > 0
        ? calendarForm.plataformasSeleccionadas.join(" y ")
        : "Instagram y Facebook";

    const res = await createCalendario({
      cliente_id: selectedCliente.id,
      clienteNombre: selectedCliente.nombre,
      nombre: calendarForm.nombre,
      mes: Number(calendarForm.mes),
      anio: Number(calendarForm.anio),
      slug: calendarForm.slug,
      tipo_contenido: strTipo,
      plataformas: strPlataformas
    });

    if (res.success && res.data?.id) {
      const draftRes = await createDraftPlaceholderPosts({
        calendarioId: res.data.id,
        cantReels: Number(calendarForm.cantReels) || 0,
        cantCarruseles: Number(calendarForm.cantCarruseles) || 0,
        mes: calendarForm.mes,
        anio: calendarForm.anio
      });

      const count = draftRes.count || 0;
      toast.success(
        `Calendario "${calendarForm.nombre}" creado con éxito con ${count} cajas vacías iniciales.`
      );

      setCalendarForm({
        nombre: "",
        mes: currentMonth,
        anio: currentYear,
        slug: "",
        tiposSeleccionados: ["Reels", "Carruseles"],
        plataformasSeleccionadas: ["Instagram", "Facebook"],
        cantReels: 4,
        cantCarruseles: 4,
        isSlugModified: false
      });
      setShowCalendarModal(false);
      loadCalendarios(selectedCliente.id);
    } else {
      toast.error(res.error || "No se pudo crear el calendario.");
    }
    setIsSavingCalendar(false);
  };

  // Auto-generate slug as calendar name changes with client prefix
  const handleCalendarNameChange = (e) => {
    const val = e.target.value;
    const clientPrefix = selectedCliente?.nombre ? generateSlug(selectedCliente.nombre) : "";
    const calSlug = generateSlug(val);
    const combinedSlug =
      clientPrefix && calSlug && !calSlug.startsWith(clientPrefix)
        ? `${clientPrefix}-${calSlug}`
        : calSlug;

    setCalendarForm((prev) => ({
      ...prev,
      nombre: val,
      slug: prev.isSlugModified ? prev.slug : combinedSlug
    }));
  };

  // Delete Client Confirmation
  const handleDeleteClient = (clientItem, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `¿Eliminar cliente "${clientItem.nombre}"?`,
      message: `Esta acción eliminará permanentemente al cliente "${clientItem.nombre}" y todos sus calendarios de contenido asociados.`,
      confirmText: "Eliminar Cliente",
      isProcessing: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
        setDeletingId(clientItem.id);
        const res = await deleteCliente(clientItem.id);
        if (res.success) {
          toast.success(`Cliente "${clientItem.nombre}" eliminado.`);
          if (selectedCliente?.id === clientItem.id) {
            setSelectedCliente(null);
          }
          loadClientes();
        } else {
          toast.error(res.error || "Error al eliminar el cliente.");
        }
        setDeletingId(null);
        setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Eliminar", onConfirm: null, isProcessing: false });
      }
    });
  };

  // Delete Calendar Confirmation
  const handleDeleteCalendar = (calId, calNombre, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `¿Eliminar calendario "${calNombre}"?`,
      message: `Estás a punto de eliminar el calendario "${calNombre}". Se eliminarán sus publicaciones y se liberarán sus archivos en galería.`,
      confirmText: "Eliminar Calendario",
      isProcessing: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
        const res = await deleteCalendario(calId);
        if (res.success) {
          toast.success(`Calendario "${calNombre}" eliminado.`);
          if (selectedCliente?.id) {
            loadCalendarios(selectedCliente.id);
          }
        } else {
          toast.error(res.error || "Error al eliminar calendario.");
        }
        setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Eliminar", onConfirm: null, isProcessing: false });
      }
    });
  };

  // Copy Calendar Link
  const copyCalendarLink = (slug) => {
    const path = formatCalendarUrlPath(slug, selectedCliente?.nombre);
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("Enlace del calendario copiado al portapapeles.");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (activeCalendar) {
    return (
      <div className="space-y-6 font-inter">
        <ActiveCalendarHeader
          activeCalendar={activeCalendar}
          selectedCliente={selectedCliente}
          calendarSubTab={calendarSubTab}
          copiedSlug={copiedSlug}
          onBack={() => setActiveCalendar(null)}
          onCopyCalendarLink={copyCalendarLink}
          onSetSubTab={setCalendarSubTab}
        />

        {calendarSubTab === "posts" ? (
          <ScheduledPostsList
            calendarioId={activeCalendar.id}
            calendarioNombre={activeCalendar.nombre}
            calendarioSlug={activeCalendar.slug}
            calendarioMes={activeCalendar.mes}
            calendarioAnio={activeCalendar.anio}
            tipoContenido={activeCalendar.tipo_contenido}
            plataformas={activeCalendar.plataformas}
            onPostUpdated={handlePostUpdated}
          />
        ) : (
          <div className="space-y-8">
            <MediaGallery
              refreshTrigger={galleryRefreshKey}
              calendarioId={activeCalendar.id}
              calendarioNombre={activeCalendar.nombre}
            />
            <ScheduledPostsList
              calendarioId={activeCalendar.id}
              calendarioNombre={activeCalendar.nombre}
              calendarioSlug={activeCalendar.slug}
              calendarioMes={activeCalendar.mes}
              calendarioAnio={activeCalendar.anio}
              tipoContenido={activeCalendar.tipo_contenido}
              plataformas={activeCalendar.plataformas}
              forceViewMode="list"
              hideViewModeSwitcher={true}
              showOnlyDrafts={true}
              onPostUpdated={handlePostUpdated}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter">
      {/* Top Header Card */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs mb-2 font-sora">
            <Users className="w-4 h-4" />
            <span>FASE 2 • GESTIÓN DE CONTENIDOS</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 font-sora tracking-tight">
            Clientes y <span className="text-brand-blue">Calendarios</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
            Organiza tus clientes y gestiona sus calendarios de contenido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadClientes(selectedCliente?.id)}
            className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loadingClientes || loadingCalendarios ? "animate-spin text-pink-500" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowClientModal(true)}
            className="h-11 px-5 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-pink-400" />
            Nuevo Cliente
          </button>

          <button
            type="button"
            onClick={openNewCalendarModal}
            disabled={!selectedCliente}
            className="h-11 px-6 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            Nuevo Calendario
          </button>
        </div>
      </div>

      {/* Main Grid: Client Sidebar + Calendars Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <ClientListSidebar
          clientes={clientes}
          loadingClientes={loadingClientes}
          selectedCliente={selectedCliente}
          deletingId={deletingId}
          onSelectClient={setSelectedCliente}
          onOpenClientModal={() => setShowClientModal(true)}
          onDeleteClient={handleDeleteClient}
        />

        <ClientCalendarsGrid
          selectedCliente={selectedCliente}
          calendarios={calendarios}
          loadingCalendarios={loadingCalendarios}
          copiedSlug={copiedSlug}
          onOpenCalendarModal={openNewCalendarModal}
          onDeleteCalendar={handleDeleteCalendar}
          onCopyCalendarLink={copyCalendarLink}
          onSelectActiveCalendar={setActiveCalendar}
        />
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        clientForm={clientForm}
        setClientForm={setClientForm}
        onSubmit={handleSaveClient}
        isSaving={isSavingClient}
      />

      <CreateCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        selectedCliente={selectedCliente}
        calendarForm={calendarForm}
        setCalendarForm={setCalendarForm}
        onSubmit={handleSaveCalendar}
        isSaving={isSavingCalendar}
        onNameChange={handleCalendarNameChange}
        toggleTipoContenido={toggleTipoContenido}
        togglePlataforma={togglePlataforma}
        monthNames={MONTH_NAMES}
        tipoOptions={TIPO_CONTENIDO_OPTIONS}
        plataformaOptions={PLATAFORMAS_OPTIONS}
      />

      <ConfirmDeleteModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isProcessing={confirmModal.isProcessing}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            confirmText: "Eliminar",
            onConfirm: null,
            isProcessing: false
          })
        }
        onConfirm={() => confirmModal.onConfirm && confirmModal.onConfirm()}
      />
    </div>
  );
}
