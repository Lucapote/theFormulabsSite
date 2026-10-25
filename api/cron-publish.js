// api/cron-publish.js
import { createClient } from "@supabase/supabase-js";
import {
  createInstagramContainer,
  checkInstagramContainerStatus,
  publishInstagramContainer,
  publishToFacebookPage,
  sendErrorNotificationEmail
} from "./_metaPublisher.js";

async function safeUpdatePost(supabase, postId, fields) {
  const { data, error } = await supabase.from("posts").update(fields).eq("id", postId).select();
  if (!error && data && data.length > 0) return true;

  try {
    await supabase.rpc("cron_update_post_status", {
      p_post_id: postId,
      p_estado: fields.estado,
      p_meta_container_id: fields.meta_container_id || null,
      p_meta_post_id: fields.meta_post_id || null,
      p_meta_permalink: fields.meta_permalink || null,
      p_meta_publicado_at: fields.meta_publicado_at || null,
      p_error_mensaje: fields.error_mensaje !== undefined ? fields.error_mensaje : null,
      p_reintentos: fields.reintentos !== undefined ? fields.reintentos : null,
      p_plataformas: fields.plataformas_publicadas || null
    });
    return true;
  } catch (rpcErr) {
    console.warn("safeUpdatePost RPC error:", rpcErr);
    return false;
  }
}

/**
 * Endpoint serverless invocado periódicamente (cada 5 min) por cron-job.org
 * para orquestar la auto-publicación programada en Instagram Business y Facebook Pages.
 */
export default async function handler(req, res) {
  // CORS & Methods
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. Verificación de Seguridad Zero Trust
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET no está configurado en las variables de entorno.");
    return res.status(500).json({
      success: false,
      error: "CRON_SECRET no configurado en el servidor."
    });
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  if (authHeader !== expectedHeader) {
    return res.status(401).json({
      success: false,
      error: "No autorizado. Token de cron inválido o ausente."
    });
  }

  // 2. Inicializar cliente Supabase con Service Role
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      success: false,
      error: "Credenciales de Supabase no configuradas en el entorno."
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const results = {
    checkedContainers: 0,
    publishedFromContainers: 0,
    initiatedNewPosts: 0,
    publishedInstantPhotos: 0,
    errors: []
  };

  try {
    // =========================================================================
    // FASE 1: COMPLETAR CONTENEDORES EN PROCESAMIENTO (Reels / Videos pendientes)
    // =========================================================================
    const { data: processingPosts, error: procErr } = await supabase
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
        reintentos,
        created_at,
        calendarios!inner (
          id,
          cliente_id,
          clientes!inner (
            id,
            nombre,
            fb_page_id,
            fb_page_access_token,
            ig_business_account_id,
            auto_publish_enabled
          )
        )
      `)
      .eq("estado", "procesando")
      .not("meta_container_id", "is", null)
      .limit(10);

    if (procErr) {
      console.error("Error consultando posts en procesamiento:", procErr);
    } else if (processingPosts && processingPosts.length > 0) {
      for (const post of processingPosts) {
        results.checkedContainers++;
        const cliente = post.calendarios?.clientes;
        const pageToken = cliente?.fb_page_access_token;
        const igUserId = cliente?.ig_business_account_id;
        const fbPageId = cliente?.fb_page_id;

        if (!pageToken || !igUserId) {
          await supabase.from("posts").update({
            estado: "error",
            error_mensaje: "Cliente sin credenciales válidas de Meta o token revocado."
          }).eq("id", post.id);
          continue;
        }

        try {
          const statusResult = await checkInstagramContainerStatus({
            containerId: post.meta_container_id,
            pageAccessToken: pageToken
          });

          if (statusResult.statusCode === "FINISHED") {
            // Contenedor listo -> Publicar en Instagram
            const igPub = await publishInstagramContainer({
              igUserId,
              containerId: post.meta_container_id,
              pageAccessToken: pageToken
            });

            // Publicar simultáneamente en Facebook Page
            const fbPub = await publishToFacebookPage({
              fbPageId,
              post,
              pageAccessToken: pageToken
            });

            const plataformas = ["instagram"];
            if (fbPub) plataformas.push("facebook");

            await safeUpdatePost(supabase, post.id, {
              estado: "publicado",
              meta_post_id: igPub.igMediaId,
              meta_permalink: igPub.permalink,
              meta_publicado_at: new Date().toISOString(),
              error_mensaje: null,
              plataformas_publicadas: plataformas
            });

            results.publishedFromContainers++;
          } else if (statusResult.statusCode === "ERROR" || statusResult.statusCode === "EXPIRED") {
            const currentRetries = (post.reintentos || 0) + 1;
            const errMsg = statusResult.statusMessage || `Meta container status: ${statusResult.statusCode}`;

            if (currentRetries >= 2) {
              await safeUpdatePost(supabase, post.id, {
                estado: "error",
                error_mensaje: errMsg,
                reintentos: currentRetries
              });

              await sendErrorNotificationEmail({
                post,
                clienteNombre: cliente?.nombre,
                errorMsg: errMsg
              });
            } else {
              // Reintentar en siguiente ciclo
              await safeUpdatePost(supabase, post.id, {
                estado: "programado",
                meta_container_id: null,
                reintentos: currentRetries,
                error_mensaje: `Reintento automático programado: ${errMsg}`
              });
            }

            results.errors.push({ postId: post.id, error: errMsg });
          }
        } catch (itemErr) {
          console.error(`Error verificando container ${post.meta_container_id}:`, itemErr);
          results.errors.push({ postId: post.id, error: itemErr.message });
        }
      }
    }

    // =========================================================================
    // FASE 2: INICIAR NUEVOS POSTS VENCIDOS (Programados para publicar hoy/ahora)
    // =========================================================================
    const now = new Date();
    // Obtener fecha y hora en la zona horaria del negocio (America/Cancun)
    const targetTz = process.env.APP_TIMEZONE || "America/Cancun";
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: targetTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);

    const currentHourStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: targetTz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(now);

    const { data: candidates, error: candErr } = await supabase
      .from("posts")
      .select(`
        id,
        tipo_post,
        caption,
        fecha_programada,
        hora_programada,
        archivos,
        estado,
        reintentos,
        calendarios!inner (
          id,
          cliente_id,
          clientes!inner (
            id,
            nombre,
            fb_page_id,
            fb_page_access_token,
            ig_business_account_id,
            auto_publish_enabled
          )
        )
      `)
      .eq("estado", "programado")
      .eq("calendarios.clientes.auto_publish_enabled", true)
      .lte("fecha_programada", todayStr)
      .order("fecha_programada", { ascending: true })
      .order("hora_programada", { ascending: true })
      .limit(10);

    if (candErr) {
      console.error("Error consultando posts candidatos:", candErr);
      results.errors.push({ error: `Query candidatos: ${candErr.message}` });
    } else if (candidates && candidates.length > 0) {
      // Filtrar aquellos que realmente hayan llegado a su hora
      const duePosts = candidates.filter((p) => {
        const cliente = p.calendarios?.clientes;
        if (!cliente?.fb_page_access_token || !cliente?.ig_business_account_id) return false;

        if (p.fecha_programada < todayStr) return true;
        // Si es de hoy, comparar hora
        const postTime = (p.hora_programada || "00:00").slice(0, 5);
        return postTime <= currentHourStr;
      }).slice(0, 4); // Lote de máximo 4 posts para garantizar < 5s de ejecución en Vercel

      for (const post of duePosts) {
        const cliente = post.calendarios?.clientes;
        const pageToken = cliente.fb_page_access_token;
        const igUserId = cliente.ig_business_account_id;
        const fbPageId = cliente.fb_page_id;

        // Bloqueo atómico: Marcar inmediatamente como 'procesando'
        const { error: lockErr } = await supabase
          .from("posts")
          .update({ estado: "procesando", error_mensaje: null })
          .eq("id", post.id)
          .eq("estado", "programado");

        if (lockErr) continue;

        try {
          const containerRes = await createInstagramContainer({
            igUserId,
            post,
            pageAccessToken: pageToken
          });

          if (containerRes.requiresTranscoding) {
            // Video / Reel / Carrusel con video: Guardar containerId y esperar Fase 1 del próximo cron
            await safeUpdatePost(supabase, post.id, {
              meta_container_id: containerRes.containerId
            });

            results.initiatedNewPosts++;
          } else {
            // Foto estática única: Esperar brevemente (1.5 seg) y publicar de inmediato
            await new Promise((r) => setTimeout(r, 1500));

            const igPub = await publishInstagramContainer({
              igUserId,
              containerId: containerRes.containerId,
              pageAccessToken: pageToken
            });

            const fbPub = await publishToFacebookPage({
              fbPageId,
              post,
              pageAccessToken: pageToken
            });

            const plataformas = ["instagram"];
            if (fbPub) plataformas.push("facebook");

            await safeUpdatePost(supabase, post.id, {
              estado: "publicado",
              meta_container_id: containerRes.containerId,
              meta_post_id: igPub.igMediaId,
              meta_permalink: igPub.permalink,
              meta_publicado_at: new Date().toISOString(),
              error_mensaje: null,
              plataformas_publicadas: plataformas
            });

            results.publishedInstantPhotos++;
          }
        } catch (postErr) {
          console.error(`Error iniciando publicación para post ${post.id}:`, postErr);
          const currentRetries = (post.reintentos || 0) + 1;
          const errMsg = postErr.message || "Error al crear contenedor en Meta";

          if (currentRetries >= 2) {
            await safeUpdatePost(supabase, post.id, {
              estado: "error",
              error_mensaje: errMsg,
              reintentos: currentRetries
            });

            await sendErrorNotificationEmail({
              post,
              clienteNombre: cliente?.nombre,
              errorMsg: errMsg
            });
          } else {
            await safeUpdatePost(supabase, post.id, {
              estado: "programado",
              reintentos: currentRetries,
              error_mensaje: `Reintentando: ${errMsg}`
            });
          }

          results.errors.push({ postId: post.id, error: errMsg });
        }
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (globalErr) {
    console.error("api/cron-publish global error:", globalErr);
    return res.status(500).json({
      success: false,
      error: globalErr.message
    });
  }
}
