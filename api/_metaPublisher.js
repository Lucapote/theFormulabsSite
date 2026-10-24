// api/_metaPublisher.js
import { Resend } from "resend";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Normaliza las URLs públicas de archivos asignados a un post.
 */
export function extractPostMedia(post) {
  const archivos = Array.isArray(post.archivos) ? post.archivos : [];
  if (archivos.length === 0) return { primaryMedia: null, allMedia: [] };

  const validMedia = archivos.map((item) => {
    const url = item.url || item.storage_url || "";
    const isVideo =
      item.tipo === "video" ||
      /\.(mp4|mov|webm|m4v|avi)$/i.test(url) ||
      /\.(mp4|mov|webm|m4v|avi)$/i.test(item.nombre_archivo || "");

    return {
      id: item.id,
      url,
      isVideo,
      name: item.nombre_archivo || "archivo"
    };
  }).filter((m) => Boolean(m.url));

  return {
    primaryMedia: validMedia[0] || null,
    allMedia: validMedia
  };
}

/**
 * Crea un contenedor de medios en Instagram Graph API para un Post.
 * Para Reels/Videos devuelve el creation_id que debe ser transcodificado.
 */
export async function createInstagramContainer({ igUserId, post, pageAccessToken }) {
  if (!igUserId) throw new Error("No hay ig_business_account_id configurado para este cliente.");
  if (!pageAccessToken) throw new Error("Falta el page_access_token permanente de Meta.");

  const { primaryMedia, allMedia } = extractPostMedia(post);
  if (!primaryMedia) {
    throw new Error("El post no contiene ningún archivo multimedia asignado.");
  }

  const caption = post.caption || "";
  const tipoPost = post.tipo_post || (primaryMedia.isVideo ? "reel" : "carrousel");

  // CASO 1: REEL / VIDEO INDIVIDUAL
  if (tipoPost === "reel" || (allMedia.length === 1 && primaryMedia.isVideo)) {
    const endpoint = `${GRAPH_BASE_URL}/${igUserId}/media`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: primaryMedia.url,
        caption,
        share_to_feed: true,
        access_token: pageAccessToken
      })
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`Meta Instagram Reel Container: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return {
      containerId: data.id,
      requiresTranscoding: true,
      mediaType: "REELS"
    };
  }

  // CASO 2: FOTO ÚNICA
  if (allMedia.length === 1 && !primaryMedia.isVideo) {
    const endpoint = `${GRAPH_BASE_URL}/${igUserId}/media`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: primaryMedia.url,
        caption,
        access_token: pageAccessToken
      })
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`Meta Instagram Photo Container: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return {
      containerId: data.id,
      requiresTranscoding: false,
      mediaType: "IMAGE"
    };
  }

  // CASO 3: CARRUSEL (2 a 10 medios)
  if (allMedia.length > 1) {
    const itemsToProcess = allMedia.slice(0, 10);
    const childIds = [];

    for (const item of itemsToProcess) {
      const childPayload = {
        is_carousel_item: true,
        access_token: pageAccessToken
      };

      if (item.isVideo) {
        childPayload.media_type = "VIDEO";
        childPayload.video_url = item.url;
      } else {
        childPayload.image_url = item.url;
      }

      const childRes = await fetch(`${GRAPH_BASE_URL}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(childPayload)
      });

      const childData = await childRes.json();
      if (childData.error) {
        throw new Error(`Meta Carousel Item (${item.name}): ${childData.error.message}`);
      }
      childIds.push(childData.id);
    }

    // Crear el contenedor padre de Carrusel
    const carouselRes = await fetch(`${GRAPH_BASE_URL}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        caption,
        children: childIds.join(","),
        access_token: pageAccessToken
      })
    });

    const carouselData = await carouselRes.json();
    if (carouselData.error) {
      throw new Error(`Meta Carousel Parent: ${carouselData.error.message}`);
    }

    const hasVideo = allMedia.some((m) => m.isVideo);
    return {
      containerId: carouselData.id,
      requiresTranscoding: hasVideo,
      mediaType: "CAROUSEL"
    };
  }

  throw new Error("Formato de contenido o archivos no soportados.");
}

/**
 * Consulta el estado de procesamiento de un contenedor en Instagram Graph API.
 */
export async function checkInstagramContainerStatus({ containerId, pageAccessToken }) {
  if (!containerId) throw new Error("containerId no especificado.");
  const url = `${GRAPH_BASE_URL}/${containerId}?fields=id,status_code,status&access_token=${pageAccessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Check Instagram Container: ${data.error.message}`);
  }

  return {
    statusCode: data.status_code, // 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED'
    statusMessage: data.status || ""
  };
}

/**
 * Publica un contenedor de medios en Instagram una vez finalizada su transcodificación.
 */
export async function publishInstagramContainer({ igUserId, containerId, pageAccessToken }) {
  const url = `${GRAPH_BASE_URL}/${igUserId}/media_publish`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: pageAccessToken
    })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Publish Instagram Media: ${data.error.message}`);
  }

  const igMediaId = data.id;
  let permalink = null;

  try {
    const permalinkRes = await fetch(`${GRAPH_BASE_URL}/${igMediaId}?fields=permalink&access_token=${pageAccessToken}`);
    const permalinkData = await permalinkRes.json();
    if (permalinkData && permalinkData.permalink) {
      permalink = permalinkData.permalink;
    }
  } catch (e) {
    console.warn("No se pudo obtener permalink de Instagram:", e);
  }

  return {
    igMediaId,
    permalink: permalink || `https://www.instagram.com/`
  };
}

/**
 * Publica simultáneamente en la Página de Facebook asociada.
 */
export async function publishToFacebookPage({ fbPageId, post, pageAccessToken }) {
  if (!fbPageId || !pageAccessToken) return null;

  const { primaryMedia, allMedia } = extractPostMedia(post);
  if (!primaryMedia) return null;

  const caption = post.caption || "";

  // 1. Video / Reel para Facebook
  if (primaryMedia.isVideo) {
    const videoUrl = `${GRAPH_BASE_URL}/${fbPageId}/videos`;
    const res = await fetch(videoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: primaryMedia.url,
        description: caption,
        access_token: pageAccessToken
      })
    });

    const data = await res.json();
    if (data.error) {
      console.warn("Error publicando video en Facebook Page:", data.error);
      return null;
    }
    return { fbPostId: data.id };
  }

  // 2. Foto única para Facebook
  if (allMedia.length === 1) {
    const photoUrl = `${GRAPH_BASE_URL}/${fbPageId}/photos`;
    const res = await fetch(photoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: primaryMedia.url,
        caption,
        access_token: pageAccessToken
      })
    });

    const data = await res.json();
    if (data.error) {
      console.warn("Error publicando foto en Facebook Page:", data.error);
      return null;
    }
    return { fbPostId: data.post_id || data.id };
  }

  // 3. Multi-foto / Feed genérico para Facebook
  const feedUrl = `${GRAPH_BASE_URL}/${fbPageId}/feed`;
  const res = await fetch(feedUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: caption,
      link: primaryMedia.url,
      access_token: pageAccessToken
    })
  });

  const data = await res.json();
  if (data.error) {
    console.warn("Error publicando feed en Facebook Page:", data.error);
    return null;
  }
  return { fbPostId: data.id };
}

/**
 * Envía una notificación de alerta a la agencia mediante Resend cuando un post falla de forma definitiva.
 */
export async function sendErrorNotificationEmail({ post, clienteNombre, errorMsg }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "tu_resend_api_key_aqui") return;

  try {
    const resend = new Resend(apiKey);
    const fromEmail = process.env.LEAD_NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.LEAD_NOTIFICATION_TO_EMAIL || "theformulab.io@gmail.com";

    const subject = `⚠️ Fallo en Auto-publicación Meta: ${clienteNombre || "Cliente"}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #dc2626; border-radius: 16px; padding: 28px;">
          <h2 style="color: #ef4444; margin-top: 0;">Error en Publicación Automática</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Un post programado no pudo ser publicado en Meta tras superar los reintentos automáticos.</p>
          
          <table style="width: 100%; margin: 16px 0; border-collapse: collapse; font-size: 13px; color: #94a3b8;">
            <tr><td style="padding: 6px 0; font-weight: 600; color: #f1f5f9;">Cliente:</td><td>${clienteNombre || "Sin nombre"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600; color: #f1f5f9;">Fecha Programada:</td><td>${post.fecha_programada || "Hoy"} a las ${post.hora_programada || "18:00"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600; color: #f1f5f9;">Formato:</td><td>${post.tipo_post || "Reel"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600; color: #ef4444;">Motivo del Error:</td><td style="color: #fca5a5;">${errorMsg}</td></tr>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://www.theformulab.io/dashboard" style="display: inline-block; background-color: #188ff0; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              Revisar en Dashboard &rarr;
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent
    });
  } catch (e) {
    console.error("Error enviando notificación de fallo por email:", e);
  }
}
