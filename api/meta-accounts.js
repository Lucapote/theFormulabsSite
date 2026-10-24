// api/meta-accounts.js
import { createClient } from "@supabase/supabase-js";

async function verifySupabaseAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Token de autorización requerido." };
  }
  const token = authHeader.slice(7).trim();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authenticated: false, error: "Servicio de autenticación no configurado." };
  }
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) {
    return { authenticated: false, error: "Sesión inválida o expirada." };
  }
  return { authenticated: true, user };
}

export default async function handler(req, res) {
  // 1. Seguridad: Solo permitimos peticiones GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método HTTP no permitido. Utiliza GET." });
  }

  // 2. Control de Acceso: Verificar autenticación de sesión administrativa (Zero Trust)
  const auth = await verifySupabaseAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: auth.error || "No autorizado para consultar cuentas de Meta." });
  }

  // 3. Leer la llave maestra desde el entorno seguro del servidor (.env.local / Vercel)
  const token = process.env.META_USER_ACCESS_TOKEN;
  
  if (!token) {
    console.error("Falta META_USER_ACCESS_TOKEN en las variables de entorno.");
    return res.status(500).json({ error: "El servidor no tiene configurado el token de Meta." });
  }

  try {
    // 4. Consultar a la Graph API de Meta
    const url = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100&access_token=${token}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 5. Mapear y limpiar los datos
    const pages = (data.data || []).map((page) => ({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      instagramId: page.instagram_business_account?.id || null,
      instagramUsername: page.instagram_business_account?.username || null
    }));

    return res.status(200).json({ pages });
  } catch (error) {
    console.error("Error de integración con Meta API:", error.message);
    return res.status(500).json({ error: `Fallo al comunicarse con Meta: ${error.message}` });
  }
}
