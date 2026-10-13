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


