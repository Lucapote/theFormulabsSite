import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchProposals } from "@/services/proposalService";
import { useWindowFocusRefresh } from "@/hooks/useWindowFocusRefresh";

/**
 * useDashboardData
 * Encapsulates proposal loading, inbound lead diagnostics, and real-time counter listeners.
 * Strictly reactive logic per GEMINI.md Rule 4.G.
 */
export function useDashboardData() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const totalPropuestasReales = useMemo(() => {
    return (proposals || []).filter((p) => !p.propuesta_padre_id).length;
  }, [proposals]);

  const leadsPendientesCount = useMemo(() => {
    return (diagnostics || []).filter((d) => d.status === "nuevo").length;
  }, [diagnostics]);

  const loadDiagnostics = useCallback(async (isSilent = false) => {
    if (!supabase) return;
    if (!isSilent) setLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id, status")
        .order("created_at", { ascending: false });

      if (!error && data) setDiagnostics(data || []);
    } catch (err) {
      console.error("Error loading diagnostics:", err);
    } finally {
      if (!isSilent) setLoadingDb(false);
    }
  }, []);

  const loadProposals = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingProposals(true);
    const res = await fetchProposals();
    if (res.success) setProposals(res.data);
    if (!isSilent) setLoadingProposals(false);
  }, []);

  useEffect(() => {
    loadDiagnostics();
    loadProposals();
  }, [loadDiagnostics, loadProposals]);

  // Real-time counter sync for new inbound diagnostic leads
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("dashboard-leads-count-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (p) => {
        setDiagnostics((prev) => [p.new, ...prev.filter((d) => d.id !== p.new.id)]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" }, (p) => {
        setDiagnostics((prev) => prev.map((d) => (d.id === p.new.id ? { ...d, ...p.new } : d)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "leads" }, (p) => {
        setDiagnostics((prev) => prev.filter((d) => d.id !== p.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useWindowFocusRefresh(() => {
    loadDiagnostics(true);
    loadProposals(true);
  }, { minIntervalMs: 8000 });

  return {
    diagnostics,
    loadingDb,
    proposals,
    loadingProposals,
    totalPropuestasReales,
    leadsPendientesCount,
    loadDiagnostics,
    loadProposals
  };
}

