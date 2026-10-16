import { useState, useEffect } from "react";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BaseFormModal from "@/components/common/BaseFormModal";
import { getDatosBancarios, updateDatosBancarios } from "@/services/configService";

/**
 * BankSettingsModal
 * Modal clínico administrativo para configurar datos bancarios oficiales de la agencia.
 * Clinical High-Tech Lab design system.
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
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      eyebrow="ADMINISTRACIÓN & DATOS"
      eyebrowColor="text-[#188ff0]"
      icon={Settings}
      title="Datos de Agencia & Cobranza"
      description="Configura la cuenta bancaria oficial y el número de WhatsApp receptor de comprobantes."
      maxWidth="max-w-lg"
      cancelText="Cancelar"
      submitText="Guardar Datos"
      loadingText="Guardando..."
      isLoading={isSaving}
      isSubmitDisabled={isLoading}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#188ff0]" />
            <span className="text-xs font-mono">Cargando configuración...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Institución Bancaria *
              </label>
              <input
                type="text"
                required
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="ej. BBVA México"
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-gray-50/50 focus:bg-white transition-all font-inter"
              />
            </div>

            <div>
              <label className="block text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Titular / Beneficiario *
              </label>
              <input
                type="text"
                required
                value={beneficiario}
                onChange={(e) => setBeneficiario(e.target.value)}
                placeholder="ej. The Formulabs"
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-gray-50/50 focus:bg-white transition-all font-inter"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-sora font-bold text-gray-700 uppercase tracking-wide">
                  Cuenta CLABE (18 dígitos) *
                </label>
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
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-mono font-bold tracking-wider text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-sora font-bold text-gray-700 uppercase tracking-wide">
                  WhatsApp para Envío de Comprobantes *
                </label>
                <span className={`text-[10px] font-mono font-bold ${telefono.trim().length === 10 ? "text-emerald-600" : "text-gray-400"}`}>
                  {telefono.trim().length} / 10
                </span>
              </div>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
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
              <p className="text-[10px] text-gray-400 mt-1 font-inter">
                Ingresa únicamente los 10 dígitos del número. El código internacional de México (+52) ya está predeterminado.
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseFormModal>
  );
}
