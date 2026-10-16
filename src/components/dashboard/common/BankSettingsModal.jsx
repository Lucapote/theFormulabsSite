import { useState, useEffect } from "react";
import { Settings, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDatosBancarios, updateDatosBancarios } from "@/services/configService";

/**
 * BankSettingsModal
 * Modal clínico administrativo para configurar datos bancarios oficiales de la agencia.
 * < 190 líneas, con estética Clinical Lab y persistencia en 'configuraciones'.
 */
export default function BankSettingsModal({ isOpen, onClose }) {
  const [banco, setBanco] = useState("BBVA México");
  const [beneficiario, setBeneficiario] = useState("The Formulabs");
  const [clabe, setClabe] = useState("012345678901234567");
  const [telefono, setTelefono] = useState("9981234567");
  const [conceptoDefault, setConceptoDefault] = useState("Servicio de Contenido");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getDatosBancarios()
        .then((res) => {
          if (res?.success && res?.data) {
            setBanco(res.data.banco || "");
            setBeneficiario(res.data.beneficiario || "");
            setClabe(res.data.clabe || "");
            const rawPhone = (res.data.telefono || "529981234567").replace(/\D/g, "");
            const localNumber = rawPhone.startsWith("52") && rawPhone.length > 10 ? rawPhone.slice(2) : rawPhone;
            setTelefono(localNumber.slice(0, 10));
            setConceptoDefault(res.data.concepto_default || "Servicio de Contenido");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (val) => {
    let clean = val.replace(/\D/g, "");
    if (clean.startsWith("52") && clean.length > 10) {
      clean = clean.slice(2);
    }
    setTelefono(clean.slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanClabe = clabe.trim().replace(/\s+/g, "");
    const cleanLocal = telefono.trim().replace(/\D/g, "");

    if (cleanClabe.length !== 18 || !/^\d+$/.test(cleanClabe)) {
      toast.error("La Cuenta CLABE debe contener exactamente 18 dígitos numéricos.");
      return;
    }

    if (cleanLocal.length !== 10) {
      toast.error("El número de WhatsApp debe contener exactamente 10 dígitos.");
      return;
    }

    if (!banco.trim() || !beneficiario.trim()) {
      toast.error("Por favor completa la institución bancaria y el titular.");
      return;
    }

    setIsSaving(true);
    const fullPhone = `52${cleanLocal}`;
    const res = await updateDatosBancarios({
      banco: banco.trim(),
      beneficiario: beneficiario.trim(),
      clabe: cleanClabe,
      concepto_default: conceptoDefault.trim() || "Servicio de Contenido",
      telefono: fullPhone
    });

    if (res.success) {
      toast.success("Datos de agencia actualizados correctamente");
      onClose();
    } else {
      toast.error(res.error || "No se pudieron actualizar los datos bancarios.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto font-inter">
      <div className="bg-white rounded-[2rem] border border-gray-100 w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#188ff0]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">ADMINISTRACIÓN & DATOS</span>
              <h3 className="font-sora font-extrabold text-base tracking-tight">Datos de Agencia & Cobranza</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Configura la cuenta bancaria oficial y el número de WhatsApp receptor de comprobantes para la activación de propuestas y reservas.
          </p>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#188ff0]" />
              <span className="text-xs font-mono">Cargando configuración...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">Institución Bancaria</label>
                <input
                  type="text"
                  required
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  placeholder="ej. BBVA México"
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-brand-blue outline-none bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase mb-1">Titular / Beneficiario</label>
                <input
                  type="text"
                  required
                  value={beneficiario}
                  onChange={(e) => setBeneficiario(e.target.value)}
                  placeholder="ej. The Formulabs"
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-brand-blue outline-none bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase">Cuenta CLABE (18 dígitos)</label>
                  <span className={`text-[10px] font-mono font-bold ${clabe.trim().length === 18 ? "text-emerald-600" : "text-gray-400"}`}>
                    {clabe.trim().length} / 18
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={18}
                  required
                  value={clabe}
                  onChange={(e) => setClabe(e.target.value.replace(/\D/g, ""))}
                  placeholder="012345678901234567"
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-mono font-bold tracking-wider text-gray-900 focus:border-brand-blue outline-none bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-sora font-bold text-gray-700 uppercase">
                    WhatsApp para Envío de Comprobantes
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${telefono.trim().length === 10 ? "text-emerald-600" : "text-gray-400"}`}>
                    {telefono.trim().length} / 10
                  </span>
                </div>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-blue transition-all">
                  <div className="flex items-center px-3.5 bg-gray-100/80 border-r border-gray-200 text-xs font-mono font-bold text-gray-600 select-none shrink-0">
                    +52
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={telefono}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="9981234567"
                    className="w-full h-11 px-3.5 text-xs font-mono font-bold tracking-wider text-gray-900 outline-none bg-transparent"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Ingresa únicamente los 10 dígitos del número. El código internacional de México (+52) ya está predeterminado.
                </p>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="h-10 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="h-10 px-6 bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Guardando..." : "Guardar Datos"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
