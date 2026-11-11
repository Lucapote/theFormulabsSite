import { supabase } from "@/lib/supabase";

/**
 * Service for Dashboard Home / Agenda Diaria ("Qué toca hoy")
 * Reglas GEMINI.md:
 * - Puro JavaScript asíncrono, cero JSX, cero imports de React.
 * - Respuestas estructuradas: { success, data, error }
 */

/**
 * Obtiene todas las publicaciones programadas para una fecha dada (YYYY-MM-DD),
 * enriquecidas con la información del calendario y cliente correspondiente.
 *
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
export async function getDayScheduledPosts(dateStr) {
  if (!dateStr) return { success: false, data: [], error: "Fecha requerida." };

  try {
    if (!supabase) return { success: false, data: [], error: "Supabase no configurado." };

    // 1. Intento con join anidado posts -> calendarios -> clientes
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        calendario:calendarios (
          id,
          nombre,
          slug,
          mes,
          anio,
          cliente:clientes (
            id,
            nombre,
            empresa
          )
        )
      `)
      .eq("fecha_programada", dateStr)
      .order("hora_programada", { ascending: true });

    if (!error && Array.isArray(data)) {
      return { success: true, data };
    }

    // 2. Fallback de dos pasos si las relaciones automáticas no están expuestas
    console.warn("getDayScheduledPosts fallback de dos pasos por:", error?.message);
    const { data: rawPosts, error: postErr } = await supabase
      .from("posts")
      .select("*")
      .eq("fecha_programada", dateStr)
      .order("hora_programada", { ascending: true });

    if (postErr) {
      console.error("getDayScheduledPosts raw query error:", postErr);
      return { success: false, data: [], error: postErr.message };
    }

    if (!rawPosts || rawPosts.length === 0) {
      return { success: true, data: [] };
    }

    const calIds = [...new Set(rawPosts.map((p) => p.calendario_id).filter(Boolean))];
    if (calIds.length === 0) {
      return { success: true, data: rawPosts };
    }

    const { data: cals } = await supabase
      .from("calendarios")
      .select("id, nombre, slug, mes, anio, cliente_id")
      .in("id", calIds);

    const clientIds = [...new Set((cals || []).map((c) => c.cliente_id).filter(Boolean))];
    const { data: clients } = clientIds.length > 0
      ? await supabase.from("clientes").select("id, nombre, empresa").in("id", clientIds)
      : { data: [] };

    const clientMap = new Map((clients || []).map((cl) => [cl.id, cl]));
    const calMap = new Map(
      (cals || []).map((c) => [
        c.id,
        { ...c, cliente: clientMap.get(c.cliente_id) || null }
      ])
    );

    const enriched = rawPosts.map((post) => ({
      ...post,
      calendario: calMap.get(post.calendario_id) || null
    }));

    return { success: true, data: enriched };
  } catch (err) {
    console.error("getDayScheduledPosts catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Obtiene todas las sesiones de producción / rodajes asignadas a una fecha (YYYY-MM-DD),
 * enriquecidas con la información del cliente y ciclo mensual.
 *
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
export async function getDayProductions(dateStr) {
  if (!dateStr) return { success: false, data: [], error: "Fecha requerida." };

  try {
    if (!supabase) return { success: false, data: [], error: "Supabase no configurado." };

    // 1. Intento con join directo producciones -> clientes y ciclo
    const { data, error } = await supabase
      .from("producciones")
      .select(`
        *,
        cliente:clientes (
          id,
          nombre,
          empresa,
          locacion_default
        ),
        ciclo:ciclos_mensuales (
          id,
          mes,
          anio,
          estado_pago
        )
      `)
      .eq("fecha_rodaje", dateStr)
      .order("hora_inicio", { ascending: true });

    if (!error && Array.isArray(data)) {
      return { success: true, data };
    }

    // 2. Fallback de dos pasos
    console.warn("getDayProductions fallback de dos pasos por:", error?.message);
    const { data: rawProd, error: prodErr } = await supabase
      .from("producciones")
      .select("*")
      .eq("fecha_rodaje", dateStr)
      .order("hora_inicio", { ascending: true });

    if (prodErr) {
      console.error("getDayProductions raw query error:", prodErr);
      return { success: false, data: [], error: prodErr.message };
    }

    if (!rawProd || rawProd.length === 0) {
      return { success: true, data: [] };
    }

    const clientIds = [...new Set(rawProd.map((p) => p.cliente_id).filter(Boolean))];
    const { data: clients } = clientIds.length > 0
      ? await supabase.from("clientes").select("id, nombre, empresa, locacion_default").in("id", clientIds)
      : { data: [] };

    const clientMap = new Map((clients || []).map((cl) => [cl.id, cl]));

    const enriched = rawProd.map((p) => ({
      ...p,
      cliente: clientMap.get(p.cliente_id) || null
    }));

    return { success: true, data: enriched };
  } catch (err) {
    console.error("getDayProductions catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Resumen consolidado de la agenda diaria (Posts, Producciones y Métricas)
 *
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getDayAgendaSummary(dateStr) {
  try {
    const [postsRes, prodRes] = await Promise.all([
      getDayScheduledPosts(dateStr),
      getDayProductions(dateStr)
    ]);

    const posts = postsRes.success ? postsRes.data : [];
    const productions = prodRes.success ? prodRes.data : [];

    const metrics = {
      totalPosts: posts.length,
      totalProductions: productions.length,
      publishedPosts: posts.filter((p) => p.estado === "publicado").length,
      pendingPosts: posts.filter((p) => p.estado !== "publicado").length,
      confirmedProductions: productions.filter((p) =>
        ["fecha_agendada", "rodaje_completado", "en_edicion", "finalizada"].includes(p.estado)
      ).length
    };

    return {
      success: true,
      data: {
        dateStr,
        posts,
        productions,
        metrics
      }
    };
  } catch (err) {
    console.error("getDayAgendaSummary catch error:", err);
    return { success: false, error: err.message };
  }
}
