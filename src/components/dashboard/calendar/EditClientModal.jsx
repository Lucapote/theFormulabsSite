import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, DollarSign } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import EditClientGeneralTab from "./EditClientGeneralTab";
import EditClientRetainerTab from "./EditClientRetainerTab";
import MetaScannerDialog from "./MetaScannerDialog";
import { updateCliente } from "@/services/calendarService";
import { getDefaultFirstPaymentSessions } from "@/utils/bookingHelpers";

/**
 * EditClientModal
 * Modal clínico administrativo para configuración general, financiera y operativa de clientes.
 * Arquitectura modular sobre BaseFormModal con pestañas fijas superiores, alto estático (95vh)
 * y scroll interno sin saltos visuales (Clinical High-Tech Lab).
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
    nombre: "",
    empresa: "",
    email: "",
    locacion_default: "",
    fb_page_id: "",
    fb_page_access_token: "",
    ig_business_account_id: "",
    auto_publish_enabled: false,
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
        fb_page_id: cliente.fb_page_id || "",
        fb_page_access_token: cliente.fb_page_access_token || "",
        ig_business_account_id: cliente.ig_business_account_id || "",
        auto_publish_enabled: Boolean(cliente.auto_publish_enabled),
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

      if (event.data?.type === "META_PAGES_LOADED") {
        const { clientId, pages } = event.data;
        if (clientId && cliente?.id && String(clientId) !== String(cliente.id)) return;

        if (Array.isArray(pages) && pages.length > 0) {
          setAvailableMetaPages(pages);
          toast.info(`Se sincronizaron ${pages.length} páginas. Selecciona cuál pertenece a este cliente.`);
        } else {
          toast.error("No se encontraron páginas de Facebook asociadas.");
        }
        return;
      }

      if (event.data?.type === "META_AUTH_SUCCESS") {
        const { clientId, fb_page_id, pageId, fb_page_access_token, ig_business_account_id, instagramId } =
          event.data;
        if (clientId && cliente?.id && String(clientId) !== String(cliente.id)) return;

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
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, cliente, onClientUpdated]);

  if (!cliente) return null;

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
        setFormData((prev) => ({ ...prev, ...payload }));
        setAvailableMetaPages([]);
        toast.success(`Cuenta de "${page.pageName}" vinculada a ${cliente.nombre || "este cliente"}.`);
        if (onClientUpdated) {
          onClientUpdated({ ...cliente, ...payload });
        }
      } else {
        toast.error(res.error || "Error al vincular página.");
      }
    } catch (err) {
      setIsAssigningPage(false);
      toast.error(`Error al vincular: ${err.message}`);
    }
  };

  const handleCancelPageSelection = () => setAvailableMetaPages([]);

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
          <EditClientGeneralTab
            formData={formData}
            setFormData={setFormData}
            cliente={cliente}
            availableMetaPages={availableMetaPages}
            isAssigningPage={isAssigningPage}
            onConnectOAuth={handleConnectMetaOAuth}
            onSelectPage={handleSelectPageForClient}
            onCancelPageSelection={handleCancelPageSelection}
            onUnlinkMeta={handleUnlinkMeta}
            onOpenAdvancedScanner={() => setShowMetaScanner(true)}
          />
        ) : (
          <EditClientRetainerTab formData={formData} setFormData={setFormData} />
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
