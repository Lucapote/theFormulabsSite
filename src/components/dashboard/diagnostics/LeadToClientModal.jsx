import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserCheck, DollarSign, MapPin, Briefcase, GraduationCap, Zap, LockKeyhole } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { convertLeadToClient } from "@/services/leadService";
import { getPaymentSplitOptions, getDefaultFirstPaymentSessions } from "@/utils/bookingHelpers";

export default function LeadToClientModal({ isOpen, onClose, lead, onClientCreated }) {
  const [loading, setLoading] = useState(false);
  const [tipoServicio, setTipoServicio] = useState("mentoria");
  const [formData, setFormData] = useState({
    nombre: "", empresa: "", email: "", monto_retainer: "",
    esquema_pago: "mensual", dia_corte_pago: 1, dia_corte_pago_2: 15,
    producciones_por_mes: 0, tipo_sesion_default: "organica",
    locacion_default: "", permite_descarga: false
  });

  useEffect(() => {
    if (lead && isOpen) {
      const suggestedPrice = lead.suggested_range
        ? parseInt(lead.suggested_range.replace(/\D/g, ""), 10) || ""
        : "";
      setFormData({
        nombre: lead.nombre || "",
        empresa: lead.nombre ? `${lead.nombre} Brand` : "",
        email: "",
        monto_retainer: suggestedPrice || "",
        esquema_pago: "mensual",
        dia_corte_pago: 1,
        dia_corte_pago_2: 15,
        producciones_por_mes: 0,
        tipo_sesion_default: "organica",
        locacion_default: lead.ubicacion || "",
        permite_descarga: false
      });
      setTipoServicio("mentoria");
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const handleTipoServicioChange = (tipo) => {
    setTipoServicio(tipo);
    if (tipo === "retainer") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "organica", producciones_por_mes: 2, permite_descarga: true }));
    } else if (tipo === "mentoria") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "organica", producciones_por_mes: 0, permite_descarga: false }));
    } else if (tipo === "servicio_unico") {
      setFormData((prev) => ({ ...prev, tipo_sesion_default: "profesional", producciones_por_mes: 1, permite_descarga: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre del cliente es obligatorio.");
    setLoading(true);

    const res = await convertLeadToClient(lead.id, formData);
    setLoading(false);

    if (res.success) {
      toast.success("Cliente creado y vinculado al lead con éxito");
      if (onClientCreated) onClientCreated(res.data.cliente);
      onClose();
    } else {
      toast.error(res.error || "Error al convertir lead.");
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      badge={
        <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start inline-flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Alta Directa de Lead
        </span>
      }
      title="Convertir Lead a Cliente"
      description={`Prospecto: ${lead.nombre}${lead.ubicacion ? ` • ${lead.ubicacion}` : ""}`}
      maxWidth="max-w-lg"
      cancelText="Cancelar"
      submitText="Activar como Cliente"
      loadingText="Activando..."
      isLoading={loading}
    >
      <div className="space-y-4">
        {/* Selector de Tipo de Servicio */}
        <div>
          <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
            Tipo de Servicio Acordado
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/80 text-[11px] font-sora font-semibold">
            <button
              type="button"
              onClick={() => handleTipoServicioChange("retainer")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                tipoServicio === "retainer" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
              <span>Retainer</span>
            </button>
            <button
              type="button"
              onClick={() => handleTipoServicioChange("mentoria")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                tipoServicio === "mentoria" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#ef18d6]" />
              <span>Mentoría</span>
            </button>
            <button
              type="button"
              onClick={() => handleTipoServicioChange("servicio_unico")}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                tipoServicio === "servicio_unico" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Servicio Único</span>
            </button>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
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
                Empresa / Marca
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-magenta" /> Monto Pactado ($)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={formData.monto_retainer}
                onChange={(e) => setFormData({ ...formData, monto_retainer: e.target.value })}
                className="w-full h-10 px-3 text-xs font-sora font-bold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
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
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-semibold transition-all cursor-pointer ${
                    formData.esquema_pago === "mensual" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, esquema_pago: "dos_pagos" })}
                  className={`flex-1 h-8 rounded-full text-xs font-sora font-semibold transition-all cursor-pointer ${
                    formData.esquema_pago === "dos_pagos" || formData.esquema_pago === "quincenal" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Quincenal
                </button>
              </div>
            </div>
          </div>

          {/* Días de corte */}
          {formData.esquema_pago === "dos_pagos" || formData.esquema_pago === "quincenal" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-sora text-gray-500 block mb-0.5">1er Día Corte</span>
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
                <span className="text-[10px] font-sora text-gray-500 block mb-0.5">2do Día Corte</span>
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
              <span className="text-[10px] font-sora text-gray-500 block mb-0.5">Día de Corte Mensual</span>
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

          {/* Producciones por mes si no es mentoría */}
          {tipoServicio !== "mentoria" && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 block">
                  Sesiones de Rodaje / Mes
                </label>
                <div className="flex bg-gray-200/70 p-0.5 rounded-full border border-gray-200 h-10 items-center">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          producciones_por_mes: n,
                          sesiones_primer_pago: getDefaultFirstPaymentSessions(n)
                        })
                      }
                      className={`flex-1 h-8 rounded-full text-xs font-sora font-bold transition-all cursor-pointer ${
                        formData.producciones_por_mes === n ? "bg-brand-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {(formData.esquema_pago === "dos_pagos" || formData.esquema_pago === "quincenal") &&
                formData.producciones_por_mes >= 2 && (
                  <div className="p-2.5 bg-white border border-blue-100 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-sora font-bold text-gray-700 flex items-center gap-1">
                      <LockKeyhole className="w-3 h-3 text-brand-blue" />
                      Desbloqueo por Pago:
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
                            className={`py-1.5 px-2.5 rounded-full text-[10px] font-sora font-semibold transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-gray-900 text-white border-gray-900"
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
            </div>
          )}

          <div>
            <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Locación / Dirección Base
            </label>
            <input
              type="text"
              placeholder="Ubicación o enlace de Google Maps"
              value={formData.locacion_default}
              onChange={(e) => setFormData({ ...formData, locacion_default: e.target.value })}
              className="w-full h-9 px-3 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-inter"
            />
          </div>
        </div>
      </div>
    </BaseFormModal>
  );
}
