// api/publish-now.js
import { createClient } from "@supabase/supabase-js";
import {
  createInstagramContainer,
  checkInstagramContainerStatus,
  publishInstagramContainer,
  publishToFacebookPage
} from "./_metaPublisher.js";

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

/**
 * Endpoint serverless para disparar la publicación inmediata o reintento manual
 * desde el Dashboard administrativo para un post específico.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido. Solo se acepta POST." });
  }

  // 1. Validar autenticación de administrador
  const auth = await verifySupabaseAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ success: false, error: auth.error });
  }

  const { postId } = req.body || {};
  if (!postId) {
    return res.status(400).json({ success: false, error: "postId es requerido." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 2. Obtener datos del post y credenciales del cliente
    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select(`
        id,
        tipo_post,
        caption,
        fecha_programada,
        hora_programada,
        archivos,
        estado,
        meta_container_id,
        calendarios!inner (
          id,
          cliente_id,
          clientes!inner (
            id,
            nombre,
            fb_page_id,
            fb_page_access_token,
            ig_business_account_id
          )
        )
      `)
      .eq("id", postId)
      .single();

    if (postErr || !post) {
      return res.status(404).json({ success: false, error: "Post no encontrado." });
    }

    const cliente = post.calendarios?.clientes;
    const pageToken = cliente?.fb_page_access_token;
    const igUserId = cliente?.ig_business_account_id;
    const fbPageId = cliente?.fb_page_id;

    if (!pageToken || !igUserId) {
      return res.status(400).json({
        success: false,
        error: "El cliente asociado no tiene cuenta de Instagram Business o token de Meta configurado."
      });
    }

    // Actualizar estado a procesando
    await supabase.from("posts").update({
      estado: "procesando",
      error_mensaje: null
    }).eq("id", postId);

    let containerId = post.meta_container_id;

    // Si aún no hay contenedor o el anterior falló, crear uno nuevo
    if (!containerId) {
      const containerRes = await createInstagramContainer({
        igUserId,
        post,
        pageAccessToken: pageToken
      });
      containerId = containerRes.containerId;
      await supabase.from("posts").update({
        meta_container_id: containerId
      }).eq("id", postId);
    }

    // Esperar hasta 6 segundos verificando si finaliza la transcodificación
    let isReady = false;
    let attempts = 0;
    while (!isReady && attempts < 3) {
      attempts++;
      const statusRes = await checkInstagramContainerStatus({
        containerId,
        pageAccessToken: pageToken
      });

      if (statusRes.statusCode === "FINISHED") {
        isReady = true;
        break;
      }
      if (statusRes.statusCode === "ERROR") {
        throw new Error(`Meta Container Error: ${statusRes.statusMessage || "Error en transcodificación"}`);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    if (isReady) {
      // Publicar en Instagram
      const igPub = await publishInstagramContainer({
        igUserId,
        containerId,
        pageAccessToken: pageToken
      });

      // Publicar en Facebook
      const fbPub = await publishToFacebookPage({
        fbPageId,
        post,
        pageAccessToken: pageToken
      });

      const plataformas = ["instagram"];
      if (fbPub) plataformas.push("facebook");

      await supabase.from("posts").update({
        estado: "publicado",
        meta_post_id: igPub.igMediaId,
        meta_permalink: igPub.permalink,
        meta_publicado_at: new Date().toISOString(),
        error_mensaje: null,
        plataformas_publicadas: plataformas
      }).eq("id", postId);

      return res.status(200).json({
        success: true,
        message: "¡Post publicado exitosamente en Meta!",
        data: {
          igMediaId: igPub.igMediaId,
          permalink: igPub.permalink,
          plataformas
        }
      });
    } else {
      // Si el video sigue transcodificando en Meta, queda en estado 'procesando' y el cron lo publicará en cuanto termine
      return res.status(200).json({
        success: true,
        message: "Contenedor enviado a Meta. La transcodificación continuará en segundo plano y el cron lo publicará automáticamente.",
        data: { containerId, estado: "procesando" }
      });
    }
  } catch (err) {
    console.error("api/publish-now error:", err);
    await supabase.from("posts").update({
      estado: "error",
      error_mensaje: err.message
    }).eq("id", postId);

    return res.status(500).json({
      success: false,
      error: err.message || "Error al procesar la publicación en Meta."
    });
  }
}
