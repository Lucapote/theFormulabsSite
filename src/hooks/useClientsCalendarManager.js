import { useState, useEffect } from "react";
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
  createDraftPlaceholderPosts,
  updateClientDownloadPermission
} from "@/services/calendarService";
import { ensureCicloActual } from "@/services/operationsService";
import { useWindowFocusRefresh } from "@/hooks/useWindowFocusRefresh";

const DEFAULT_CLIENT_FORM = {
  nombre: "",
  empresa: "",
  email: "",
  locacion_default: "",
  permite_descarga: false,
  monto_retainer: "",
  esquema_pago: "mensual",
  dia_corte_pago: 1,
  dia_corte_pago_2: 15,
  tipo_sesion_default: "organica",
  producciones_por_mes: 1
};

export function useClientsCalendarManager({
  initialClienteId = null,
  initialCalendarId = null,
  onClearInitial = null
}) {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const [calendarios, setCalendarios] = useState([]);
  const [loadingCalendarios, setLoadingCalendarios] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [calendarSubTab, setCalendarSubTab] = useState("posts");
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const [showClientModal, setShowClientModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [clientForm, setClientForm] = useState(DEFAULT_CLIENT_FORM);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Eliminar",
    onConfirm: null,
    isProcessing: false
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const DEFAULT_CALENDAR_FORM = {
    nombre: "",
    mes: currentMonth,
    anio: currentYear,
    slug: "",
    tiposSeleccionados: ["Reels", "Carruseles"],
    plataformasSeleccionadas: ["Instagram", "Facebook"],
    permite_descarga: null,
    isNameModified: false,
    isSlugModified: false
  };

  const [calendarForm, setCalendarForm] = useState(DEFAULT_CALENDAR_FORM);
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handlePostUpdated = () => setGalleryRefreshKey((prev) => prev + 1);

  const handleOpenClientModal = () => {
    setClientForm({ ...DEFAULT_CLIENT_FORM });
    setShowClientModal(true);
  };

  const handleCloseClientModal = () => {
    setClientForm({ ...DEFAULT_CLIENT_FORM });
    setShowClientModal(false);
  };

  const openNewCalendarModal = (clienteOverride = null) => {
    const target = clienteOverride || selectedCliente;
    if (!target) {
      toast.error("Por favor crea o selecciona un cliente primero.");
      return;
    }
    if (clienteOverride) {
      setSelectedCliente(clienteOverride);
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
    loadClientes(initialClienteId);
  }, [initialClienteId]);

  useWindowFocusRefresh(() => {
    loadClientes(selectedCliente?.id);
  }, { minIntervalMs: 8000 });

  useEffect(() => {
    if (selectedCliente?.id) {
      loadCalendarios(selectedCliente.id);
    } else {
      setCalendarios([]);
    }
  }, [selectedCliente]);

  useEffect(() => {
    if (initialClienteId && clientes.length > 0) {
      const foundClient = clientes.find((c) => c.id === initialClienteId);
      if (foundClient && foundClient.id !== selectedCliente?.id) {
        setSelectedCliente(foundClient);
      }
    }
  }, [initialClienteId, clientes]);

  useEffect(() => {
    if (initialCalendarId && calendarios.length > 0) {
      const foundCal = calendarios.find((cal) => cal.id === initialCalendarId);
      if (foundCal) {
        setActiveCalendar(foundCal);
        if (onClearInitial) onClearInitial();
      }
    }
  }, [initialCalendarId, calendarios, onClearInitial]);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!clientForm.nombre.trim()) {
      toast.error("Por favor ingresa el nombre del cliente.");
      return;
    }

    setIsSavingClient(true);
    const res = await createCliente(clientForm);
    if (res.success) {
      const nuevoCliente = res.data;
      const now = new Date();
      await ensureCicloActual(
        nuevoCliente.id,
        now.getMonth() + 1,
        now.getFullYear(),
        Number(clientForm.monto_retainer) || 0,
        Number(clientForm.producciones_por_mes) || 1,
        clientForm.tipo_sesion_default || "organica",
        clientForm.locacion_default?.trim() || null
      );

      toast.success(`Cliente "${clientForm.nombre}" creado exitosamente.`, {
        action: {
          label: "Crear Calendario",
          onClick: () => openNewCalendarModal(nuevoCliente)
        }
      });
      handleCloseClientModal();
      await loadClientes(nuevoCliente?.id);
    } else {
      toast.error(res.error || "No se pudo crear el cliente.");
    }
    setIsSavingClient(false);
  };

  const handleToggleDownloadPermission = async (clienteToUpdate) => {
    if (!clienteToUpdate?.id) return;
    const nextStatus = !clienteToUpdate.permite_descarga;

    const prevList = [...clientes];
    const prevSelected = selectedCliente ? { ...selectedCliente } : null;
    const prevActive = activeCalendar ? { ...activeCalendar } : null;

    setClientes((prev) =>
      prev.map((c) => (c.id === clienteToUpdate.id ? { ...c, permite_descarga: nextStatus } : c))
    );
    if (selectedCliente?.id === clienteToUpdate.id) {
      setSelectedCliente((prev) => ({ ...prev, permite_descarga: nextStatus }));
    }
    if (activeCalendar?.cliente?.id === clienteToUpdate.id || activeCalendar?.cliente_id === clienteToUpdate.id) {
      setActiveCalendar((prev) =>
        prev
          ? {
              ...prev,
              cliente: prev.cliente ? { ...prev.cliente, permite_descarga: nextStatus } : prev.cliente
            }
          : prev
      );
    }

    const res = await updateClientDownloadPermission(clienteToUpdate.id, nextStatus);
    if (res.success) {
      toast.success(
        nextStatus
          ? "Permisos de descarga actualizados: Activadas"
          : "Permisos de descarga actualizados: Inactivas"
      );
    } else {
      setClientes(prevList);
      setSelectedCliente(prevSelected);
      setActiveCalendar(prevActive);
      toast.error(res.error || "No se pudieron actualizar los permisos de descarga.");
    }
  };

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
      plataformas: strPlataformas,
      permite_descarga: calendarForm.permite_descarga !== undefined ? calendarForm.permite_descarga : null
    });

    if (res.success && res.data?.id) {
      if (Number(calendarForm.cantReels) > 0 || Number(calendarForm.cantCarruseles) > 0) {
        await createDraftPlaceholderPosts({
          calendarioId: res.data.id,
          cantReels: Number(calendarForm.cantReels) || 0,
          cantCarruseles: Number(calendarForm.cantCarruseles) || 0,
          mes: calendarForm.mes,
          anio: calendarForm.anio
        });
      }

      toast.success(`Calendario "${calendarForm.nombre}" creado con éxito.`);
      setCalendarForm({ ...DEFAULT_CALENDAR_FORM });
      setShowCalendarModal(false);
      loadCalendarios(selectedCliente.id);
    } else {
      toast.error(res.error || "No se pudo crear el calendario.");
    }
    setIsSavingCalendar(false);
  };

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

  const copyCalendarLink = (slug) => {
    const path = formatCalendarUrlPath(slug, selectedCliente?.nombre);
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("Enlace del calendario copiado al portapapeles.");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return {
    clientes,
    loadingClientes,
    selectedCliente,
    setSelectedCliente,
    calendarios,
    loadingCalendarios,
    activeCalendar,
    setActiveCalendar,
    calendarSubTab,
    setCalendarSubTab,
    galleryRefreshKey,
    handlePostUpdated,
    showClientModal,
    setShowClientModal,
    showCalendarModal,
    setShowCalendarModal,
    clientForm,
    setClientForm,
    isSavingClient,
    editingClient,
    setEditingClient,
    calendarForm,
    setCalendarForm,
    isSavingCalendar,
    copiedSlug,
    deletingId,
    confirmModal,
    setConfirmModal,
    loadClientes,
    handleOpenClientModal,
    handleCloseClientModal,
    openNewCalendarModal,
    toggleTipoContenido,
    togglePlataforma,
    handleSaveClient,
    handleToggleDownloadPermission,
    handleSaveCalendar,
    handleCalendarNameChange,
    handleDeleteClient,
    handleDeleteCalendar,
    copyCalendarLink
  };
}

