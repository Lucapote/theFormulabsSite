import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GitBranch, RefreshCw, FileText, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { duplicateProposalVersion } from "@/services/proposalCrudService";

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
      toast.success(`Versión v${proximaVersion} creada correctamente`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } else {
      toast.error(res.error || "No se pudo crear la nueva versión de la propuesta.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 font-inter">
        {/* Header con Jerarquía Clínica */}
        <DialogHeader className="pb-3 border-b border-gray-100 text-left space-y-1.5">
          <span className="font-mono text-[11px] uppercase font-bold text-[#188ff0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 inline-flex items-center self-start">
            <GitBranch className="w-3 h-3 text-[#188ff0] mr-1" /> Control de Versiones
          </span>
          <DialogTitle className="font-sora text-xl font-bold text-gray-900 tracking-tight">
            Nueva Versión de Propuesta
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Clonando propuesta de <strong className="text-gray-800 font-semibold">{propuesta.cliente || "Cliente"}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Caja de Contexto de la Versión Anterior */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs space-y-1 text-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Versión actual:
              </span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                v{versionActual}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Slug actual:</span>
              <span className="font-mono text-[11px] text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 truncate max-w-[200px]">
                /{propuesta.slug}
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[#188ff0] font-semibold border-t border-gray-200/60">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Nueva versión a generar:
              </span>
              <span className="font-mono font-bold bg-blue-50 text-[#188ff0] px-2 py-0.5 rounded border border-blue-100">
                v{proximaVersion}
              </span>
            </div>
          </div>

          {/* Campo 1: Notas del Ajuste / Negociación */}
          <div>
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1.5 block">
              Motivo del Ajuste o Negociación *
            </label>
            <Textarea
              required
              rows={3}
              value={notasVersion}
              onChange={(e) => setNotasVersion(e.target.value)}
              placeholder="Ej: Cliente pidió ajustar el plan a 1 rodaje mensual y un 10% de descuento en el retainer base."
              className="w-full text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#188ff0] p-3 resize-none"
            />
          </div>

          {/* Campo 2: Slug de la Nueva Versión */}
          <div>
            <label className="text-[11px] font-sora font-bold text-gray-700 uppercase mb-1.5 block">
              Slug de la Nueva Versión *
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#188ff0]">
              <span className="px-3 text-xs font-mono text-gray-400 bg-gray-50 border-r border-gray-200 select-none py-2.5">
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
            <p className="text-[10px] text-gray-400 mt-1">
              Solo letras minúsculas, números y guiones.
            </p>
          </div>

          {/* Footer y Acciones */}
          <DialogFooter className="pt-2 flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full text-xs font-sora font-semibold text-gray-500 hover:text-gray-900 px-4 h-9 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#188ff0] hover:bg-blue-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full px-5 py-2.5 shadow-md shadow-blue-200 transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear Versión v{proximaVersion}</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
