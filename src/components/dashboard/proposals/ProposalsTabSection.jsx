import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Eye,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { convertProposalToClient } from "@/services/operationsService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

/**
 * ProposalsTabSection
 * Renders the proposals list tab, including hero welcome card and data table.
 * Includes 1-Click Onboarding to convert proposals into active retainer clients.
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
  copiedSlug
}) {
  const [convertedIds, setConvertedIds] = useState(new Set());
  const [convertingProposal, setConvertingProposal] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

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

  const getEstimatedPrice = (proposal) => {
    if (!proposal) return "$0 MXN";
    const content = proposal.contenido || proposal.content || {};
    let price = 0;
    if (typeof content.totalPrice === "number" && content.totalPrice > 0) {
      price = content.totalPrice;
    } else if (Array.isArray(content.pricingPlans) && content.pricingPlans.length > 0) {
      const plan = content.pricingPlans.find((p) => p.highlight) || content.pricingPlans[0];
      price = Number(plan?.price) || 0;
    }
    return price > 0 ? `$${price.toLocaleString("es-MX")} MXN` : "monto a definir";
  };

  const handleConfirmConvert = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!convertingProposal) return;

    setIsConverting(true);
    const res = await convertProposalToClient(convertingProposal);

    if (res.success) {
      toast.success("Cliente y ciclo mensual activados con éxito");
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

  return (
    <div className="space-y-6 font-inter">
      {/* Hero Welcome Card matching ProposalView */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[100%] -z-10 opacity-70" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <p className="hidden sm:block text-pink-500 font-bold tracking-widest uppercase text-xs mb-2 font-sora">
              PANEL DE CONTROL GENERAL
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-sora">
              Gestor de <span className="text-brand-blue">Estrategias</span>
            </h1>
            <p className="hidden sm:block text-gray-600 text-base mt-2 font-medium">
              Crea, personaliza y supervisa las propuestas enviadas a tus clientes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                loadConvertedStatus();
                if (onRefresh) onRefresh();
              }}
              className="h-10 sm:h-11 px-3 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProposals || loadingDb ? "animate-spin text-pink-500" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={onCreateClick}
              className="h-10 sm:h-11 px-4 sm:px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Propuesta</span>
            </button>
          </div>
        </div>
      </div>

      {loadingProposals ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <Sparkles className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-sora font-bold text-gray-700">Cargando propuestas clínicas...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-lg">
          <FileText className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h3 className="font-sora font-extrabold text-gray-900 text-lg mb-1">No hay propuestas creadas</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Comienza creando tu primera propuesta de contenido personalizada para tus clientes.
          </p>
          <button
            onClick={onCreateClick}
            className="h-11 px-6 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-lg shadow-pink-200 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Crear Propuesta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-900 text-white font-sora text-xs">
                  <th className="p-5 font-bold w-[26%]">Cliente / Marca</th>
                  <th className="p-5 font-bold w-[20%]">URL (Slug)</th>
                  <th className="p-5 font-bold w-[12%] text-center">Vistas</th>
                  <th className="p-5 font-bold w-[14%]">Fecha</th>
                  <th className="p-5 font-bold w-[28%] text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {proposals.map((item) => {
                  const isConverted = item.id && convertedIds.has(item.id);

                  return (
                    <tr key={item.id || item.slug} className="hover:bg-pink-50/40 transition-colors">
                      <td className="p-5">
                        <span className="font-sora font-bold text-gray-900 text-base block">
                          {item.cliente || item.shortName || item.slug}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.contenido?.client?.proposalTitle || "Propuesta de Contenido"}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="inline-block font-mono text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                          /{item.slug}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <Eye className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                          {item.contenido?.views || item.views || 0}
                        </span>
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-medium">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })
                          : "Fecha N/A"}
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-nowrap">
                          {/* 1-Click Onboarding a Cliente */}
                          {isConverted ? (
                            <span
                              title="Propuesta ya convertida en cliente activo con ciclo mensual"
                              className="h-8 px-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-sora font-bold inline-flex items-center gap-1 shadow-xs shrink-0"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConvertingProposal(item)}
                              title="Convertir propuesta en cliente y activar ciclo mensual"
                              className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-sora font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Convertir</span>
                            </button>
                          )}

                          <button
                            onClick={() => onCopyLink(item)}
                            title="Copiar enlace privado"
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
                          >
                            {copiedSlug === item.slug ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            to={item.contenido?.token ? `/${item.slug}?token=${item.contenido.token}` : `/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver propuesta en vivo"
                            className="w-8 h-8 rounded-full bg-blue-50 hover:bg-[#188ff0] text-[#188ff0] hover:text-white inline-flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => onEditClick(item)}
                            title="Editar propuesta"
                            className="w-8 h-8 rounded-full bg-gray-900 hover:bg-pink-500 text-white inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteClick(item)}
                            title="Eliminar propuesta"
                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog para Onboarding 1-Click */}
      <AlertDialog
        open={Boolean(convertingProposal)}
        onOpenChange={(open) => {
          if (!open && !isConverting) setConvertingProposal(null);
        }}
      >
        <AlertDialogContent className="rounded-[2rem] p-6 max-w-md bg-white border border-gray-100 shadow-2xl">
          <AlertDialogHeader>
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="font-sora text-lg font-bold text-gray-900">
              ¿Dar de alta como cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 font-inter leading-relaxed">
              ¿Deseas dar de alta a{" "}
              <strong className="text-gray-900 font-bold">
                {convertingProposal?.cliente || convertingProposal?.shortName || "este cliente"}
              </strong>{" "}
              con un retainer de{" "}
              <strong className="text-emerald-600 font-bold">
                {getEstimatedPrice(convertingProposal)}
              </strong>
              ?
              <br />
              <br />
              Esta acción creará automáticamente su registro en la base de clientes y activará su ciclo mensual con sesiones de producción listas para agendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={isConverting}
              onClick={() => setConvertingProposal(null)}
              className="rounded-full font-sora font-bold text-xs border-gray-200 cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isConverting}
              onClick={handleConfirmConvert}
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-sora font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-200 inline-flex items-center gap-2 cursor-pointer"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Activando...
                </>
              ) : (
                "Confirmar Alta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
