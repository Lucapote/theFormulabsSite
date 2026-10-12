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
