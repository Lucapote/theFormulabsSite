import { useState, useEffect } from "react";
import {
  Users,
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Building2,
  Mail,
  Sparkles,
  ChevronRight,
  UserPlus,
  Film,
  ArrowLeft,
  X
} from "lucide-react";
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

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Eliminar",
    onConfirm: null,
    isProcessing: false,
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

  const openNewCalendarModal = () => {
    if (!selectedCliente) {
      toast.error("Por favor crea o selecciona un cliente primero.");
      return;
    }
    setCalendarForm({ ...DEFAULT_CALENDAR_FORM });
    setShowCalendarModal(true);
  };

  // Helper toggle functions for check options
  const toggleTipoContenido = (tipo) => {
    setCalendarForm((prev) => {
      const list = prev.tiposSeleccionados || [];
      const exists = list.includes(tipo);
      const updated = exists
        ? list.filter((t) => t !== tipo)
        : [...list, tipo];
      return { ...prev, tiposSeleccionados: updated };
    });
  };

  const togglePlataforma = (plat) => {
    setCalendarForm((prev) => {
      const list = prev.plataformasSeleccionadas || [];
      const exists = list.includes(plat);
      const updated = exists
        ? list.filter((p) => p !== plat)
        : [...list, plat];
      return { ...prev, plataformasSeleccionadas: updated };
    });
  };

  const [copiedSlug, setCopiedSlug] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

    const strTipo = calendarForm.tiposSeleccionados.length > 0
      ? calendarForm.tiposSeleccionados.join(" y ")
      : "Reels y Carruseles";

    const strPlataformas = calendarForm.plataformasSeleccionadas.length > 0
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
      // Automatic generation of placeholder empty boxes
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
    const combinedSlug = clientPrefix && calSlug && !calSlug.startsWith(clientPrefix)
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
      },
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
      },
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
        {/* Navigation Bar inside Active Calendar */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveCalendar(null)}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
              title="Volver al listado de calendarios"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 uppercase tracking-widest px-3 py-0.5 rounded-full mb-1">
                CALENDARIO ACTIVO
              </span>
              <h2 className="text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
                {activeCalendar.nombre}
              </h2>
            </div>
          </div>

          {/* Sub Tab Switcher Pills & Share Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => copyCalendarLink(activeCalendar.slug)}
              className="h-9 sm:h-10 px-3 sm:px-4 bg-pink-50 hover:bg-pink-100 text-pink-600 font-sora font-bold text-xs rounded-full border border-pink-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedSlug === activeCalendar.slug ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" /> <span className="hidden sm:inline">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-pink-500" /> <span className="hidden sm:inline">Copiar Enlace</span><span className="sm:hidden">Enlace</span>
                </>
              )}
            </button>

            <a
              href={`/calendario/${activeCalendar.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 sm:h-10 px-3 sm:px-3.5 bg-blue-50 hover:bg-blue-100 text-brand-blue font-sora font-bold text-xs rounded-full border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Abrir vista pública del cliente"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ver Vista Pública</span><span className="sm:hidden">Ver</span>
            </a>

            <button
              onClick={() => setCalendarSubTab("posts")}
              className={`py-2.5 px-5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                calendarSubTab === "posts"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-pink-400" />
              Calendario
            </button>
            <button
              onClick={() => setCalendarSubTab("gallery")}
              className={`py-2.5 px-5 rounded-full font-sora text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                calendarSubTab === "gallery"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Film className="w-4 h-4 text-brand-blue" />
              Galeria
            </button>
          </div>
        </div>

        {/* Content render based on sub-tab */}
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
      {/* Top Header Card for Clients & Calendars */}
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
            onClick={() => loadClientes(selectedCliente?.id)}
            className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingClientes || loadingCalendarios ? "animate-spin text-pink-500" : ""}`} />
          </button>

          <button
            onClick={() => setShowClientModal(true)}
            className="h-11 px-5 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-pink-400" />
            Nuevo Cliente
          </button>

          <button
            onClick={openNewCalendarModal}
            disabled={!selectedCliente}
            className="h-11 px-6 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            Nuevo Calendario
          </button>
        </div>
      </div>

      {/* Main Grid: Client Selection Sidebar + Calendars Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CLIENTS LIST SIDEBAR */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-sora font-bold text-gray-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-500" />
              Directorio de Clientes ({clientes.length})
            </h3>
            <button
              onClick={() => setShowClientModal(true)}
              className="p-1.5 rounded-full hover:bg-pink-50 text-pink-600 transition-all"
              title="Agregar cliente"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {loadingClientes ? (
            <div className="p-8 text-center">
              <Sparkles className="w-6 h-6 text-pink-500 animate-spin mx-auto mb-2" />
              <span className="text-xs font-sora font-medium text-gray-500">Cargando clientes...</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-sora font-semibold text-gray-700 mb-1">Sin clientes aún</p>
              <p className="text-[11px] text-gray-500 mb-4">Crea tu primer cliente para asignarle calendarios.</p>
              <button
                onClick={() => setShowClientModal(true)}
                className="h-9 px-4 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Cliente
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {clientes.map((c) => {
                const isSelected = selectedCliente?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCliente(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-pink-50/60 border-pink-300 shadow-xs"
                        : "bg-white border-gray-100 hover:border-pink-200 hover:bg-pink-50/20"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sora font-bold text-sm text-gray-900 truncate">
                          {c.nombre}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                        )}
                      </div>
                      {c.empresa && (
                        <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                          {c.empresa}
                        </p>
                      )}
                      {c.email && (
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                          {c.email}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleDeleteClient(c, e)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "text-pink-500 translate-x-0.5" : "text-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CALENDARS FOR SELECTED CLIENT */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 space-y-6">
          {selectedCliente ? (
            <>
              {/* Active Client Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 uppercase tracking-widest px-3 py-1 rounded-full mb-1">
                    CLIENTE SELECCIONADO
                  </span>
                  <h3 className="text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
                    {selectedCliente.nombre}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
                    {selectedCliente.empresa && (
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-pink-400" />
                        {selectedCliente.empresa}
                      </span>
                    )}
                    {selectedCliente.email && (
                      <span className="flex items-center gap-1 font-mono text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-brand-blue" />
                        {selectedCliente.email}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={openNewCalendarModal}
                  className="h-10 px-5 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-md shadow-pink-100 transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Crear Calendario
                </button>
              </div>

              {/* Calendars List / Table */}
              <div>
                <h4 className="font-sora font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-brand-blue" />
                  Calendarios Creados ({calendarios.length})
                </h4>

                {loadingCalendarios ? (
                  <div className="p-12 text-center bg-gray-50 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-pink-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-sora font-bold text-gray-600">Cargando calendarios...</p>
                  </div>
                ) : calendarios.length === 0 ? (
                  <div className="p-10 text-center bg-gray-50 rounded-[1.5rem] border border-dashed border-gray-200">
                    <CalendarIcon className="w-10 h-10 text-pink-300 mx-auto mb-3" />
                    <h5 className="font-sora font-bold text-gray-900 text-base mb-1">
                      Sin calendarios asignados
                    </h5>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                      Este cliente aún no tiene un calendario editorial creado. ¡Crea el primero ahora!
                    </p>
                    <button
                      onClick={openNewCalendarModal}
                      className="h-10 px-6 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-md inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Crear Primer Calendario
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calendarios.map((cal) => (
                      <div
                        key={cal.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-sora font-bold text-gray-900 text-base group-hover:text-pink-600 transition-colors">
                              {cal.nombre}
                            </h5>
                            <button
                              onClick={(e) => handleDeleteCalendar(cal.id, cal.nombre, e)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              title="Eliminar calendario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-sora font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                              <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
                              {MONTH_NAMES[(cal.mes || 1) - 1]} {cal.anio}
                            </span>
                            <span className="inline-block font-mono text-[11px] font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full">
                              {formatCalendarUrlPath(cal.slug, selectedCliente?.nombre)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                          <button
                            onClick={() => copyCalendarLink(cal.slug)}
                            className="h-8 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-xs font-sora font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {copiedSlug === cal.slug ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>{copiedSlug === cal.slug ? "Copiado" : "Copiar"}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveCalendar(cal)}
                              className="h-8 px-3.5 bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              title="Gestionar galería de medios"
                            >
                              <Film className="w-3.5 h-3.5 shrink-0" />
                              <span>Posts</span>
                            </button>

                            <a
                              href={formatCalendarUrlPath(cal.slug, selectedCliente?.nombre)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-3 bg-blue-50 hover:bg-[#188ff0] text-[#188ff0] hover:text-white rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Ver</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-sora font-bold text-gray-700 text-base mb-1">
                Selecciona un cliente
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Elige un cliente del directorio a la izquierda para administrar y crear sus calendarios de contenido.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CREAR CLIENTE */}
      {showClientModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-x-hidden">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full max-w-[calc(100vw-1.5rem)] mx-auto shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-sora font-bold text-gray-900 text-lg">
                  Nuevo Cliente
                </h3>
              </div>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Nombre del Cliente / Marca *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clínica Aurora"
                  value={clientForm.nombre}
                  onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Empresa / Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej. Aurora Health Group S.A."
                  value={clientForm.empresa}
                  onChange={(e) => setClientForm({ ...clientForm, empresa: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  placeholder="Ej. contacto@clinicaaurora.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingClient}
                  className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  {isSavingClient ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar Cliente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR CALENDARIO */}
      {showCalendarModal && selectedCliente && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-x-hidden">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-w-[calc(100vw-1.5rem)] mx-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] relative">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
                  <CalendarIcon className="w-5 h-5 text-[#188ff0]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-gray-900 text-lg md:text-xl tracking-tight leading-tight">
                    Nuevo Calendario
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Cliente: <strong className="text-gray-900 font-bold">{selectedCliente.nombre}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-700 font-bold p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="calendar-form" onSubmit={handleSaveCalendar} className="p-6 md:p-8 space-y-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Nombre del Calendario *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Campaña Noviembre 2026"
                  value={calendarForm.nombre}
                  onChange={handleCalendarNameChange}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                    Mes
                  </label>
                  <select
                    value={calendarForm.mes}
                    onChange={(e) => setCalendarForm({ ...calendarForm, mes: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium bg-white transition-all cursor-pointer"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                    Año
                  </label>
                  <select
                    value={calendarForm.anio}
                    onChange={(e) => setCalendarForm({ ...calendarForm, anio: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 font-medium bg-white transition-all cursor-pointer"
                  >
                    {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TIPO DE CONTENIDO (CHECK OPTIONS) */}
              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Tipo de Contenido *
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIPO_CONTENIDO_OPTIONS.map((tipo) => {
                    const isChecked = (calendarForm.tiposSeleccionados || []).includes(tipo);
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => toggleTipoContenido(tipo)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? "bg-pink-50 border-pink-300 text-pink-600 shadow-2xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isChecked ? "bg-pink-500 text-white" : "border border-gray-300 bg-white"
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </span>
                        <span>{tipo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PLATAFORMAS (CHECK OPTIONS) */}
              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Plataformas *
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATAFORMAS_OPTIONS.map((plat) => {
                    const isChecked = (calendarForm.plataformasSeleccionadas || []).includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => togglePlataforma(plat)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-sora font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? "bg-blue-50 border-blue-300 text-brand-blue shadow-2xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isChecked ? "bg-brand-blue text-white" : "border border-gray-300 bg-white"
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </span>
                        <span>{plat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PUBLICACIONES INICIALES / CAJAS VACÍAS */}
              <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-sora font-bold text-xs">
                  <Film className="w-4 h-4 text-brand-blue" />
                  <span>Borradores Iniciales</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Define cuántos borrradores quieres generar automáticamente para este mes (listas para subir medios y escribir copy):
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-sora font-bold text-gray-700 mb-1">
                      Cantidad de Reels:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0"
                      value={calendarForm.cantReels}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCalendarForm({
                          ...calendarForm,
                          cantReels: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
                        });
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-blue outline-none text-xs font-sora font-bold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sora font-bold text-gray-700 mb-1">
                      Cantidad de Carruseles:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0"
                      value={calendarForm.cantCarruseles}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCalendarForm({
                          ...calendarForm,
                          cantCarruseles: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
                        });
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-brand-blue outline-none text-xs font-sora font-bold text-gray-900 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
                  Slug Personalizado (URL pública)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400">
                    /{selectedCliente ? generateSlug(selectedCliente.nombre) : "cliente"}/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="octubre-2026"
                    value={
                      calendarForm.slug.startsWith(generateSlug(selectedCliente?.nombre || "") + "-")
                        ? calendarForm.slug.replace(generateSlug(selectedCliente?.nombre || "") + "-", "")
                        : calendarForm.slug
                    }
                    onChange={(e) => {
                      const clientPrefix = selectedCliente?.nombre ? generateSlug(selectedCliente.nombre) : "";
                      const calSlug = generateSlug(e.target.value);
                      const combined = clientPrefix ? `${clientPrefix}-${calSlug}` : calSlug;
                      setCalendarForm({
                        ...calendarForm,
                        slug: combined,
                        isSlugModified: true
                      });
                    }}
                    className="w-full h-11 pl-32 pr-4 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono text-pink-600 transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Enlace público de acceso: <code>theformulab.io{formatCalendarUrlPath(calendarForm.slug || "octubre-2026", selectedCliente?.nombre)}</code>
                </p>
              </div>
            </form>

            {/* Fixed Action Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 md:px-8 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="calendar-form"
                disabled={isSavingCalendar}
                className="h-11 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {isSavingCalendar ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Creando...
                  </>
                ) : (
                  "Crear Calendario"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL OVERLAY */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-sora font-extrabold text-gray-900">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Eliminar", onConfirm: null, isProcessing: false })}
                disabled={confirmModal.isProcessing}
                className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                disabled={confirmModal.isProcessing}
                className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs shadow-md shadow-red-200 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {confirmModal.isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmModal.confirmText}</span>
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
