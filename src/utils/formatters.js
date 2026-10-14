/**
 * Utility functions for formatting prices and labels
 */

export const formatPrice = (price) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0
  }).format(price || 0);
};

export const formatPriceLabel = (num) => `$${Number(num || 0).toLocaleString("es-MX")}`;

export const formatAddonLabel = (num) => `+$${Number(num || 0).toLocaleString("es-MX")} MXN`;

export const formatLeadDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

export const formatSecondsToTime = (seconds) => {
  if (!seconds || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

/**
 * Retorna la fecha local en formato YYYY-MM-DD respetando la zona horaria del cliente (sin sesgo de UTC)
 */
export const getLocalDateString = (d = new Date()) => {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export { triggerMediaDownload } from "./downloadHelpers";

export const MESES_ANIO = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Obtiene el nombre por defecto o personalizado de una sesión de producción.
 * Si tiene nombre personalizado: lo devuelve.
 * Si no:
 *   - Si totalSesiones > 1: "Sesión {numero_sesion} de {totalSesiones}" (ej: "Sesión 1 de 2")
 *   - Si totalSesiones <= 1: "Sesión {Mes}" (ej: "Sesión Octubre")
 */
export const getSessionDisplayName = (produccion, mes = null, totalSesiones = 1) => {
  if (produccion?.nombre && typeof produccion.nombre === "string" && produccion.nombre.trim()) {
    return produccion.nombre.trim();
  }
  const sessionNum = produccion?.numero_sesion || 1;
  const count = Number(totalSesiones) || 1;

  if (count > 1) {
    return `Sesión ${sessionNum} de ${count}`;
  }

  let mesIndex = null;
  if (mes !== null && mes !== undefined) {
    mesIndex = Number(mes) - 1;
  } else if (produccion?.fecha_produccion) {
    mesIndex = new Date(produccion.fecha_produccion).getMonth();
  } else {
    mesIndex = new Date().getMonth();
  }

  const mesNombre = MESES_ANIO[mesIndex] || "";
  return mesNombre ? `Sesión ${mesNombre}` : `Sesión #${sessionNum}`;
};

/**
 * Genera la URL de reserva de una producción considerando el origin actual (localhost o producción)
 */
export const getBookingUrl = (token) => {
  if (!token) return "";
  const origin = typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "https://www.theformulab.io";
  return `${origin}/reservar/produccion?token=${token}`;
};


