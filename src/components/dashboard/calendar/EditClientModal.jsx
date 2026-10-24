import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FileText,
  DollarSign,
  MapPin,
  ExternalLink,
  Clapperboard,
  Download,
  LockKeyhole,
  Facebook,
  Instagram,
  Link2,
  Unlink,
  CheckCircle2
} from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import MetaScannerDialog from "./MetaScannerDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { updateCliente } from "@/services/calendarService";
import { getPaymentSplitOptions, getDefaultFirstPaymentSessions } from "@/utils/bookingHelpers";

/**
 * EditClientModal
 * Modal clínico administrativo para configuración general, financiera y operativa de clientes.
 * Arquitectura estática inspirada en ProposalModal: pestañas superiores ancladas, alto estático
 * y scroll interno sin saltos visuales ni emojis (Clinical High-Tech Lab).
 */
export default function EditClientModal({
  isOpen = false,
  onClose,
  cliente,
  clients = [],
  onClientUpdated
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [isSaving, setIsSaving] = useState(false);
  const [showMetaScanner, setShowMetaScanner] = useState(false);
  const [availableMetaPages, setAvailableMetaPages] = useState([]);
  const [isAssigningPage, setIsAssigningPage] = useState(false);
  const [formData, setFormData] = useState({
    // Tab 1: Info General
    nombre: "",
    empresa: "",
    email: "",
    locacion_default: "",
    // Requisito técnico oculto (Meta IDs gestionados silenciosamente)
    fb_page_id: "",
    fb_page_access_token: "",
    ig_business_account_id: "",
    auto_publish_enabled: false,
    // Tab 2: Retainer y Producción
    monto_retainer: "",
    esquema_pago: "mensual",
    dia_corte_pago: 1,
    dia_corte_pago_2: 15,
    producciones_por_mes: 1,
    sesiones_primer_pago: 1,
    tipo_sesion_default: "organica",
    permite_descarga: false
  });

  useEffect(() => {
    if (cliente && isOpen) {
      setActiveTab("info");
      setAvailableMetaPages([]);
      const totalProds = Number(cliente.producciones_por_mes) || 1;
      setFormData({
        nombre: cliente.nombre || "",
        empresa: cliente.empresa || "",
        email: cliente.email || "",
        locacion_default: cliente.locacion_default || "",
        // Meta IDs (ocultos visualmente en la UI pero mantenidos en el estado)
        fb_page_id: cliente.fb_page_id || "",
        fb_page_access_token: cliente.fb_page_access_token || "",
        ig_business_account_id: cliente.ig_business_account_id || "",
        auto_publish_enabled: Boolean(cliente.auto_publish_enabled),
        // Retainer & Producción
        monto_retainer: cliente.monto_retainer ?? "",
        esquema_pago:
          cliente.esquema_pago === "dos_pagos" || cliente.esquema_pago === "quincenal"
            ? "quincenal"
            : "mensual",
        dia_corte_pago: Number(cliente.dia_corte_pago) || 1,
        dia_corte_pago_2: Number(cliente.dia_corte_pago_2) || 15,
        producciones_por_mes: totalProds,
        sesiones_primer_pago:
          Number(cliente.sesiones_primer_pago) || getDefaultFirstPaymentSessions(totalProds),
        tipo_sesion_default: cliente.tipo_sesion_default || "organica",
        permite_descarga: Boolean(cliente.permite_descarga)
      });
    }
  }, [cliente, isOpen]);

  // Escuchar mensaje emitido por el popup de Meta OAuth (/api/meta-callback)
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      // Evento principal: lista de páginas cargadas para selección
      if (event.data?.type === "META_PAGES_LOADED") {
        const { clientId, pages } = event.data;
        if (clientId && cliente?.id && String(clientId) !== String(cliente.id)) {
          return;
        }

        if (Array.isArray(pages) && pages.length > 0) {
          setAvailableMetaPages(pages);
          toast.info(`Se sincronizaron ${pages.length} páginas. Selecciona cuál pertenece a este cliente.`);
        } else {
          toast.error("No se encontraron páginas de Facebook asociadas.");
        }
        return;
      }

      // Evento de fallback si se asignó directamente desde el backend
      if (event.data?.type === "META_AUTH_SUCCESS") {
        const {
          clientId,
          fb_page_id,
          pageId,
          fb_page_access_token,
          ig_business_account_id,
          instagramId
        } = event.data;
        if (clientId && cliente?.id && String(clientId) !== String(cliente.id)) {
          return;
        }

        const resolvedPageId = fb_page_id || pageId || "";
        const resolvedIgId = ig_business_account_id || instagramId || "";

        setFormData((prev) => ({
          ...prev,
          fb_page_id: resolvedPageId || prev.fb_page_id,
          fb_page_access_token: fb_page_access_token || prev.fb_page_access_token,
          ig_business_account_id: resolvedIgId || prev.ig_business_account_id,
          auto_publish_enabled: true
        }));

        if (onClientUpdated && cliente) {
          onClientUpdated({
            ...cliente,
            fb_page_id: resolvedPageId,
            fb_page_access_token,
            ig_business_account_id: resolvedIgId,
            auto_publish_enabled: true
          });
        }

        toast.success("¡Página de Facebook e Instagram vinculadas con éxito!");
      } else if (event.data?.type === "META_AUTH_ERROR") {
        toast.error(event.data.error || "Error al conectar con Meta.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, cliente, onClientUpdated]);

  if (!cliente) return null;

  const handleOpenMaps = () => {
    const loc = formData.locacion_default.trim();
    if (!loc) return;
    const url = loc.startsWith("http://") || loc.startsWith("https://")
      ? loc
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConnectMetaOAuth = () => {
    const appId = import.meta.env.VITE_META_APP_ID || "1988387095189436";
    const redirectUri = `${window.location.origin}/api/meta-callback`;
    const scopes = [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights"
    ].join(",");

    const width = 600;
    const height = 750;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    // auth_type=rerequest garantiza que Meta vuelva a consultar permisos y muestre todas las páginas
    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${encodeURIComponent(
      cliente.id
    )}&auth_type=rerequest`;

    window.open(
      oauthUrl,
      "MetaAuthPopup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,toolbar=no,menubar=no`
    );
  };

  const handleSelectPageForClient = async (page) => {
    try {
      setIsAssigningPage(true);
      const payload = {
        fb_page_id: page.pageId,
        fb_page_access_token: page.pageAccessToken,
        ig_business_account_id: page.instagramId,
        auto_publish_enabled: true
      };

      const res = await updateCliente(cliente.id, payload);
      setIsAssigningPage(false);

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          ...payload
        }));
        setAvailableMetaPages([]);
        toast.success(`Cuenta de "${page.pageName}" vinculada a ${cliente.nombre || "este cliente"}.`);
        if (onClientUpdated) {
          onClientUpdated({
            ...cliente,
            ...payload
          });
        }
      } else {
        toast.error(res.error || "Error al vincular página.");
      }
    } catch (err) {
      setIsAssigningPage(false);
      toast.error(`Error al vincular: ${err.message}`);
    }
  };

  const handleCancelPageSelection = () => {
    setAvailableMetaPages([]);
  };

  const handleUnlinkMeta = async () => {
    setFormData((prev) => ({
      ...prev,
      fb_page_id: "",
      fb_page_access_token: "",
      ig_business_account_id: "",
      auto_publish_enabled: false
    }));

    if (cliente?.id) {
      const res = await updateCliente(cliente.id, {
        fb_page_id: null,
        fb_page_access_token: null,
        ig_business_account_id: null,
        auto_publish_enabled: false
      });
      if (res.success && onClientUpdated) {
        onClientUpdated({
          ...cliente,
          fb_page_id: null,
          fb_page_access_token: null,
          ig_business_account_id: null,
          auto_publish_enabled: false
        });
      }
    }
    toast.info("Cuenta de Meta desvinculada del cliente.");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre del cliente es obligatorio.");
    setIsSaving(true);

    const payload = {
      nombre: formData.nombre.trim(),
      empresa: formData.empresa.trim(),
      email: formData.email.trim(),
      locacion_default: formData.locacion_default.trim(),
      monto_retainer: Number(formData.monto_retainer) || 0,
      esquema_pago: formData.esquema_pago === "quincenal" ? "dos_pagos" : "mensual",
      dia_corte_pago: Number(formData.dia_corte_pago) || 1,
      dia_corte_pago_2:
        formData.esquema_pago === "quincenal" ? Number(formData.dia_corte_pago_2) || 15 : null,
      producciones_por_mes: Number(formData.producciones_por_mes) || 1,
      sesiones_primer_pago:
        formData.esquema_pago === "quincenal" && Number(formData.producciones_por_mes) >= 2
          ? Number(formData.sesiones_primer_pago) || getDefaultFirstPaymentSessions(formData.producciones_por_mes)
          : null,
      tipo_sesion_default: formData.tipo_sesion_default,
      permite_descarga: formData.permite_descarga,
      // Datos de Meta transferidos de forma silenciosa a Supabase
      fb_page_id: formData.fb_page_id || null,
      fb_page_access_token: formData.fb_page_access_token || null,
      ig_business_account_id: formData.ig_business_account_id || null,
      auto_publish_enabled: Boolean(formData.auto_publish_enabled)
    };

    const res = await updateCliente(cliente.id, payload);
    setIsSaving(false);
    if (res.success) {
      toast.success("Cliente actualizado con éxito.");
      if (onClientUpdated) onClientUpdated(res.data);
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar cliente.");
    }
  };

  // Pestañas superiores fijas idénticas al ProposalModal (sin emojis, usando Lucide)
  const tabsContent = (
    <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 gap-1 w-full">
      <button
        type="button"
        onClick={() => setActiveTab("info")}
        className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeTab === "info"
            ? "bg-gray-900 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
        }`}
      >
        <FileText className={`w-3.5 h-3.5 ${activeTab === "info" ? "text-pink-400" : "text-gray-400"}`} />
        <span>1. Info General</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("retainer")}
        className={`flex-1 py-2 px-4 font-sora text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeTab === "retainer"
            ? "bg-gray-900 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
        }`}
      >
        <DollarSign className={`w-3.5 h-3.5 ${activeTab === "retainer" ? "text-brand-blue" : "text-gray-400"}`} />
        <span>2. Retainer y Producción</span>
      </button>
    </div>
  );

  return (
    <>
      <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      eyebrow="CONFIGURACIÓN DE CLIENTE"
      eyebrowColor="text-brand-magenta"
      title="Configuración y Retainer"
      description={cliente.nombre ? `Ajustes operativos de ${cliente.nombre}` : undefined}
      maxWidth="max-w-xl"
      className="h-[95vh] max-h-[95vh]"
      cancelText="Cancelar"
      submitText="Guardar Cambios"
      loadingText="Guardando..."
      isLoading={isSaving}
      tabs={tabsContent}
      bodyClassName="max-h-none flex-1"
    >
      {activeTab === "info" ? (
        /* TAB 1: INFORMACIÓN GENERAL */
        <div className="space-y-4">
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-4">
            <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
              1. Datos Básicos del Cliente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="client-nombre" className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                  Nombre *
                </Label>
                <Input
                  id="client-nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-inter"
                />
              </div>

              <div>
                <Label htmlFor="client-empresa" className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                  Empresa
                </Label>
                <Input
                  id="client-empresa"
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Empresa o marca comercial"
                  className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-inter"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="client-email" className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                Email
              </Label>
              <Input
                id="client-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-inter"
              />
            </div>

            <div>
              <Label htmlFor="client-locacion" className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación Base / Google Maps
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="client-locacion"
                  type="text"
                  placeholder="Dirección o link de Maps (se heredará a sus rodajes)"
                  value={formData.locacion_default}
                  onChange={(e) => setFormData({ ...formData, locacion_default: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-inter"
                />
                {formData.locacion_default.trim() && (
                  <button
                    type="button"
                    onClick={handleOpenMaps}
                    title="Abrir ubicación en Maps"
                    className="h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs flex items-center shrink-0 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 2: Conexión con Meta / Instagram */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
                2. Autopublicación & Redes (Meta)
              </span>
              {formData.fb_page_id ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-inter font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Conectado / Auto-publicación lista</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-inter font-medium">
                  <span>Sin vincular</span>
                </span>
              )}
            </div>

            {formData.fb_page_id ? (
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-[#1877F2]" />
                      <span className="font-sora font-semibold text-xs text-gray-900">
                        Página de Facebook
                      </span>
                      <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        ID: {formData.fb_page_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span className="font-sora font-semibold text-xs text-gray-900">
                        Instagram Business
                      </span>
                      {formData.ig_business_account_id ? (
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                          ID: {formData.ig_business_account_id}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-inter">
                          Sin cuenta de Instagram asociada
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlinkMeta}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 font-sora font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Desvincular</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-publish-switch" className="text-xs font-sora font-bold text-gray-700 block">
                      Auto-publicación programada
                    </Label>
                    <p className="text-[11px] font-inter text-gray-400">
                      Habilita el cron job para publicar automáticamente en fecha y hora.
                    </p>
                  </div>
                  <Switch
                    id="auto-publish-switch"
                    checked={Boolean(formData.auto_publish_enabled)}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, auto_publish_enabled: checked })
                    }
                  />
                </div>
              </div>
            ) : availableMetaPages.length > 0 ? (
              /* CASO 2: CUENTAS SINCRONIZADAS - SELECCIÓN INTERACTIVA */
              <div className="bg-white border border-blue-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-sora font-bold text-gray-900">
                      Selecciona la página que pertenece a {cliente?.nombre || "este cliente"}:
                    </p>
                    <p className="text-[11px] font-inter text-gray-500">
                      {availableMetaPages.length} {availableMetaPages.length === 1 ? "página encontrada" : "páginas encontradas"} en tu cuenta de Facebook.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelPageSelection}
                    className="text-[11px] text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-full hover:bg-gray-100 font-sora font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {availableMetaPages.map((page) => (
                    <div
                      key={page.pageId}
                      className="flex items-center justify-between p-2.5 bg-gray-50/80 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition-all gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Facebook className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                          <span className="font-sora font-bold text-xs text-gray-900 truncate">
                            {page.pageName}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 shrink-0">
                            ID: {page.pageId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {page.instagramUsername ? (
                            <>
                              <Instagram className="w-3 h-3 text-pink-600 shrink-0" />
                              <span className="text-pink-600 font-medium font-inter">
                                @{page.instagramUsername}
                              </span>
                              <span className="font-mono text-[10px] text-gray-400">
                                ({page.instagramId})
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-600 text-[10px] font-inter">
                              Sin Instagram comercial asociado
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAssigningPage}
                        onClick={() => handleSelectPageForClient(page)}
                        className="h-8 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-sora font-bold tracking-wide transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
                      >
                        {isAssigningPage ? "Asignando..." : "Asignar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CASO 3: BOTÓN DE INICIO DE CONEXIÓN OAUTH */
              <div className="bg-white border border-dashed border-gray-200 rounded-xl p-5 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center mx-auto">
                  <Facebook className="w-5 h-5 fill-[#1877F2]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-sora font-semibold text-gray-900">
                    Vinculación Oficial de Meta (Facebook & Instagram)
                  </p>
                  <p className="text-[11px] font-inter text-gray-500 max-w-sm mx-auto">
                    Inicia sesión con la cuenta de Facebook que administra las páginas e Instagram de este cliente para otorgar los permisos de publicación automática.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConnectMetaOAuth}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-sora font-bold tracking-wide transition-all shadow-sm shadow-blue-200 active:scale-[0.98] cursor-pointer w-full sm:w-auto"
                  >
                    <Facebook className="w-4 h-4 fill-white" />
                    <span>Conectar Páginas con Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMetaScanner(true)}
                    title="Escanear cuentas con token manual o ya existente"
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-sora font-medium transition-all cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Avanzado</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: RETAINER Y PRODUCCIÓN */
        <div className="space-y-4">
          {/* Bloque A: Esquema Financiero y Retainer */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
              A. Esquema Financiero y Retainer
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="client-retainer" className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-magenta" /> Monto Retainer ($)
                </Label>
                <Input
                  id="client-retainer"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.monto_retainer}
                  onChange={(e) => setFormData({ ...formData, monto_retainer: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue font-sora font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                  Esquema de Cobro
                </Label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, esquema_pago: "mensual" })}
                    className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                      formData.esquema_pago === "mensual"
                        ? "bg-gray-900 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, esquema_pago: "quincenal" })}
                    className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                      formData.esquema_pago === "quincenal"
                        ? "bg-gray-900 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Quincenal
                  </button>
                </div>
              </div>
            </div>

            {formData.esquema_pago === "quincenal" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-sora text-gray-500 block mb-1">1er Día de Cobro</span>
                  <Select
                    value={String(formData.dia_corte_pago)}
                    onValueChange={(val) => setFormData({ ...formData, dia_corte_pago: Number(val) })}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                      <SelectValue placeholder="1er Día" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                          Día {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-[10px] font-sora text-gray-500 block mb-1">2do Día de Cobro</span>
                  <Select
                    value={String(formData.dia_corte_pago_2)}
                    onValueChange={(val) => setFormData({ ...formData, dia_corte_pago_2: Number(val) })}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                      <SelectValue placeholder="2do Día" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                          Día {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-sora text-gray-500 block mb-1">Día de Cobro Mensual</span>
                <Select
                  value={String(formData.dia_corte_pago)}
                  onValueChange={(val) => setFormData({ ...formData, dia_corte_pago: Number(val) })}
                >
                  <SelectTrigger className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl font-inter text-gray-900 focus:ring-brand-blue/20">
                    <SelectValue placeholder="Día de cobro" />
                  </SelectTrigger>
                  <SelectContent className="z-[70] max-h-56 bg-white border border-gray-100 shadow-xl rounded-xl">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)} className="text-xs font-inter cursor-pointer">
                        Día {d} de cada mes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Bloque B: Producción y Entregables */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
            <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
              B. Producción y Entregables
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Clapperboard className="w-3.5 h-3.5 text-brand-blue" /> Sesiones / Mes
                </Label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          producciones_por_mes: num,
                          sesiones_primer_pago: getDefaultFirstPaymentSessions(num)
                        })
                      }
                      className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                        formData.producciones_por_mes === num
                          ? "bg-brand-blue text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                  Tipo Predeterminado
                </Label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo_sesion_default: "organica" })}
                    className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                      formData.tipo_sesion_default === "organica"
                        ? "bg-gray-900 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Orgánica (4h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo_sesion_default: "profesional" })}
                    className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                      formData.tipo_sesion_default === "profesional"
                        ? "bg-gray-900 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pro (6h)
                  </button>
                </div>
              </div>
            </div>

            {formData.esquema_pago === "quincenal" && formData.producciones_por_mes >= 2 && (
              <div className="p-3 bg-white border border-blue-100 rounded-xl space-y-2">
                <span className="text-[11px] font-sora font-bold text-gray-800 flex items-center gap-1.5">
                  <LockKeyhole className="w-3.5 h-3.5 text-brand-blue" />
                  Desbloqueo de Sesiones por Pago (2 Pagos)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {getPaymentSplitOptions(formData.producciones_por_mes).map((opt) => {
                    const isSelected =
                      (Number(formData.sesiones_primer_pago) ||
                        getDefaultFirstPaymentSessions(formData.producciones_por_mes)) ===
                      opt.firstPaymentSessions;
                    return (
                      <button
                        key={opt.firstPaymentSessions}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            sesiones_primer_pago: opt.firstPaymentSessions
                          })
                        }
                        className={`py-2 px-3 rounded-full text-[11px] font-sora font-semibold transition-all cursor-pointer border text-center ${
                          isSelected
                            ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-blue"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
              <div className="space-y-0.5">
                <Label
                  htmlFor="permite_descarga"
                  className="text-xs font-sora font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-brand-magenta" /> Permitir Descarga de Contenido
                </Label>
                <p className="text-[10px] text-gray-500 font-inter">
                  Habilita el botón de descarga en sus calendarios públicos.
                </p>
              </div>
              <Switch
                id="permite_descarga"
                checked={formData.permite_descarga}
                onCheckedChange={(val) => setFormData({ ...formData, permite_descarga: val })}
              />
            </div>
          </div>
        </div>
      )}
    </BaseFormModal>

    <MetaScannerDialog
      isOpen={showMetaScanner}
      onClose={() => setShowMetaScanner(false)}
      currentClientId={cliente?.id}
      clients={clients}
      onSelectAccount={(account) => {
        setFormData({
          ...formData,
          fb_page_id: account.pageId,
          fb_page_access_token: account.pageAccessToken,
          ig_business_account_id: account.instagramId,
          auto_publish_enabled: true
        });
      }}
    />
    </>
  );
}
