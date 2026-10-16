import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FlaskConical, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getLeads, getLeadStats, deleteLead, updateLeadStatus, sendLeadEmailNotification } from "@/services/leadService";
import { Skeleton } from "@/components/ui/skeleton";
import LeadMetricsHeader from "./LeadMetricsHeader";
import LeadFilterBar from "./LeadFilterBar";
import LeadCardItem from "./LeadCardItem";
import LeadDetailModal from "./LeadDetailModal";
import ConfirmDeleteModal from "@/components/dashboard/common/ConfirmDeleteModal";

export default function DiagnosticsTabSection() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, topRoute: "—", avgSeconds: null });
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Filtros y ordenación
  const [search, setSearch] = useState("");
  const [filterRoute, setFilterRoute] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" (recientes) | "asc" (primeros en llegar)

  // Modales
  const [selectedLead, setSelectedLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga de estadísticas
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await getLeadStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoadingStats(false);
  }, []);

  // Carga de leads con filtros y orden
  const loadLeadsData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingLeads(true);
    const res = await getLeads({ filterRoute, search, limit: 100, sortOrder });
    if (res.success) {
      setLeads(res.data || []);
    } else {
      toast.error(res.error || "No se pudieron cargar los prospectos.");
    }
    if (!isSilent) setLoadingLeads(false);
  }, [filterRoute, search, sortOrder]);

  // Carga inicial y reacción a filtros
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeadsData();
    }, 200);

    return () => clearTimeout(timer);
  }, [loadLeadsData]);

  // Suscripción en tiempo real a leads (Supabase Realtime)
  useEffect(() => {
    if (!supabase) return;

    const leadsChannel = supabase
      .channel("leads-realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const nuevoLead = payload.new;
          // 1. Insertar el nuevo lead al principio del estado local
          setLeads((prev) => [nuevoLead, ...prev.filter((l) => l.id !== nuevoLead.id)]);
          loadStats();

          // 2. Alerta visual con audio/sonner sutil
          toast.info(`Nuevo diagnóstico recibido: ${nuevoLead.nombre || "Nuevo prospecto"}`, {
            description: `Score: ${nuevoLead.score || 0}/100 • Ruta: ${nuevoLead.route_name || "General"}`,
            duration: 6000
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => {
          const leadActualizado = payload.new;
          setLeads((prev) =>
            prev.map((l) => (l.id === leadActualizado.id ? leadActualizado : l))
          );
          setSelectedLead((prev) => (prev && prev.id === leadActualizado.id ? leadActualizado : prev));
          loadStats();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "leads" },
        (payload) => {
          const { old: leadEliminado } = payload;
          setLeads((prev) => prev.filter((l) => l.id !== leadEliminado.id));
          loadStats();
        }
      )
      .subscribe();

    // Cleanup estricto al desmontar el componente
    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, [loadStats]);

  // Actualizar estado del lead
  const handleStatusChange = async (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }

    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success) {
      toast.success("Estado del prospecto actualizado");
    } else {
      toast.error("No se pudo actualizar el estado en la base de datos.");
      loadLeadsData(true);
    }
  };

  // Refrescar manualmente
  const handleRefresh = async () => {
    toast.promise(
      Promise.all([loadStats(), loadLeadsData(true)]),
      {
        loading: "Actualizando expediente de laboratorio...",
        success: "Datos de prospectos actualizados",
        error: "Error al actualizar datos"
      }
    );
  };

  // Probar notificación de alerta por correo con Resend
  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    const testLead = leads[0] || {
      nombre: "Prospecto de Prueba Lab",
      whatsapp: "+52 998 123 4567",
      instagram: "@theformulab.io",
      route: "A",
      route_name: "Gestión Integral",
      score: 8,
      suggested_range: "$7,000 – $18,000 MXN / mes",
      seconds_to_complete: 35,
      ubicacion: "Cancún",
      cuando: "Este mes",
      answers: {
        objetivo: { label: "Que las redes me traigan clientes, no solo likes" },
        operacion: { label: "Somos más de 5 personas o tenemos varias sucursales" },
        gestion: { label: "Una agencia" },
        inversion: { label: "Entre $15,000 y $40,000 MXN" }
      }
    };

    const toastId = toast.loading("Enviando alerta de prueba por Resend a theformulab.io@gmail.com...");
    const res = await sendLeadEmailNotification(testLead);
    setIsTestingEmail(false);

    if (res.success) {
      toast.success("Alerta de prueba enviada exitosamente por Resend", { id: toastId });
    } else {
      toast.error(res.error || "No se pudo enviar la alerta de prueba.", { id: toastId });
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deletingLead) return;

    setIsDeleting(true);
    const res = await deleteLead(deletingLead.id);
    setIsDeleting(false);

    if (res.success) {
      toast.success(`Expediente de "${deletingLead.nombre || "lead"}" eliminado`);
      setLeads((prev) => prev.filter((l) => l.id !== deletingLead.id));
      setDeletingLead(null);
      loadStats();
    } else {
      toast.error(res.error || "No se pudo eliminar el prospecto.");
    }
  };

  return (
    <div className="space-y-5 font-inter">
      {/* 1. KPIs del Laboratorio */}
      <LeadMetricsHeader stats={stats} loading={loadingStats} />

      {/* 2. Barra de Búsqueda y Filtros */}
      <LeadFilterBar
        search={search}
        onSearchChange={setSearch}
        filterRoute={filterRoute}
        onFilterRouteChange={setFilterRoute}
        onRefresh={handleRefresh}
        loading={loadingLeads}
        onTestEmail={handleTestEmail}
        isTestingEmail={isTestingEmail}
      />

      {/* 3. Listado de Prospectos / Leads */}
      <div className="space-y-3">
        {loadingLeads ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center mx-auto shadow-xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sora text-base font-bold text-gray-900">
                {search || filterRoute !== "all"
                  ? "Sin resultados para esta búsqueda"
                  : "No hay diagnósticos registrados aún"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {search || filterRoute !== "all"
                  ? "Intenta cambiar los términos de búsqueda o selecciona otro filtro de ruta."
                  : "Cuando los visitantes completen el formulario en vivo, sus respuestas y cualificación aparecerán aquí."}
              </p>
            </div>
            {(search || filterRoute !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterRoute("all");
                }}
                className="h-9 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sora font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 text-[11px] font-sora font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-2.5">
                <span>Mostrando {leads.length} expedientes</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En Vivo
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all cursor-pointer font-sora font-bold text-xs"
                title="Alternar entre más recientes y primeros en llegar"
              >
                {sortOrder === "desc" ? (
                  <>
                    <ArrowDownWideNarrow className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Orden: Más reciente</span>
                  </>
                ) : (
                  <>
                    <ArrowUpNarrowWide className="w-3.5 h-3.5 text-brand-magenta" />
                    <span>Orden: Primero que llegó</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
              {leads.map((lead) => (
                <LeadCardItem
                  key={lead.id}
                  lead={lead}
                  onViewDetail={setSelectedLead}
                  onDelete={setDeletingLead}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal de Detalle / Expediente Clínico */}
      <LeadDetailModal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onStatusChange={handleStatusChange}
      />

      {/* 5. Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingLead)}
        title="¿Eliminar expediente de prospecto?"
        message={`Estás a punto de eliminar el diagnóstico de "${deletingLead?.nombre || "este lead"}". Esta acción borrará el registro de la base de datos de forma permanente.`}
        confirmText="Eliminar lead"
        isProcessing={isDeleting}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
