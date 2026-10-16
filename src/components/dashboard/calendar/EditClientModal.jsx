import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin, ExternalLink, DollarSign, Clapperboard, Download } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateCliente } from "@/services/calendarService";

export default function EditClientModal({ isOpen = false, onClose, cliente, onClientUpdated }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", empresa: "", email: "", locacion_default: "", monto_retainer: "",
    esquema_pago: "mensual", dia_corte_pago: 1, dia_corte_pago_2: 15,
    producciones_por_mes: 1, tipo_sesion_default: "organica", permite_descarga: false
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "", empresa: cliente.empresa || "", email: cliente.email || "",
        locacion_default: cliente.locacion_default || "", monto_retainer: cliente.monto_retainer ?? "",
        esquema_pago: cliente.esquema_pago === "dos_pagos" || cliente.esquema_pago === "quincenal" ? "quincenal" : "mensual",
        dia_corte_pago: cliente.dia_corte_pago || 1, dia_corte_pago_2: cliente.dia_corte_pago_2 || 15,
        producciones_por_mes: Number(cliente.producciones_por_mes) || 1,
        tipo_sesion_default: cliente.tipo_sesion_default || "organica",
        permite_descarga: Boolean(cliente.permite_descarga)
      });
    }
  }, [cliente, isOpen]);

  if (!cliente) return null;

  const handleOpenMaps = () => {
    const loc = formData.locacion_default.trim();
    if (!loc) return;
    const url = loc.startsWith("http://") || loc.startsWith("https://")
      ? loc
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre del cliente es obligatorio.");
    setIsSaving(true);
    const payload = {
      nombre: formData.nombre.trim(), empresa: formData.empresa.trim(), email: formData.email.trim(),
      locacion_default: formData.locacion_default.trim(), monto_retainer: Number(formData.monto_retainer) || 0,
      esquema_pago: formData.esquema_pago === "quincenal" ? "dos_pagos" : "mensual",
      dia_corte_pago: Number(formData.dia_corte_pago) || 1,
      dia_corte_pago_2: formData.esquema_pago === "quincenal" ? Number(formData.dia_corte_pago_2) || 15 : null,
      producciones_por_mes: Number(formData.producciones_por_mes) || 1,
      tipo_sesion_default: formData.tipo_sesion_default,
      permite_descarga: formData.permite_descarga
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

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      eyebrow="CONFIGURACIÓN DE CLIENTE"
      eyebrowColor="text-brand-magenta"
      title="Configuración y Retainer"
      description={cliente.nombre ? `Ajustes operativos de ${cliente.nombre}` : undefined}
      maxWidth="max-w-lg"
      cancelText="Cancelar"
      submitText="Guardar Cambios"
      loadingText="Guardando..."
      isLoading={isSaving}
    >
      <div className="space-y-4">
        {/* BLOQUE 1: DATOS GENERALES */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
            1. Datos Generales
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
              />
            </div>
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                Empresa
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
            />
          </div>
          <div>
            <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación Base / Google Maps
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Dirección o link de Maps (se heredará a sus rodajes)"
                value={formData.locacion_default}
                onChange={(e) => setFormData({ ...formData, locacion_default: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
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

        {/* BLOQUE 2: ESQUEMA FINANCIERO Y RETAINER */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
            2. Esquema Financiero y Retainer
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-magenta" /> Monto Retainer ($)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.monto_retainer}
                onChange={(e) => setFormData({ ...formData, monto_retainer: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-sora font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                Esquema de Cobro
              </label>
              <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, esquema_pago: "mensual" })}
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                    formData.esquema_pago === "mensual" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, esquema_pago: "quincenal" })}
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                    formData.esquema_pago === "quincenal" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
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
                <span className="text-[10px] font-sora text-gray-500 block mb-0.5">1er Día</span>
                <select
                  value={formData.dia_corte_pago}
                  onChange={(e) => setFormData({ ...formData, dia_corte_pago: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>Día {d}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] font-sora text-gray-500 block mb-0.5">2do Día</span>
                <select
                  value={formData.dia_corte_pago_2}
                  onChange={(e) => setFormData({ ...formData, dia_corte_pago_2: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>Día {d}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-sora text-gray-500 block mb-0.5">Día de Cobro Mensual</span>
              <select
                value={formData.dia_corte_pago}
                onChange={(e) => setFormData({ ...formData, dia_corte_pago: Number(e.target.value) })}
                className="w-full h-9 px-2.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Día {d} de cada mes</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* BLOQUE 3: PRODUCCIÓN Y ENTREGABLES */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
            3. Producción y Entregables
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Clapperboard className="w-3.5 h-3.5 text-brand-blue" /> Sesiones / Mes
              </label>
              <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, producciones_por_mes: num })}
                    className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                      formData.producciones_por_mes === num ? "bg-brand-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                Tipo Predeterminado
              </label>
              <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo_sesion_default: "organica" })}
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                    formData.tipo_sesion_default === "organica" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Orgánica (4h)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo_sesion_default: "profesional" })}
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                    formData.tipo_sesion_default === "profesional" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pro (6h)
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
            <div className="space-y-0.5">
              <Label htmlFor="permite_descarga" className="text-xs font-sora font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-brand-magenta" /> Permitir Descarga de Contenido
              </Label>
              <p className="text-[10px] text-gray-500 font-inter">Habilita el botón de descarga en sus calendarios públicos.</p>
            </div>
            <Switch id="permite_descarga" checked={formData.permite_descarga} onCheckedChange={(val) => setFormData({ ...formData, permite_descarga: val })} />
          </div>
        </div>
      </div>
    </BaseFormModal>
  );
}
