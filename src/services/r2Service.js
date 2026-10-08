/**
 * Servicio Cliente para Cloudflare R2.
 * Delega las operaciones al backend (/api/r2-presigned-url y /api/upload-r2)
 * para mantener las claves de acceso de R2 100% privadas y seguras en el servidor.
 */

/**
 * Obtiene una URL prefirmada de subida (PUT) desde el backend serverless
 */
export async function getR2PresignedUploadUrl({ fileName, fileType, calendarioId }) {
  try {
    const res = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch("/api/r2-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
