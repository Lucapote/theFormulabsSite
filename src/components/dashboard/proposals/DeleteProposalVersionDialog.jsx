import { useState } from "react";
import { AlertTriangle, Trash2, GitBranch, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProposalSingleVersion,
  deleteProposalTree
} from "@/services/proposalCrudService";
import ConfirmDeleteModal from "@/components/dashboard/common/ConfirmDeleteModal";

/**
 * DeleteProposalVersionDialog
 * Modal de confirmación clínico con borrado inteligente:
 * - Cancelar
 * - Eliminar v[número de versión] (quirúrgico)
 * - Eliminar todo (árbol completo del expediente con todas las iteraciones)
 * Basado estrictamente en el diseño unificado de ConfirmDeleteModal.
 */
export default function DeleteProposalVersionDialog({
  isOpen,
  onClose,
  propuesta,
  totalVersiones = 1,
  group = null,
  onSuccess
}) {
  const [isDeleting, setIsDeleting] = useState(null); // null | "single" | "all"

  if (!propuesta) return null;

  const versionNum = propuesta.version || 1;
  const clienteNombre = propuesta.cliente || propuesta.slug || "Cliente";
  const hasMultiple = totalVersiones > 1;
  const raizId = group?.raizId || propuesta.propuesta_padre_id || propuesta.id;
  const allVersionIds = group?.versiones?.map((v) => v.id) || [];

  // 1. Eliminar solo la versión seleccionada
  const handleDeleteSingle = async () => {
    setIsDeleting("single");
    try {
      const res = await deleteProposalSingleVersion(propuesta.id);
      if (res.success) {
        toast.success(`Versión v${versionNum} de "${clienteNombre}" eliminada.`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "No se pudo eliminar la versión.");
      }
    } catch (err) {
      toast.error(err.message || "Error al eliminar la versión.");
    } finally {
      setIsDeleting(null);
    }
  };

  // 2. Eliminar todo el expediente y todas sus versiones
  const handleDeleteAll = async () => {
    setIsDeleting("all");
    try {
      const res = await deleteProposalTree(raizId, allVersionIds);
      if (res.success) {
        toast.success(`Expediente de "${clienteNombre}" y sus ${totalVersiones} versiones eliminados.`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "No se pudo eliminar el expediente completo.");
      }
    } catch (err) {
      toast.error(err.message || "Error al eliminar el expediente completo.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      icon={hasMultiple ? GitBranch : Trash2}
      badge={hasMultiple ? `Gestión de Expediente • v${versionNum}` : `v${versionNum}`}
      title={hasMultiple ? "¿Cómo deseas proceder con la eliminación?" : `¿Eliminar propuesta de ${clienteNombre}?`}
      message={
        hasMultiple
          ? `El expediente de "${clienteNombre}" tiene ${totalVersiones} versiones. Puedes eliminar únicamente la versión v${versionNum} o borrar el expediente completo con todas sus iteraciones.`
          : `¿Estás seguro de eliminar la versión v${versionNum} de "${clienteNombre}"? Esta acción no se puede deshacer.`
      }
      buttons={
        <>
          {/* Cancelar */}
          <button
            type="button"
            disabled={Boolean(isDeleting)}
            onClick={onClose}
            className="h-10 px-5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          {/* Eliminar versión específica */}
          <button
            type="button"
            disabled={Boolean(isDeleting)}
            onClick={handleDeleteSingle}
            className="h-10 px-5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-sora font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {isDeleting === "single" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar v{versionNum}</span>
            )}
          </button>

          {/* Eliminar todo el expediente */}
          {hasMultiple && (
            <button
              type="button"
              disabled={Boolean(isDeleting)}
              onClick={handleDeleteAll}
              className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-red-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isDeleting === "all" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Eliminando todo...</span>
                </>
              ) : (
                <span>Eliminar Todo ({totalVersiones})</span>
              )}
            </button>
          )}
        </>
      }
    >
      {hasMultiple && (
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Eliminar todo</strong> suprime las {totalVersiones} versiones registradas. Si solo deseas descartar esta iteración, elige <strong>Eliminar v{versionNum}</strong>.
          </span>
        </div>
      )}
    </ConfirmDeleteModal>
  );
}
