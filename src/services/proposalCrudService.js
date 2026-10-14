import { supabase } from "@/lib/supabase";
import { DEFAULT_PROPOSAL_TEMPLATE } from "@/data/proposalData";

async function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }
  } catch (err) {
    console.warn("No se pudo obtener el token de sesión para propuesta:", err);
  }
  return headers;
}

/**
 * Service for proposals CRUD operations (Create, Read, Update, Delete)
 * with Supabase + Serverless API Fallback
 */

export async function fetchProposals() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("propuestas")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return { success: true, data };
      }
    }

    // Serverless API fallback
    const headers = await getAuthHeaders();
    const res = await fetch("/api/proposal", { headers });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data || [] };
    }

    return { success: false, data: [], error: "No se pudieron obtener las propuestas" };
  } catch (err) {
    console.error("fetchProposals error:", err);
    return { success: false, data: [], error: err.message };
  }
}

export async function fetchProposalBySlug(slug, token = null) {
  if (!slug) return { success: false, data: null, error: "Slug no provisto" };
  const cleanSlug = slug.toLowerCase().trim();

  try {
    // 1. Consulta directa y segura mediante RPC con validación de token a nivel de BD
    if (supabase) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("get_proposal_by_slug", {
        p_slug: cleanSlug,
        p_token: token || null
      });

      if (!rpcError && rpcResult) {
        if (rpcResult.success && rpcResult.data) {
          const raw = rpcResult.data;
          const content = raw.contenido || raw.content || raw;
          return {
            success: true,
            data: {
              ...content,
              id: raw.id,
              slug: raw.slug,
              cliente: raw.cliente
            },
            rawRecord: raw
          };
        }

        if (rpcResult.isPrivate) {
          return {
            success: false,
            isPrivate: true,
            error: rpcResult.error || "Esta propuesta requiere un enlace de acceso privado válido."
          };
        }

        return {
          success: false,
          data: null,
          error: rpcResult.error || `No se encontró la propuesta para "${slug}"`
        };
      }
    }

    // 2. Fallback a Serverless API
    const queryParams = new URLSearchParams({ slug: cleanSlug });
    if (token) {
      queryParams.set("token", token);
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`/api/proposal?${queryParams.toString()}`, { headers });
    const json = await res.json().catch(() => ({}));

    if (res.ok && json.success && json.data) {
      const data = json.data;
      const content = data.contenido || data.content || data;
      return {
        success: true,
        data: {
          ...content,
          id: data.id,
          slug: data.slug,
          cliente: data.cliente
        },
        rawRecord: data
      };
    }

    if (res.status === 403 || json.isPrivate) {
      return {
        success: false,
        isPrivate: true,
        error: json.error || "Esta propuesta requiere un enlace de acceso privado válido."
      };
    }

    // 3. Direct Supabase fallback if authenticated
    if (supabase) {
      const { data, error } = await supabase
        .from("propuestas")
        .select("*")
        .eq("slug", cleanSlug)
        .single();

      if (!error && data) {
        const content = data.contenido || data.content || data;
        return {
          success: true,
          data: {
            ...content,
            id: data.id,
            slug: data.slug,
            cliente: data.cliente
          },
          rawRecord: data
        };
      }
    }

    return { success: false, data: null, error: `No se encontró la propuesta para "${slug}"` };
  } catch (err) {
    console.error("fetchProposalBySlug error:", err);
    return { success: false, data: null, error: err.message };
  }
}

export async function createProposal({
  slug,
  cliente,
  contenido,
  version = 1,
  propuesta_padre_id = null,
  notas_version = null
}) {
  const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");
  const now = new Date().toISOString();

  const insertPayload = {
    slug: cleanSlug,
    cliente,
    contenido,
    version: Number(version) || 1,
    propuesta_padre_id: propuesta_padre_id || null,
    notas_version: notas_version || null,
    created_at: now,
    updated_at: now
  };

  try {
    if (supabase) {
      let { data, error } = await supabase
        .from("propuestas")
        .insert([insertPayload])
        .select();

      // Fallback defensivo si columnas no estuvieran disponibles
      if (
        error &&
        (error.message?.includes("version") ||
          error.message?.includes("propuesta_padre_id") ||
          error.message?.includes("notas_version"))
      ) {
        const fallback = { slug: cleanSlug, cliente, contenido, created_at: now, updated_at: now };
        const retry = await supabase.from("propuestas").insert([fallback]).select();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        return { success: true, data: data[0] };
      }
      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Serverless API fallback
    const headers = await getAuthHeaders();
    const res = await fetch("/api/proposal", {
      method: "POST",
      headers,
      body: JSON.stringify({
        slug: cleanSlug,
        clientName: cliente,
        cliente,
        content: contenido,
        contenido,
        version: Number(version) || 1,
        propuesta_padre_id: propuesta_padre_id || null,
        notas_version: notas_version || null
      })
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data };
    }

    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.error || "Error al crear propuesta" };
  } catch (err) {
    console.error("createProposal error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateProposal(id, { cliente, contenido, slug }) {
  const now = new Date().toISOString();

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("propuestas")
        .update({ cliente, contenido, slug, updated_at: now })
        .eq("id", id)
        .select();

      if (!error && data) {
        return { success: true, data: data[0] };
      }
      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Serverless API fallback
    const headers = await getAuthHeaders();
    const res = await fetch("/api/proposal", {
      method: "PUT",
      headers,
      body: JSON.stringify({ id, cliente, contenido, slug })
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data };
    }

    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.error || "Error al actualizar propuesta" };
  } catch (err) {
    console.error("updateProposal error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteProposal(id) {
  try {
    if (supabase) {
      const { error } = await supabase.from("propuestas").delete().eq("id", id);
      if (!error) {
        return { success: true };
      }
    }

    // Serverless API fallback
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/proposal?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers
    });

    if (res.ok) {
      return { success: true };
    }

    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.error || "Error al eliminar propuesta" };
  } catch (err) {
    console.error("deleteProposal error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Genera un slug URL-friendly a partir de un texto.
 */
function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Crea una propuesta preliminar prellenada a partir del expediente clínico de un Lead.
 * Genera un slug único, ensambla el JSON `contenido` con plantilla estándar y datos del prospecto,
 * e inserta en `propuestas` y actualiza el lead a `propuesta_creada`.
 *
 * @param {Object} lead - Objeto lead con { id, nombre, instagram, whatsapp, ubicacion, score, route, answers, ... }
 * @returns {Promise<{ success: boolean, data?: { propuesta: Object }, error?: string }>}
 */
export async function createProposalFromLead(lead) {
  if (!lead) {
    return { success: false, error: "Datos del prospecto no proporcionados." };
  }

  try {
    const rawName = lead.nombre?.trim() || "Prospecto";
    const baseSlug = slugify(rawName) || "propuesta";
    const uniqueSuffix = Date.now().toString(36);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const shortName = rawName.split(" ")[0] || rawName;
    const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);

    const initialContent = {
      ...DEFAULT_PROPOSAL_TEMPLATE,
      token,
      client: {
        ...(DEFAULT_PROPOSAL_TEMPLATE.client || {}),
        name: rawName,
        shortName: shortName,
        company: rawName,
        instagram: lead.instagram || "",
        whatsapp: lead.whatsapp || "",
        location: lead.ubicacion || ""
      },
      suggestedRoute: lead.route_name || lead.route || null,
      diagnosticScore: lead.score ?? null,
      diagnosticAnswers: lead.answers || {}
    };

    // 1. Insertar propuesta en la base de datos
    const createRes = await createProposal({
      slug,
      cliente: rawName,
      contenido: initialContent
    });

    if (!createRes.success || !createRes.data) {
      return { success: false, error: createRes.error || "No se pudo registrar la propuesta." };
    }

    const nuevaPropuesta = createRes.data;

    // 2. Actualizar estado del lead a 'propuesta_creada' si aplica
    if (supabase && lead.id) {
      const { error: leadUpdateErr } = await supabase
        .from("leads")
        .update({ status: "propuesta_creada" })
        .eq("id", lead.id);

      if (leadUpdateErr) {
        console.warn("Aviso: no se pudo actualizar status en leads a propuesta_creada:", leadUpdateErr);
      }
    }

    return {
      success: true,
      data: {
        propuesta: nuevaPropuesta
      }
    };
  } catch (err) {
    console.error("createProposalFromLead error:", err);
    return {
      success: false,
      error: err.message || "Error al generar la propuesta desde el prospecto."
    };
  }
}

/**
 * Obtiene el historial ordenado de versiones para la familia de una propuesta (raíz e iteraciones).
 * WHERE id = raizId OR propuesta_padre_id = raizId ORDER BY version ASC.
 *
 * @param {string} propuestaId - ID de la propuesta consultada
 * @returns {Promise<{ success: boolean, data: Array<Object>, raizId?: string, error?: string }>}
 */
export async function getProposalVersionHistory(propuestaId) {
  if (!propuestaId) {
    return { success: false, error: "ID de propuesta no proporcionado.", data: [] };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Servicio de base de datos no disponible.", data: [] };
    }

    // 1. Obtener la propuesta para identificar la raíz (raizId)
    const { data: propuesta, error: propErr } = await supabase
      .from("propuestas")
      .select("id, propuesta_padre_id, version, slug, cliente, notas_version, created_at, updated_at")
      .eq("id", propuestaId)
      .single();

    if (propErr || !propuesta) {
      return { success: false, error: propErr?.message || "Propuesta no encontrada.", data: [] };
    }

    const raizId = propuesta.propuesta_padre_id || propuesta.id;

    // 2. Obtener todas las propuestas que pertenezcan a esa raíz ordenadas por version ASC
    const { data: versiones, error: listErr } = await supabase
      .from("propuestas")
      .select("id, slug, cliente, version, propuesta_padre_id, notas_version, created_at, updated_at")
      .or(`id.eq.${raizId},propuesta_padre_id.eq.${raizId}`)
      .order("version", { ascending: true });

    if (listErr) {
      console.error("Error en getProposalVersionHistory:", listErr);
      return { success: false, error: listErr.message, data: [propuesta] };
    }

    return {
      success: true,
      data: versiones && versiones.length > 0 ? versiones : [propuesta],
      raizId
    };
  } catch (err) {
    console.error("getProposalVersionHistory error:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// Alias de compatibilidad
export const getProposalVersions = getProposalVersionHistory;

/**
 * Duplica e itera una propuesta comercial existente creando una nueva versión vinculada.
 *
 * @param {string} propuestaOriginalId - ID de la propuesta original a duplicar
 * @param {Object} options - { notas_version, nuevoSlug }
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function duplicateProposalVersion(
  propuestaOriginalId,
  { notas_version = "", nuevoSlug = null } = {}
) {
  try {
    if (!supabase) {
      return { success: false, error: "Servicio de base de datos no disponible." };
    }

    if (!propuestaOriginalId) {
      return { success: false, error: "ID de propuesta original no proporcionado." };
    }

    // 1. Obtener la propuesta a duplicar por su ID
    const { data: propuesta, error: propErr } = await supabase
      .from("propuestas")
      .select("*")
      .eq("id", propuestaOriginalId)
      .single();

    if (propErr || !propuesta) {
      return { success: false, error: propErr?.message || "No se encontró la propuesta original." };
    }

    // 2. Determinar la raíz (raizId):
    // Si ya tiene propuesta_padre_id, la raíz es esa misma. Si es null, es ella misma.
    const raizId = propuesta.propuesta_padre_id || propuesta.id;

    // 3. Consultar la versión máxima existente para esa raíz:
    // SELECT MAX(version) FROM propuestas WHERE id = raizId OR propuesta_padre_id = raizId
    const { data: familyVersions, error: familyErr } = await supabase
      .from("propuestas")
      .select("version")
      .or(`id.eq.${raizId},propuesta_padre_id.eq.${raizId}`);

    let maxVersion = Number(propuesta.version) || 1;
    if (!familyErr && familyVersions && familyVersions.length > 0) {
      const nums = familyVersions.map((v) => Number(v.version) || 1);
      maxVersion = Math.max(...nums, maxVersion);
    }
    const siguienteVersion = (maxVersion || 1) + 1;

    // 4. Generar el slug único si no se proporcionó:
    // Limpiar sufijos -v[0-9]+ del slug base y añadir -v${siguienteVersion} (ej. yamamoto-v2)
    let slugFinal = nuevoSlug ? nuevoSlug.toLowerCase().trim().replace(/\s+/g, "-") : null;
    if (!slugFinal) {
      const baseSlug = (propuesta.slug || "propuesta").replace(/-v[0-9]+$/i, "");
      slugFinal = `${baseSlug}-v${siguienteVersion}`;
    }

    // 5. Clonar el JSON contenido de la propuesta original, actualizando metadatos internos
    const rawContenido = propuesta.contenido ? JSON.parse(JSON.stringify(propuesta.contenido)) : {};
    const newToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);

    const contenidoClonado = {
      ...rawContenido,
      token: newToken,
      versionNumber: siguienteVersion,
      versionNotes: notas_version || `Iteración v${siguienteVersion}`,
      issuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 6. Insertar el nuevo registro en propuestas
    const res = await createProposal({
      slug: slugFinal,
      cliente: propuesta.cliente,
      contenido: contenidoClonado,
      version: siguienteVersion,
      propuesta_padre_id: raizId,
      notas_version: notas_version || null
    });

    if (!res.success) {
      return { success: false, error: res.error || "Error al registrar la nueva versión." };
    }

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error("duplicateProposalVersion error:", err);
    return { success: false, error: err.message || "Error al duplicar versión de la propuesta." };
  }
}

// Alias de compatibilidad
export const createProposalVersion = (propuestaIdOrObject, opts) => {
  const id = typeof propuestaIdOrObject === "object" ? propuestaIdOrObject?.id : propuestaIdOrObject;
  return duplicateProposalVersion(id, {
    notas_version: opts?.notas_version,
    nuevoSlug: opts?.customSlug
  });
};

/**
 * Actualiza las notas descriptivas de una versión específica de propuesta.
 *
 * @param {string} propuestaId - ID de la propuesta
 * @param {string} notas_version - Nuevas notas o resumen del cambio
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function updateProposalVersionNotes(propuestaId, notas_version) {
  if (!propuestaId) return { success: false, error: "ID de propuesta no provisto." };

  try {
    if (!supabase) return { success: false, error: "Servicio no disponible." };

    const { data, error } = await supabase
      .from("propuestas")
      .update({ notas_version, updated_at: new Date().toISOString() })
      .eq("id", propuestaId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("updateProposalVersionNotes unexpected error:", err);
    return { success: false, error: err.message };
  }
}

