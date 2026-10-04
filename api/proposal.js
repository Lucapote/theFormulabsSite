import { supabase, isSupabaseConfigured } from "./_lib/supabaseClient.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Fetch proposal by slug or list all proposals
  if (req.method === "GET") {
    try {
      const { slug } = req.query;

      if (!supabase) {
        return res.status(200).json({ success: false, error: "Database not configured" });
      }

      if (slug) {
        const { data, error } = await supabase
          .from("propuestas")
          .select("*")
          .eq("slug", slug.toLowerCase())
          .single();

        if (error) {
          return res.status(404).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, data });
      } else {
        const { data, error } = await supabase
          .from("propuestas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, data });
      }
    } catch (err) {
      console.error("Error in GET api/proposal:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST / PUT: Create or update proposal
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const { slug, clientName, content, id } = req.body || {};

      if (!slug || !clientName) {
        return res.status(400).json({ success: false, error: "Slug y nombre de cliente son requeridos." });
      }

      if (!supabase) {
        return res.status(500).json({ success: false, error: "Database not connected" });
      }

      const now = new Date().toISOString();
      const payload = {
        slug: slug.toLowerCase().trim(),
        cliente: clientName,
        contenido: content || {},
        updated_at: now
      };

      if (id) {
        payload.id = id;
      } else {
        payload.created_at = now;
      }

      const { data, error } = await supabase
        .from("propuestas")
        .upsert([payload], { onConflict: "slug" })
        .select();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Error in POST/PUT api/proposal:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE: Delete proposal
  if (req.method === "DELETE") {
    try {
      const { slug, id } = req.query;

      if (!supabase) {
        return res.status(500).json({ success: false, error: "Database not connected" });
      }

      let query = supabase.from("propuestas").delete();
      if (id) {
        query = query.eq("id", id);
      } else if (slug) {
        query = query.eq("slug", slug.toLowerCase());
      } else {
        return res.status(400).json({ success: false, error: "ID o Slug requerido para eliminar." });
      }

      const { data, error } = await query;
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, message: "Propuesta eliminada correctamente.", data });
    } catch (err) {
      console.error("Error in DELETE api/proposal:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
