import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

let supabase = null;
if (supabaseKey && supabaseUrl) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

async function verifyUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false };
  }
  const token = authHeader.slice(7).trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authenticated: false };
  }
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) {
    return { authenticated: false };
  }
  return { authenticated: true, user };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Proposal-Token"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Fetch proposal by slug (with server-side token validation) or list all proposals (auth required)
  if (req.method === "GET") {
    try {
      const { slug, token: queryToken } = req.query;

      if (!supabase) {
        return res.status(500).json({ success: false, error: "Database not configured" });
      }

      if (slug) {
        const cleanSlug = slug.toLowerCase().trim();
        const providedToken = queryToken || req.headers["x-proposal-token"] || null;

        // 1. Intento primario con RPC de base de datos (seguro, sanitizado y compatible con anon)
        const { data: rpcResult, error: rpcError } = await supabase.rpc("get_proposal_by_slug", {
          p_slug: cleanSlug,
          p_token: providedToken
        });

        if (!rpcError && rpcResult) {
          if (!rpcResult.success) {
            if (rpcResult.isPrivate) {
              return res.status(403).json(rpcResult);
            }
            return res.status(404).json(rpcResult);
          }
          return res.status(200).json(rpcResult);
        }

        // 2. Fallback a query directa de tabla si la RPC no responde
        const { data, error } = await supabase
          .from("propuestas")
          .select("*")
          .eq("slug", cleanSlug)
          .single();

        if (error || !data) {
          return res.status(404).json({ success: false, error: "Propuesta no encontrada." });
        }

        // Validación de token en el servidor para propuestas privadas
        const requiredToken = data.contenido?.token || data.token;
        if (requiredToken) {
          const auth = await verifyUser(req);
          if (!auth.authenticated && (!providedToken || providedToken !== requiredToken)) {
            return res.status(403).json({
              success: false,
              isPrivate: true,
              error: "Esta propuesta requiere un enlace de acceso privado válido."
            });
          }
        }

        // Sanitizar contenido: eliminar token de acceso antes de enviar la respuesta al cliente
        const sanitizedContent = { ...(data.contenido || {}) };
        delete sanitizedContent.token;

        const sanitizedData = {
          ...data,
          contenido: sanitizedContent,
          token: undefined
        };

        return res.status(200).json({ success: true, data: sanitizedData });
      } else {
        // Listar todas las propuestas requiere autenticación administrativa
        const auth = await verifyUser(req);
        if (!auth.authenticated) {
          return res.status(401).json({ success: false, error: "Autenticación requerida para listar propuestas." });
        }

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

  // POST / PUT: Create or update proposal (requires authentication)
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const auth = await verifyUser(req);
      if (!auth.authenticated) {
        return res.status(401).json({ success: false, error: "No autorizado. Se requiere iniciar sesión como administrador." });
      }

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

  // DELETE: Delete proposal (requires authentication)
  if (req.method === "DELETE") {
    try {
      const auth = await verifyUser(req);
      if (!auth.authenticated) {
        return res.status(401).json({ success: false, error: "No autorizado. Se requiere iniciar sesión como administrador." });
      }

      const { slug, id } = req.query;

      if (!supabase) {
        return res.status(500).json({ success: false, error: "Database not connected" });
      }

      let query = supabase.from("propuestas").delete();
      if (id) {
        query = query.eq("id", id);
      } else if (slug) {
        query = query.eq("slug", slug.toLowerCase().trim());
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
