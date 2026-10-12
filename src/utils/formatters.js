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

export { triggerMediaDownload } from "./downloadHelpers";

