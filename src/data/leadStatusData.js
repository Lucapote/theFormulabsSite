/**
 * Catálogo estático de estados de seguimiento para leads / prospectos.
 * Cumple con GEMINI.md (Sección 3.D: Fuentes de verdad puramente declarativas).
 */

export const LEAD_STATUS_CONFIG = {
  en_espera: {
    key: "en_espera",
    label: "En espera",
    colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    dotClass: "bg-amber-400"
  },
  contactado: {
    key: "contactado",
    label: "Contactado",
    colorClass: "text-brand-blue bg-blue-50 border-blue-200",
    dotClass: "bg-brand-blue"
  },
  en_negociacion: {
    key: "en_negociacion",
    label: "En negociación",
    colorClass: "text-purple-700 bg-purple-50 border-purple-200",
    dotClass: "bg-purple-500"
  },
  cerrado: {
    key: "cerrado",
    label: "Cerrado / Ganado",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dotClass: "bg-emerald-500"
  },
  descartado: {
    key: "descartado",
    label: "Descartado",
    colorClass: "text-gray-600 bg-gray-100 border-gray-200",
    dotClass: "bg-gray-400"
  }
};

export const LEAD_STATUS_OPTIONS = Object.values(LEAD_STATUS_CONFIG);
