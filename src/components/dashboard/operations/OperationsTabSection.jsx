import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Users,
  AlertCircle,
  FileCheck2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCiclosByPeriodo, ensureCicloActual } from "@/services/operationsService";
import { getClientes } from "@/services/calendarService";
import OperationsMetricsHeader from "./OperationsMetricsHeader";
import OperationsCycleCard from "./OperationsCycleCard";
import ProductionDetailModal from "./ProductionDetailModal";
import FinanceCostModal from "./FinanceCostModal";
import PendingReceiptsReviewModal from "./PendingReceiptsReviewModal";
import EditClientModal from "../calendar/EditClientModal";
import { useWindowFocusRefresh } from "@/hooks/useWindowFocusRefresh";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function OperationsTabSection({ setActiveTab = null }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [ciclos, setCiclos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewCicloId, setSelectedReviewCicloId] = useState(null);
  const [activeProductionModal, setActiveProductionModal] = useState({ isOpen: false, produccion: null, clienteNombre: "" });
  const [activeFinanceModal, setActiveFinanceModal] = useState({ isOpen: false, ciclo: null, clienteNombre: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ciclosRes, clientesRes] = await Promise.all([getCiclosByPeriodo(mes, anio), getClientes()]);
      if (ciclosRes.success) setCiclos(ciclosRes.data || []);
      else toast.error(ciclosRes.error || "Error al cargar los ciclos mensuales.");
      if (clientesRes.success) setClientes(clientesRes.data || []);
    } catch (err) {
      console.error("OperationsTabSection load error:", err);
      toast.error("Error al cargar la información operativa.");
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => { loadData(); }, [loadData]);

  useWindowFocusRefresh(loadData, { minIntervalMs: 8000 });

  const activeClientesWithoutCycle = clientes.filter(
    (cl) => cl.activo !== false && !ciclos.some((c) => c.cliente_id === cl.id)
  );

  // Comprobantes que requieren revisión por la agencia en este periodo
  const pendingReceiptsCycles = useMemo(() => {
    return (ciclos || []).filter((c) => {
      const activeUrl = c.comprobante_url || c.comprobante_2_url;
      const hasPreReserved = (c.producciones || []).some((p) => p.estado === "pre_reservada");
      return Boolean(c.comprobante_en_revision) || (hasPreReserved && Boolean(activeUrl));
    });
  }, [ciclos]);

  const handleEnsureAllCycles = async () => {
    if (activeClientesWithoutCycle.length === 0) return;
    setGenerating(true);
    let count = 0;
    for (const cl of activeClientesWithoutCycle) {
      const res = await ensureCicloActual(cl.id, mes, anio, cl.monto_retainer || 0, cl.producciones_por_mes || 1);
      if (res.success) count++;
    }
    setGenerating(false);
    toast.success(`Se generaron ${count} ciclos mensuales para el periodo.`);
    loadData();
  };

  const handlePrevMonth = () => {
    if (mes === 1) { setMes(12); setAnio((p) => p - 1); } else { setMes((p) => p - 1); }
  };
  const handleNextMonth = () => {
    if (mes === 12) { setMes(1); setAnio((p) => p + 1); } else { setMes((p) => p + 1); }
  };

  return (
    <div className="w-full">
      {/* Selector Superior de Periodo */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all cursor-pointer active:scale-[0.98]"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-2">
            <span className="font-sora font-bold text-gray-900 text-sm sm:text-base">
              {MESES[mes - 1]} {anio}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all cursor-pointer active:scale-[0.98]"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {pendingReceiptsCycles.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="h-9 px-4 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100/80 text-[#188ff0] text-xs font-sora font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
            >
              <FileCheck2 className="w-4 h-4 text-[#188ff0]" />
              <span className="hidden sm:inline">Comprobantes por Validar</span>
              <span className="sm:hidden">Validar</span>
              <span className="w-5 h-5 rounded-full bg-[#188ff0] text-white text-[11px] font-mono flex items-center justify-center font-bold">
                {pendingReceiptsCycles.length}
              </span>
            </button>
          )}

          {activeClientesWithoutCycle.length > 0 && (
            <button
              type="button"
              disabled={generating}
              onClick={handleEnsureAllCycles}
              className="h-9 px-4 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {generating ? "Generando..." : `Generar ${activeClientesWithoutCycle.length} Ciclos`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="h-9 px-3.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-sora font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Header de Métricas y KPIs */}
      {!loading && <OperationsMetricsHeader ciclos={ciclos} />}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl bg-gray-200" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-200" />
          ))}
        </div>
      )}

      {/* Listado de Tarjetas de Ciclos */}
      {!loading && ciclos.length > 0 && (
        <div>
          {ciclos.map((ciclo) => (
            <OperationsCycleCard
              key={ciclo.id}
              ciclo={ciclo}
              onOpenProductionModal={(prod, cNombre) =>
                setActiveProductionModal({
                  isOpen: true,
                  produccion: prod,
                  clienteNombre: cNombre,
                  ciclo
                })
              }
              onOpenFinanceModal={(c, cNombre) =>
                setActiveFinanceModal({ isOpen: true, ciclo: c, clienteNombre: cNombre })
              }
              onStatusUpdated={loadData}
              onOpenCreateCalendar={() => {
                if (setActiveTab) {
                  setActiveTab("calendars");
                } else {
                  toast.info("Dirígete a la pestaña de Calendarios para crear uno nuevo.");
                }
              }}
              onGoToCalendar={() => {
                if (setActiveTab) {
                  setActiveTab("calendars");
                }
              }}
              onEditClient={(c) => setEditingClient(c)}
              onOpenReviewReceipt={(c) => {
                setSelectedReviewCicloId(c.id);
                setShowReviewModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State Actionable (Zero Dead-Ends) */}
      {!loading && ciclos.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-xs my-8">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-sora font-bold text-gray-900 text-base mb-1">
            Sin ciclos registrados en {MESES[mes - 1]} {anio}
          </h3>
          <p className="font-inter text-xs text-gray-500 mb-5">
            {activeClientesWithoutCycle.length > 0
              ? `Existen ${activeClientesWithoutCycle.length} clientes activos que aún no tienen ciclo generado para este mes.`
              : "No se encontraron clientes activos configurados en la plataforma."}
          </p>

          {activeClientesWithoutCycle.length > 0 ? (
            <button
              type="button"
              disabled={generating}
              onClick={handleEnsureAllCycles}
              className="h-10 px-6 rounded-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {generating ? "Generando Ciclos..." : "Generar Ciclos Mensuales Automáticamente"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (setActiveTab) setActiveTab("calendars");
              }}
              className="h-10 px-6 rounded-full bg-brand-blue hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Users className="w-4 h-4" />
              <span>Gestionar Clientes en Calendarios</span>
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      <ProductionDetailModal
        isOpen={activeProductionModal.isOpen}
        produccion={activeProductionModal.produccion}
        clienteNombre={activeProductionModal.clienteNombre}
        ciclo={activeProductionModal.ciclo}
        onClose={() =>
          setActiveProductionModal({ isOpen: false, produccion: null, clienteNombre: "", ciclo: null })
        }
        onUpdated={loadData}
        onDeleted={loadData}
      />

      <FinanceCostModal
        isOpen={activeFinanceModal.isOpen}
        ciclo={activeFinanceModal.ciclo}
        clienteNombre={activeFinanceModal.clienteNombre}
        onClose={() =>
          setActiveFinanceModal({ isOpen: false, ciclo: null, clienteNombre: "" })
        }
        onUpdated={loadData}
      />

      <EditClientModal
        isOpen={Boolean(editingClient)}
        cliente={editingClient}
        onClose={() => setEditingClient(null)}
        onClientUpdated={loadData}
      />

      <PendingReceiptsReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReviewCicloId(null);
        }}
        pendingCycles={pendingReceiptsCycles}
        initialSelectedCicloId={selectedReviewCicloId}
        onCycleUpdated={loadData}
      />
    </div>
  );
}
