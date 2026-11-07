import { useState, useEffect } from "react";
import { UserPlus, DollarSign, FileText } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import CreateClientIdentityTab from "./subcomponents/CreateClientIdentityTab";
import CreateClientRetainerTab from "./subcomponents/CreateClientRetainerTab";

/**
 * CreateClientModal
 * Modal clínico para dar de alta un nuevo cliente o marca con retainers y rodajes.
 * Modularizado bajo SRP ($\le 250$ líneas) cumpliendo con GEMINI.md.
 */
export default function CreateClientModal({
  isOpen = false,
  onClose,
  clientForm = {
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
  },
  setClientForm,
  onSubmit,
  isSaving = false
}) {
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (isOpen) {
      setActiveTab("info");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setClientForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBatchUpdate = (updates) => {
    setClientForm((prev) => ({ ...prev, ...updates }));
  };

  const tabsContent = (
    <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 gap-1">
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
        <span>1. Identidad del Cliente</span>
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
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      eyebrow="ALTA OPERATIVA"
      eyebrowColor="text-brand-magenta"
      icon={UserPlus}
      title="Nuevo Cliente"
      description="Alta operativa y configuración de retainer mensual"
      maxWidth="max-w-xl"
      className="h-[95vh] max-h-[95vh]"
      bodyClassName="max-h-none flex-1 overflow-y-auto min-h-0"
      cancelText="Cancelar"
      submitText="Guardar Cliente"
      loadingText="Guardando..."
      isLoading={isSaving}
      tabs={tabsContent}
    >
      <div className="space-y-4 font-inter">
        {activeTab === "info" ? (
          <CreateClientIdentityTab
            clientForm={clientForm}
            onChangeField={handleFieldChange}
            onNext={() => setActiveTab("retainer")}
          />
        ) : (
          <CreateClientRetainerTab
            clientForm={clientForm}
            onChangeField={handleFieldChange}
            onBatchUpdate={handleBatchUpdate}
          />
        )}
      </div>
    </BaseFormModal>
  );
}
