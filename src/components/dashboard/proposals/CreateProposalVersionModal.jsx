import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GitBranch, FileText, ArrowRight } from "lucide-react";
import BaseFormModal from "@/components/common/BaseFormModal";
import { Textarea } from "@/components/ui/textarea";
import { duplicateProposalVersion } from "@/services/proposalCrudService";
import SlugPreviewField from "@/components/common/SlugPreviewField";

export default function CreateProposalVersionModal({ isOpen, onClose, propuesta, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [notasVersion, setNotasVersion] = useState("");
  const [nuevoSlug, setNuevoSlug] = useState("");

  const versionActual = Number(propuesta?.version) || 1;
  const proximaVersion = versionActual + 1;

  useEffect(() => {
    if (propuesta && isOpen) {
      const baseSlug = (propuesta.slug || "propuesta").replace(/-v[0-9]+$/i, "");
      setNuevoSlug(`${baseSlug}-v${proximaVersion}`);
      setNotasVersion("");
    }
  }, [propuesta, isOpen, proximaVersion]);

  if (!propuesta) return null;

  const handleSlugChange = (e) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setNuevoSlug(sanitized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notasVersion.trim()) {
      toast.error("Por favor ingresa el motivo del ajuste o notas de la versión.");
      return;
    }

    if (!nuevoSlug.trim()) {
      toast.error("Por favor ingresa un slug válido para la nueva versión.");
      return;
    }

    setLoading(true);
    const res = await duplicateProposalVersion(propuesta.id, {
      notas_version: notasVersion.trim(),
      nuevoSlug: nuevoSlug.trim()
    });
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess(res.data);
      onClose();
    } else {
      toast.error(res.error || "No se pudo crear la nueva versión de la propuesta.");
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      badge={
        <span className="font-mono text-[11px] uppercase font-bold text-[#188ff0] bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 inline-flex items-center">
          <GitBranch className="w-3 h-3 text-[#188ff0] mr-1" /> Control de Versiones
        </span>
      }
      title="Nueva Versión de Propuesta"
      description={`Clonando propuesta de ${propuesta.cliente || "Cliente"}`}
      maxWidth="max-w-md"
      cancelText="Cancelar"
      submitText={`Crear Versión v${proximaVersion}`}
      loadingText="Creando..."
      isLoading={loading}
    >
      <div className="space-y-4">
        {/* Caja de Contexto de la Versión Anterior */}
        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3.5 text-xs space-y-1.5 text-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Versión actual:
            </span>
            <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              v{versionActual}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Slug actual:</span>
            <span className="font-mono text-[11px] text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 truncate max-w-[200px]">
              /{propuesta.slug}
            </span>
          </div>
          <div className="pt-1.5 flex items-center justify-between text-[#188ff0] font-semibold border-t border-gray-200/60">
            <span className="flex items-center gap-1 font-sora text-xs">
              <ArrowRight className="w-3 h-3" /> Nueva versión a generar:
            </span>
            <span className="font-mono font-bold bg-blue-50 text-[#188ff0] px-2 py-0.5 rounded border border-blue-100">
              v{proximaVersion}
            </span>
          </div>
        </div>

        {/* Campo 1: Motivo del Ajuste / Negociación */}
        <div>
          <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
            Motivo del Ajuste o Negociación *
          </label>
          <Textarea
            required
            rows={3}
            value={notasVersion}
            onChange={(e) => setNotasVersion(e.target.value)}
            placeholder="Ej: Cliente pidió ajustar el plan a 1 rodaje mensual y un 10% de descuento en el retainer base."
            className="w-full text-xs bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 p-3 resize-none font-inter transition-all"
          />
        </div>

        {/* Campo 2: Slug de la Nueva Versión */}
        <div>
          <label className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
            Slug de la Nueva Versión *
          </label>
          <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <span className="px-3 text-xs font-mono text-gray-500 bg-gray-100/80 border-r border-gray-200 select-none py-2.5">
              theformulab.io/
            </span>
            <input
              type="text"
              required
              value={nuevoSlug}
              onChange={handleSlugChange}
              placeholder={`ej: ${propuesta.slug}-v${proximaVersion}`}
              className="w-full h-10 px-3 text-xs font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>
          <SlugPreviewField
            prefix="theformulab.io/"
            slug={nuevoSlug}
            className="mt-2"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
