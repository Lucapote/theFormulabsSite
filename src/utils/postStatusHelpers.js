/**
 * postStatusHelpers.js
 * Matriz oficial de estados de publicación para The Formulab.
 * Código cromático y lógica de visualización según GEMINI.md:
 * - sin_empezar: Rojo (#ef4444)
 * - en_edicion: Amarillo (#f59e0b)
 * - en_aprobacion: Morado (#8b5cf6)
 * - aprobado: Verde (#10b981)
 * - programado: Azul (#188ff0)
 */

export const POST_STATUSES = {
  sin_empezar: {
    key: "sin_empezar",
    label: "Sin empezar",
    colorHex: "#ef4444",
    dotClass: "bg-rose-500",
    textClass: "text-rose-500",
    badgeClass: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    lightBadgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
    pillCalendarClass: "bg-rose-500 text-white shadow-xs shadow-rose-500/30",
    requiresMedia: false,
    description: "Slot agendado en borrador preliminar. Aún no se produce material."
  },
  en_edicion: {
    key: "en_edicion",
    label: "En edición",
    colorHex: "#f59e0b",
    dotClass: "bg-amber-500",
    textClass: "text-amber-500",
    badgeClass: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    lightBadgeClass: "bg-amber-50 text-amber-800 border border-amber-200",
    pillCalendarClass: "bg-amber-500 text-white shadow-xs shadow-amber-500/30",
    requiresMedia: false,
    description: "Redacción de copy o edición de video en proceso activo por la agencia."
  },
  en_aprobacion: {
    key: "en_aprobacion",
    label: "En aprobación",
    colorHex: "#8b5cf6",
    dotClass: "bg-purple-500",
    textClass: "text-purple-400",
    badgeClass: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    lightBadgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
    pillCalendarClass: "bg-purple-500 text-white shadow-xs shadow-purple-500/30",
    requiresMedia: true,
    description: "Contenido listo y enviado para validación por parte del cliente."
  },
  aprobado: {
    key: "aprobado",
    label: "Aprobado",
    colorHex: "#10b981",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    lightBadgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    pillCalendarClass: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30",
    requiresMedia: true,
    description: "Publicación validada con éxito por el cliente."
  },
  programado: {
    key: "programado",
    label: "Programado",
    colorHex: "#188ff0",
    dotClass: "bg-[#188ff0]",
    textClass: "text-blue-500",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    lightBadgeClass: "bg-blue-50 text-[#188ff0] border border-blue-200",
    pillCalendarClass: "bg-[#188ff0] text-white shadow-xs shadow-blue-500/30",
    requiresMedia: true,
    description: "Programado en Meta / plataformas listo para emisión oficial."
  },
  publicado: {
    key: "publicado",
    label: "Publicado",
    colorHex: "#ef18d6",
    dotClass: "bg-pink-500",
    textClass: "text-pink-500",
    badgeClass: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
    lightBadgeClass: "bg-pink-50 text-pink-600 border border-pink-200",
    pillCalendarClass: "bg-pink-500 text-white shadow-xs shadow-pink-500/30",
    requiresMedia: true,
    description: "Publicación emitida y en vivo en redes sociales."
  }
};

export const POST_STATUS_LIST = [
  POST_STATUSES.sin_empezar,
  POST_STATUSES.en_edicion,
  POST_STATUSES.en_aprobacion,
  POST_STATUSES.aprobado,
  POST_STATUSES.programado,
  POST_STATUSES.publicado
];

/**
 * Devuelve la metadata asociada al estado indicado. Si no coincide, normaliza
 * estados legacy (borrador -> sin_empezar).
 */
export function getPostStatusMeta(estado) {
  if (!estado) return POST_STATUSES.sin_empezar;

  const normalized = String(estado).toLowerCase();

  if (POST_STATUSES[normalized]) {
    return POST_STATUSES[normalized];
  }

  // Compatibilidad legacy
  if (normalized === "borrador") {
    return POST_STATUSES.sin_empezar;
  }

  return POST_STATUSES.programado;
}

/**
 * Determina si el estado permite guardar la publicación sin asignar archivos obligatorios.
 */
export function canSaveWithoutMedia(estado) {
  const norm = String(estado || "").toLowerCase();
  return norm === "sin_empezar" || norm === "en_edicion" || norm === "borrador";
}

/**
 * Determina si la publicación está esperando aprobación del cliente.
 */
export function isApprovalPending(estado) {
  return String(estado || "").toLowerCase() === "en_aprobacion";
}

/**
 * Determina si la publicación tiene sus activos listos para descarga y copiado por el cliente.
 */
export function isAssetDownloadable(estado) {
  const norm = String(estado || "").toLowerCase();
  return ["aprobado", "programado", "publicado"].includes(norm);
}
