import { supabase } from "@/lib/supabase";
import { evaluateLeadBranching, extractUrlTracking } from "@/utils/leadBranching";
import { ensureCicloActual } from "@/services/operationsService";

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

    // Disparar notificación por correo con Resend en segundo plano (cero bloqueo al cliente)
    sendLeadEmailNotification(payload).catch((err) => {
      console.warn("Aviso: Notificación por correo no enviada (no bloqueante):", err);
    });

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
 * Envía una alerta por correo a la agencia mediante la función serverless /api/notify-lead.
 * Retorna { success, data, error } respetando GEMINI.md (Sección 3.F).
 */
export async function sendLeadEmailNotification(leadPayload) {
  try {
    const res = await fetch("/api/notify-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(leadPayload)
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || `Error al despachar notificación (${res.status})`
      };
    }

    return { success: true, data };
  } catch (err) {
    console.warn("Fallo en sendLeadEmailNotification:", err);
    return { success: false, error: err.message || "Error de red al conectar con el servicio de alertas." };
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

/**
 * Convierte un lead calificado en cliente formal (por ejemplo, para asesorías o mentorías directas)
 * e inicializa su ciclo mensual si cuenta con retainer o producciones.
 *
 * @param {string|object} leadIdOrLead - UUID del lead u objeto lead completo
 * @param {object} clientData - Parámetros configurados en el formulario
 * @returns {Promise<{ success: boolean, data?: { cliente: object }, error?: string }>}
 */
export async function convertLeadToClient(leadIdOrLead, clientData = {}) {
  try {
    if (!supabase) {
      return { success: false, error: "Servicio no disponible temporalmente." };
    }

    // 1. Resolver los datos base del lead
    let lead = typeof leadIdOrLead === "object" ? leadIdOrLead : null;
    const leadId = typeof leadIdOrLead === "object" ? leadIdOrLead.id : leadIdOrLead;

    if (!lead && leadId) {
      const { data: fetchedLead, error: fetchErr } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();

      if (fetchErr) {
        console.error("convertLeadToClient fetch lead error:", fetchErr);
      }
      lead = fetchedLead || {};
    }

    const nombre = (clientData.nombre || lead?.nombre || "Nuevo Cliente").trim();
    const empresa = (clientData.empresa || clientData.nombre || lead?.nombre || nombre).trim();
    const email = clientData.email ? clientData.email.trim() : null;
    const monto_retainer = Math.max(0, Number(clientData.monto_retainer) || 0);
    const esquema_pago = clientData.esquema_pago === "quincenal" ? "dos_pagos" : "mensual";
    const dia_corte_pago = Math.min(31, Math.max(1, Number(clientData.dia_corte_pago) || 1));
    const dia_corte_pago_2 = Math.min(31, Math.max(1, Number(clientData.dia_corte_pago_2) || 15));
    const producciones_por_mes = clientData.producciones_por_mes !== undefined
      ? Math.max(0, Number(clientData.producciones_por_mes))
      : 0;
    const tipo_sesion_default = clientData.tipo_sesion_default || "mentoria";
    const locacion_default = (clientData.locacion_default || lead?.ubicacion || "").trim() || null;
    const permite_descarga = Boolean(clientData.permite_descarga);

    // 2. Insertar nuevo registro en la tabla clientes
    const clientPayload = {
      nombre,
      empresa,
      email,
      activo: true,
      permite_descarga,
      monto_retainer,
      esquema_pago,
      dia_corte_pago,
      dia_corte_pago_2: esquema_pago === "dos_pagos" ? dia_corte_pago_2 : null,
      producciones_por_mes,
      tipo_sesion_default,
      locacion_default,
      created_at: new Date().toISOString()
    };

    let { data: newClient, error: insertErr } = await supabase
      .from("clientes")
      .insert([clientPayload])
      .select()
      .single();

    // Fallback defensivo si alguna columna de migración pendiente no existe aún
    if (insertErr) {
      const fallbackPayload = { ...clientPayload };
      let hadFallback = false;
      if (insertErr.message && insertErr.message.includes("locacion_default")) {
        delete fallbackPayload.locacion_default;
        hadFallback = true;
      }
      if (
        insertErr.message &&
        (insertErr.message.includes("esquema_pago") ||
          insertErr.message.includes("dia_corte_pago_2") ||
          insertErr.message.includes("tipo_sesion_default"))
      ) {
        delete fallbackPayload.esquema_pago;
        delete fallbackPayload.dia_corte_pago_2;
        delete fallbackPayload.tipo_sesion_default;
        hadFallback = true;
      }
      if (hadFallback) {
        const retry = await supabase.from("clientes").insert([fallbackPayload]).select().single();
        if (!retry.error && retry.data) {
          newClient = retry.data;
          insertErr = null;
        }
      }
    }

    if (insertErr) {
      console.error("convertLeadToClient insert error:", insertErr);
      return { success: false, error: insertErr.message };
    }

    // 3. Actualizar la tabla leads marcando status = 'cliente_activo'
    if (leadId) {
      const { error: updateLeadErr } = await supabase
        .from("leads")
        .update({ status: "cliente_activo" })
        .eq("id", leadId);

      if (updateLeadErr) {
        console.warn("Aviso: no se pudo actualizar status en leads:", updateLeadErr);
      }
    }

    // 4. Si monto_retainer > 0 o producciones_por_mes > 0, inicializar ciclo mensual
    if (monto_retainer > 0 || producciones_por_mes > 0) {
      const now = new Date();
      await ensureCicloActual(
        newClient.id,
        now.getMonth() + 1,
        now.getFullYear(),
        monto_retainer,
        Math.max(1, producciones_por_mes),
        tipo_sesion_default,
        locacion_default
      );
    }

    return {
      success: true,
      data: { cliente: newClient }
    };
  } catch (err) {
    console.error("convertLeadToClient unexpected error:", err);
    return { success: false, error: err.message || "Error al convertir lead a cliente." };
  }
}

export { createProposalFromLead } from "./proposalCrudService";
