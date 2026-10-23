/**
 * Servicio Cliente para Cloudflare R2.
 * Delega las operaciones al backend (/api/r2-presigned-url y /api/upload-r2)
 * para mantener las claves de acceso de R2 100% privadas y seguras en el servidor.
 */

import { supabase } from "@/lib/supabase";
import { compressReceiptFile } from "@/utils/mediaCompressor";

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
    console.warn("No se pudo obtener el token de sesión para R2:", err);
  }
  return headers;
}

/**
 * Obtiene una URL prefirmada de subida (PUT) desde el backend serverless
 */
export async function getR2PresignedUploadUrl({ fileName, fileType, calendarioId }) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers,
      body: JSON.stringify({ fileName, fileType, calendarioId }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { success: false, error: errText || "Error obteniendo URL prefirmada" };
    }

    const json = await res.json();
    return { success: true, ...json };
  } catch (err) {
    console.error("getR2PresignedUploadUrl catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Elimina un objeto físicamente de Cloudflare R2 solicitándolo al backend
 */
export async function deleteR2Object(storageKey) {
  if (!storageKey) return { success: false, error: "Clave de almacenamiento no provista" };

  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "delete", key: storageKey }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`No se pudo eliminar objeto "${storageKey}" de R2 desde el backend:`, errText);
      return { success: false, error: errText || "Error eliminando objeto de R2" };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, ...data };
  } catch (err) {
    console.warn("deleteR2Object catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Comprime el comprobante (imagen -> WebP ultraligero ~60-120 KB o PDF validado)
 * y lo sube a Cloudflare R2 validando el token_reserva público de la sesión.
 *
 * @param {object} params
 * @param {File} params.file - Archivo de imagen o PDF seleccionado por el cliente
 * @param {string} params.tokenReserva - Token público de la sesión de producción
 * @returns {Promise<{ success: boolean, publicUrl?: string, originalSize?: number, compressedSize?: number, savedPercentage?: number, error?: string }>}
 */
export async function uploadComprobantePublico({ file, tokenReserva }) {
  if (!file || !tokenReserva) {
    return { success: false, error: "Archivo y token de reserva son obligatorios." };
  }

  try {
    // 1. Comprimir comprobante reutilizando el algoritmo de mediaCompressor.js
    const compRes = await compressReceiptFile(file);
    if (compRes.error) {
      return { success: false, error: compRes.error };
    }

    const optimizedFile = compRes.file || file;
    const fileType = optimizedFile.type || "image/webp";

    // 2. Intentar subida directa vía Serverless Proxy (/api/upload-comprobante)
    // Al ser del mismo origen (same-origin), elimina al 100% los bloqueos de CORS del navegador
    try {
      const serverlessRes = await fetch("/api/upload-comprobante", {
        method: "POST",
        headers: {
          "x-token-reserva": tokenReserva.trim(),
          "x-file-name": encodeURIComponent(optimizedFile.name),
          "x-file-type": fileType
        },
        body: optimizedFile
      });

      if (serverlessRes.ok) {
        const json = await serverlessRes.json();
        if (json.success && json.publicUrl) {
          return {
            success: true,
            publicUrl: json.publicUrl,
            originalSize: compRes.originalSize,
            compressedSize: compRes.compressedSize,
            savedPercentage: compRes.savedPercentage
          };
        }
      }
    } catch (serverlessErr) {
      console.warn("Aviso: /api/upload-comprobante no disponible, intentando URL prefirmada:", serverlessErr);
    }

    // 3. Fallback a URL prefirmada directa a Cloudflare R2
    const presignRes = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "put_comprobante",
        tokenReserva: tokenReserva.trim(),
        fileName: optimizedFile.name,
        fileType
      })
    });

    if (!presignRes.ok) {
      const errJson = await presignRes.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error || "No se pudo autorizar la subida del comprobante."
      };
    }

    const { uploadUrl, publicUrl } = await presignRes.json();
    if (!uploadUrl || !publicUrl) {
      return { success: false, error: "Respuesta de almacenamiento incompleta." };
    }

    // 4. Subir directamente el archivo comprimido a Cloudflare R2
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType
      },
      body: optimizedFile
    });

    if (!putRes.ok) {
      return { success: false, error: "Error al transferir el comprobante al servidor." };
    }

    return {
      success: true,
      publicUrl,
      originalSize: compRes.originalSize,
      compressedSize: compRes.compressedSize,
      savedPercentage: compRes.savedPercentage
    };
  } catch (err) {
    console.error("uploadComprobantePublico error:", err);
    return { success: false, error: err.message || "Error inesperado al subir el comprobante." };
  }
}

/**
 * Sube un comprobante de pago desde el panel de administración
 * con autenticación Bearer token a Cloudflare R2.
 *
 * @param {object} params
 * @param {File} params.file
 * @param {string} params.cicloId
 * @returns {Promise<{ success: boolean, publicUrl?: string, error?: string }>}
 */
export async function uploadComprobanteAdmin({ file, cicloId }) {
  if (!file || !cicloId) {
    return { success: false, error: "Archivo y cicloId son requeridos." };
  }

  try {
    const compRes = await compressReceiptFile(file);
    if (compRes.error) {
      return { success: false, error: compRes.error };
    }

    const optimizedFile = compRes.file || file;
    const fileType = optimizedFile.type || "application/pdf";

    const headers = await getAuthHeaders();
    const res = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "put_comprobante_admin",
        cicloId,
        fileName: optimizedFile.name,
        fileType
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error || "Error al obtener URL de subida." };
    }

    const { uploadUrl, publicUrl } = await res.json();
    if (!uploadUrl || !publicUrl) {
      return { success: false, error: "Respuesta de almacenamiento incompleta." };
    }

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": fileType },
      body: optimizedFile
    });

    if (!putRes.ok) {
      return { success: false, error: "Error al transferir el comprobante a R2." };
    }

    return {
      success: true,
      publicUrl,
      fileName: optimizedFile.name,
      savedPercentage: compRes.savedPercentage
    };
  } catch (err) {
    console.error("uploadComprobanteAdmin error:", err);
    return { success: false, error: err.message || "Error al subir el comprobante administrativo." };
  }
}

