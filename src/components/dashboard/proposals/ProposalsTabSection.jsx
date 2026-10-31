import { useState, useEffect, useMemo } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { convertProposalToClient } from "@/services/operationsService";
import { Skeleton } from "@/components/ui/skeleton";
import ProposalRow from "./ProposalRow";
import CreateProposalVersionModal from "./CreateProposalVersionModal";
import ProposalOnboardingDialog, { getProposalConversionDetails } from "./ProposalOnboardingDialog";
import DeleteProposalVersionDialog from "./DeleteProposalVersionDialog";

/**
 * ProposalsTabSection
 * Renders the proposals list tab, with smart root grouping for iteration versions,
 * version dropdowns, negotiation notes, and 1-Click Onboarding to active clients.
 */
export default function ProposalsTabSection({
  proposals = [],
  loadingProposals = false,
  loadingDb = false,
  onRefresh,
  onCreateClick,
  onCopyLink,
  onEditClick,
  onDeleteClick,
  copiedSlug,
  setActiveTab
}) {
  const [convertedIds, setConvertedIds] = useState(new Set());
  const [convertingProposal, setConvertingProposal] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [versioningProposal, setVersioningProposal] = useState(null);
  const [deletingProposalData, setDeletingProposalData] = useState(null);

  // Agrupación Inteligente de Propuestas por Familia / Raíz
  const propuestasAgrupadas = useMemo(() => {
    if (!Array.isArray(proposals) || proposals.length === 0) return [];

    const byId = new Map(proposals.map((p) => [p.id, p]));
    const getRootId = (item) => {
      let curr = item;
      const visited = new Set();
      while (
        curr &&
        curr.propuesta_padre_id &&
        byId.has(curr.propuesta_padre_id) &&
        !visited.has(curr.id)
      ) {
        visited.add(curr.id);
        curr = byId.get(curr.propuesta_padre_id);
      }
      return curr?.id || item.id;
    };

    const groupsMap = new Map();

    proposals.forEach((item) => {
      const raizId = getRootId(item);
      if (!groupsMap.has(raizId)) {
        groupsMap.set(raizId, {
          raizId,
          versiones: []
        });
      }
      groupsMap.get(raizId).versiones.push(item);
    });

    const result = [];
    groupsMap.forEach((group) => {
      group.versiones.sort((a, b) => {
        const vA = Number(a.version) || 1;
        const vB = Number(b.version) || 1;
        if (vB !== vA) return vB - vA;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
      group.versionReciente = group.versiones[0];
      result.push(group);
    });

    result.sort((a, b) => {
      const dateA = new Date(a.versionReciente?.created_at || 0);
      const dateB = new Date(b.versionReciente?.created_at || 0);
      return dateB - dateA;
    });

    return result;
  }, [proposals]);

  // Conteo de propuestas reales (expedientes raíz) excluyendo versiones iteradas
  const totalPropuestasReales = useMemo(() => {
    return (proposals || []).filter((p) => !p.propuesta_padre_id).length;
  }, [proposals]);

  // Cargar estado de propuestas que ya fueron convertidas a clientes
  const loadConvertedStatus = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("propuesta_origen_id")
        .not("propuesta_origen_id", "is", null);

      if (!error && data) {
        const ids = data.map((c) => c.propuesta_origen_id).filter(Boolean);
        setConvertedIds(new Set(ids));
      }
    } catch (err) {
      console.error("Error al cargar estado de conversión:", err);
    }
  };

  useEffect(() => {
    loadConvertedStatus();
  }, [proposals]);

  const handleConfirmConvert = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!convertingProposal) return;

    setIsConverting(true);
    const details = getProposalConversionDetails(convertingProposal);
    const res = await convertProposalToClient(convertingProposal);

    if (res.success) {
      const clientName = res.data?.cliente?.nombre || details?.nombre || "Cliente";
      toast.success(`Cliente ${clientName} y ciclo mensual inicializados correctamente`, {
        action: typeof setActiveTab === "function"
          ? {
              label: "Ir a Operaciones",
              onClick: () => setActiveTab("operaciones")
            }
          : undefined
      });
      setConvertedIds((prev) => new Set([...prev, convertingProposal.id]));
      setConvertingProposal(null);
      if (onRefresh) onRefresh();
    } else if (res.alreadyConverted) {
      toast.info(res.error || "Esta propuesta ya fue convertida previamente.");
      setConvertedIds((prev) => new Set([...prev, convertingProposal.id]));
      setConvertingProposal(null);
    } else {
      toast.error(res.error || "No se pudo convertir la propuesta.");
    }
    setIsConverting(false);
  };

  // Apertura Inmediata de Edición tras Crear Versión (Punto 8)
  const handleVersionCreated = (nuevaVersion) => {
    setVersioningProposal(null);
    if (onRefresh) onRefresh();
    if (onEditClick && nuevaVersion) {
      onEditClick(nuevaVersion);
    }
    toast.success(
      `Versión v${nuevaVersion?.version || ""} creada. Editando borrador...`
    );
  };

  return (
    <div className="space-y-6 font-inter overflow-x-hidden w-full">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <p className="hidden sm:block text-brand-magenta font-bold tracking-widest uppercase text-xs mb-2 font-sora">
              PANEL DE CONTROL GENERAL
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-sora">
              Gestor de <span className="text-brand-blue">Estrategias</span>
            </h1>
            <p className="hidden sm:block text-gray-600 text-base mt-2 font-medium">
              Crea, versiona y supervisa las propuestas comerciales y sus iteraciones de negociación.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
                <FileText className="w-3.5 h-3.5 text-brand-blue" />
                <span>
                  {totalPropuestasReales}{" "}
                  {totalPropuestasReales === 1 ? "propuesta raíz" : "propuestas raíz"}
                </span>
              </span>
              {proposals.length > totalPropuestasReales && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-inter text-gray-500 bg-gray-100 border border-gray-200">
                  {proposals.length} versiones en total
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                loadConvertedStatus();
                if (onRefresh) onRefresh();
              }}
              className="h-10 sm:h-11 px-3 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProposals || loadingDb ? "animate-spin text-brand-magenta" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={onCreateClick}
              className="h-10 sm:h-11 px-4 sm:px-6 bg-brand-magenta hover:opacity-90 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Propuesta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estados de Carga / Vacío / Lista */}
      {loadingProposals ? (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl space-y-4 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <Skeleton className="h-6 w-44 bg-gray-200/80 rounded-full" />
            <Skeleton className="h-6 w-24 bg-gray-200/80 rounded-full" />
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-36 bg-gray-200/80 rounded-md" />
                  <Skeleton className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-24 bg-gray-100 rounded" />
              </div>
              <Skeleton className="h-7 w-28 rounded-full bg-gray-100 hidden sm:block" />
              <Skeleton className="h-7 w-16 rounded-full bg-gray-100 hidden md:block" />
              <div className="flex items-center gap-1.5 shrink-0">
                <Skeleton className="h-8 w-24 rounded-full bg-gray-100" />
                <Skeleton className="h-8 w-8 rounded-full bg-gray-100" />
                <Skeleton className="h-8 w-8 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : propuestasAgrupadas.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <FileText className="w-12 h-12 text-brand-magenta mx-auto mb-3" />
          <h3 className="font-sora font-extrabold text-gray-900 text-lg mb-1">No hay propuestas creadas</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Comienza creando tu primera propuesta de contenido personalizada para tus clientes.
          </p>
          <button
            onClick={onCreateClick}
            className="h-11 px-6 bg-brand-magenta hover:opacity-90 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-500/20 inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> Crear Propuesta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-900 text-white font-sora text-xs">
                  <th className="p-5 font-bold w-[28%]">Cliente / Proyecto</th>
                  <th className="p-5 font-bold w-[18%]">URL (Slug)</th>
                  <th className="p-5 font-bold w-[10%] text-center">Vistas</th>
                  <th className="p-5 font-bold w-[14%]">Fecha</th>
                  <th className="p-5 font-bold w-[30%] text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {propuestasAgrupadas.map((group) => (
                  <ProposalRow
                    key={group.raizId}
                    group={group}
                    convertedIds={convertedIds}
                    copiedSlug={copiedSlug}
                    onCopyLink={onCopyLink}
                    onEditClick={onEditClick}
                    onDeleteClick={(p, count) => setDeletingProposalData({ propuesta: p, totalVersiones: count, group })}
                    onConvertClick={(p) => setConvertingProposal(p)}
                    onNewVersionClick={(p) => setVersioningProposal(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Crear Nueva Versión / Iteración */}
      <CreateProposalVersionModal
        isOpen={Boolean(versioningProposal)}
        onClose={() => setVersioningProposal(null)}
        propuesta={versioningProposal}
        onSuccess={handleVersionCreated}
      />

      {/* Confirmation Dialog Clínico para Onboarding 1-Click */}
      <ProposalOnboardingDialog
        isOpen={Boolean(convertingProposal)}
        onClose={() => setConvertingProposal(null)}
        proposal={convertingProposal}
        isConverting={isConverting}
        onConfirm={handleConfirmConvert}
      />

      {/* Confirmation Dialog Clínico para Borrado Inteligente de Versiones */}
      <DeleteProposalVersionDialog
        isOpen={Boolean(deletingProposalData)}
        onClose={() => setDeletingProposalData(null)}
        propuesta={deletingProposalData?.propuesta}
        totalVersiones={deletingProposalData?.totalVersiones || 1}
        group={deletingProposalData?.group}
        onSuccess={() => {
          setDeletingProposalData(null);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
