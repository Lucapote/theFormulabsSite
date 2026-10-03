import { supabase } from "@/lib/supabase";

/**
 * Service for proposals CRUD operations with Supabase + Serverless API Fallback
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
    const res = await fetch("/api/proposal");
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

export async function fetchProposalBySlug(slug) {
  if (!slug) return { success: false, data: null, error: "Slug no provisto" };
  const cleanSlug = slug.toLowerCase();

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("propuestas")
        .select("*")
        .eq("slug", cleanSlug)
        .single();

      if (!error && data) {
        return { success: true, data: data.contenido || data.content || data };
      }
    }

    // Serverless API fallback
    const res = await fetch(`/api/proposal?slug=${encodeURIComponent(cleanSlug)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const item = json.data;
        return { success: true, data: item.contenido || item.content || item };
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
    const res = await fetch("/api/proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch("/api/proposal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`/api/proposal?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
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
