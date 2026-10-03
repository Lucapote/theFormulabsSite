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
