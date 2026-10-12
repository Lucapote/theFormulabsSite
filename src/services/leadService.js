import { supabase } from "@/lib/supabase";
import { evaluateLeadBranching, extractUrlTracking } from "@/utils/leadBranching";

/**
 * Registra un nuevo lead en la tabla `leads` de Supabase siguiendo el esquema exacto de BD.
 * Retorna { success, data, error } respetando GEMINI.md (Sección 3.F).
 */
export async function submitLeadForm({ answers, contactData }) {
  try {
    if (!supabase) {
      return { success: false, error: "Servicio no disponible temporalmente." };
    }

    const evaluation = evaluateLeadBranching(answers);
    const tracking = extractUrlTracking();

    const payload = {
      nombre: (contactData.nombre || "").trim(),
      instagram: (contactData.instagram || "").replace(/^@/, "").trim(),
      whatsapp: (contactData.whatsapp || "").trim(),
      ubicacion: contactData.ubicacion || null,
      cuando: contactData.cuando_iniciar || null,
      answers: answers || {},
      score: evaluation.score,
      route: evaluation.route,
      route_name: evaluation.routeName,
      suggested_range: evaluation.suggestedRange,
      src: tracking.src || null,
      utm_source: tracking.utm_source || null,
      utm_medium: tracking.utm_medium || null,
      utm_campaign: tracking.utm_campaign || null,
      utm_content: tracking.utm_content || null,
      utm_term: tracking.utm_term || null,
      referrer: tracking.referrer || null
    };

    const { error } = await supabase.from("leads").insert([payload]);

    if (error) {
      console.error("Error al registrar lead en Supabase:", error);
      return { success: false, error: error.message || "Error al enviar el formulario." };
    }

    return {
      success: true,
      data: payload
    };
  } catch (err) {
    console.error("Error inesperado en submitLeadForm:", err);
    return { success: false, error: err.message || "Error inesperado." };
  }
}

/**
 * Obtiene el listado de leads con filtros opcionales de ruta y búsqueda.
 * Retorna { success, data, error }.
 */
export async function getLeads({ filterRoute = "all", search = "", limit = 50, sortOrder = "desc" } = {}) {
  try {
    if (!supabase) {
      return { success: false, error: "Servicio no disponible temporalmente.", data: [] };
    }

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: sortOrder === "asc" });

    if (filterRoute && filterRoute !== "all") {
      query = query.eq("route", filterRoute);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`nombre.ilike.%${term}%,instagram.ilike.%${term}%,whatsapp.ilike.%${term}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al obtener leads:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("Error inesperado en getLeads:", err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Obtiene métricas agregadas de los diagnósticos/leads registrados.
 * Retorna { success, data: { totalLeads, avgScore, topRoute, avgSeconds }, error }.
 */
export async function getLeadStats() {
  try {
    if (!supabase) {
      return {
        success: false,
        error: "Servicio no disponible.",
        data: { totalLeads: 0, avgScore: 0, topRoute: "—", avgSeconds: 0 }
      };
    }

    const { data, error } = await supabase
      .from("leads")
      .select("score, route, route_name, whatsapp");

    if (error) {
      console.error("Error al calcular estadísticas de leads:", error);
      return {
        success: false,
        error: error.message,
        data: {
          totalLeads: 0,
          avgScore: 0,
          topRoute: "—",
          topRouteCount: 0,
          contactableCount: 0,
          contactablePercent: 0,
          qualifiedCount: 0
        }
      };
    }

    const leads = data || [];
    const totalLeads = leads.length;

    if (totalLeads === 0) {
      return {
        success: true,
        data: {
          totalLeads: 0,
          avgScore: 0,
          topRoute: "—",
          topRouteCount: 0,
          contactableCount: 0,
          contactablePercent: 0,
          qualifiedCount: 0
        }
      };
    }

    // Calcular promedio de score
    const totalScore = leads.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
    const avgScore = Math.round(totalScore / totalLeads);

    // Calcular ruta más frecuente
    const routeCounts = {};
    leads.forEach((l) => {
      const r = l.route_name || l.route || "General";
      routeCounts[r] = (routeCounts[r] || 0) + 1;
    });

    let topRoute = "—";
    let maxCount = 0;
    Object.entries(routeCounts).forEach(([r, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRoute = r;
      }
    });

    // Calcular contactabilidad con WhatsApp
    const contactableCount = leads.filter((l) => Boolean(l.whatsapp && l.whatsapp.trim().length >= 8)).length;
    const contactablePercent = Math.round((contactableCount / totalLeads) * 100);

    // Distribución real por ruta clínica
    const gestionCount = leads.filter((l) => l.route === "A" || l.route_name === "Gestión Integral").length;
    const proyectoCount = leads.filter((l) => l.route === "B" || l.route === "web" || l.route_name === "Proyecto Puntual" || l.route_name === "Sitio Web").length;
    const mentoriaCount = leads.filter((l) => l.route === "C" || l.route_name === "Mentoría").length;

    const routesDistribution = {
      gestion: { count: gestionCount, percent: Math.round((gestionCount / totalLeads) * 100) },
      proyecto: { count: proyectoCount, percent: Math.round((proyectoCount / totalLeads) * 100) },
      mentoria: { count: mentoriaCount, percent: Math.round((mentoriaCount / totalLeads) * 100) }
    };

    const qualifiedCount = gestionCount + proyectoCount;

    return {
      success: true,
      data: {
        totalLeads,
        avgScore,
        topRoute,
        topRouteCount: maxCount,
        contactableCount,
        contactablePercent,
        qualifiedCount,
        routesDistribution
      }
    };
  } catch (err) {
    console.error("Error inesperado en getLeadStats:", err);
    return {
      success: false,
      error: err.message,
      data: {
        totalLeads: 0,
        avgScore: 0,
        topRoute: "—",
        topRouteCount: 0,
        contactableCount: 0,
        contactablePercent: 0,
        qualifiedCount: 0
      }
    };
  }
}

/**
 * Elimina un lead por su UUID en Supabase.
 * Retorna { success, error }.
 */
export async function deleteLead(leadId) {
  try {
    if (!supabase || !leadId) {
      return { success: false, error: "Identificador inválido o servicio no disponible." };
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId);

    if (error) {
      console.error("Error al eliminar lead:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error inesperado en deleteLead:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Actualiza el estado de seguimiento de un lead en Supabase.
 * Retorna { success, error }.
 */
export async function updateLeadStatus(leadId, newStatus) {
  try {
    if (!supabase || !leadId) {
      return { success: false, error: "Identificador inválido o servicio no disponible." };
    }

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      console.error("Error al actualizar estado del lead:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error inesperado en updateLeadStatus:", err);
    return { success: false, error: err.message };
  }
}

