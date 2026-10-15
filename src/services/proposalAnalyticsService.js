import { supabase } from "@/lib/supabase";

/**
 * Service for proposal view tracking and analytics metrics
 */

export async function incrementProposalViews(idOrObj, currentViews = 0, currentContenido = {}) {
  let id = null;
  let slug = null;
  let views = 0;
  let contenido = {};

  if (typeof idOrObj === "object" && idOrObj !== null) {
    id = idOrObj.id;
    slug = idOrObj.slug;
    views = idOrObj.currentViews ?? idOrObj.views ?? 0;
    contenido = idOrObj.currentContenido || idOrObj.contenido || idOrObj;
  } else if (typeof idOrObj === "string") {
    if (idOrObj.includes("-") && idOrObj.length > 20) {
      id = idOrObj;
    } else {
      slug = idOrObj;
    }
    views = currentViews;
    contenido = currentContenido;
  } else {
    id = idOrObj;
    views = currentViews;
    contenido = currentContenido;
  }

  const cleanSlug = slug || contenido?.slug || "";

  try {
    if (supabase && cleanSlug) {
      const { error: rpcError } = await supabase.rpc("increment_proposal_views", {
        p_slug: cleanSlug.toLowerCase()
      });

      if (!rpcError) {
        return { success: true };
      }
      console.warn("RPC view increment warning, trying direct update fallback:", rpcError);
    }

    const newCount = (Number(views) || 0) + 1;
    const { id: _i, slug: _s, cliente: _c, ...cleanContenido } = contenido;
    const updatedContent = {
      ...cleanContenido,
      views: newCount
    };

    if (supabase) {
      let query = supabase.from("propuestas").update({ contenido: updatedContent });
      if (id) {
        query = query.eq("id", id);
      } else if (cleanSlug) {
        query = query.eq("slug", cleanSlug.toLowerCase());
      } else {
        return;
      }
      const { data, error } = await query.select();
      if (!error && data && data.length > 0) {
        return { success: true };
      }
    }

    // Serverless API fallback
    await fetch("/api/proposal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        slug: cleanSlug,
        clientName: contenido?.client?.name || contenido?.cliente || "Cliente",
        content: updatedContent
      })
    });
    return { success: true };
  } catch (err) {
    console.warn("View increment notice:", err);
  }
}

/**
 * Registra eventos analíticos o interacciones clave en propuestas comerciales
 * @param {string|object} proposalIdOrSlug - ID, slug u objeto de la propuesta
 * @param {string} eventName - Nombre del evento (ej. 'proposal_accept_clicked')
 * @param {object} [metadata={}] - Metadatos adicionales del evento
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function trackProposalEvent(proposalIdOrSlug, eventName, metadata = {}) {
  try {
    const slug = typeof proposalIdOrSlug === "object" && proposalIdOrSlug !== null
      ? (proposalIdOrSlug.slug || proposalIdOrSlug.contenido?.slug || "")
      : (typeof proposalIdOrSlug === "string" ? proposalIdOrSlug : "");

    // Tracking en Google Analytics si está activo
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        proposal_slug: slug,
        ...metadata
      });
    }

    // Registro en console info para observabilidad
    console.info(`[ProposalAnalytics] ${eventName}:`, { slug, ...metadata });

    return { success: true };
  } catch (err) {
    console.warn("trackProposalEvent notice:", err);
    return { success: false, error: err.message };
  }
}
