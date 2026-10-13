import { supabase } from "@/lib/supabase";

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

export async function createProposal({ slug, cliente, contenido }) {
  const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");
  const now = new Date().toISOString();

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("propuestas")
        .insert([{ slug: cleanSlug, cliente, contenido, created_at: now, updated_at: now }])
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
      method: "POST",
      headers,
      body: JSON.stringify({ slug: cleanSlug, cliente, contenido })
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
