import { MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientMetaSection from "./ClientMetaSection";

/**
 * EditClientGeneralTab
 * Pestaña 1 de Configuración General del Cliente:
 * - Datos de contacto e identidad corporativa
 * - Locación predeterminada con acceso directo a Google Maps
 * - Sección de integración con Meta / Instagram para auto-publicación
 */
export default function EditClientGeneralTab({
  formData,
  setFormData,
  cliente,
  availableMetaPages,
  isAssigningPage,
  onConnectOAuth,
  onSelectPage,
  onCancelPageSelection,
  onUnlinkMeta,
  onOpenAdvancedScanner
}) {
  const handleOpenMaps = () => {
    const loc = formData.locacion_default.trim();
    if (!loc) return;
    const url =
      loc.startsWith("http://") || loc.startsWith("https://")
        ? loc
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-4 font-inter">
      {/* Bloque 1: Datos Básicos del Cliente */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-4">
        <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
          1. Datos Básicos del Cliente
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor="client-nombre"
              className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block"
            >
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
            <Label
              htmlFor="client-empresa"
              className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block"
            >
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
          <Label
            htmlFor="client-email"
            className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block"
          >
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
          <Label
            htmlFor="client-locacion"
            className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1"
          >
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
      <ClientMetaSection
        formData={formData}
        setFormData={setFormData}
        cliente={cliente}
        availableMetaPages={availableMetaPages}
        isAssigningPage={isAssigningPage}
        onConnectOAuth={onConnectOAuth}
        onSelectPage={onSelectPage}
        onCancelPageSelection={onCancelPageSelection}
        onUnlinkMeta={onUnlinkMeta}
        onOpenAdvancedScanner={onOpenAdvancedScanner}
      />
    </div>
  );
}
