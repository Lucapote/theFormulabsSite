import { DEFAULT_PROPOSAL_TEMPLATE as defaultTemplate } from "@/data/proposalData";
import { formatPriceLabel, formatAddonLabel } from "@/utils/formatters";

/**
 * Builds structured JSON proposal content from raw modal form data.
 */
export function buildProposalContentJson(formData) {
  const existingContent = formData.existingContent || defaultTemplate;
  const plans = existingContent.pricingPlans || defaultTemplate.pricingPlans;
  const updatedPlans = plans.map((plan) => {
    if (plan.id === "esencial") {
      return { ...plan, price: Number(formData.priceEsencial), priceLabel: formatPriceLabel(formData.priceEsencial) };
    }
    if (plan.id === "crecimiento") {
      return { ...plan, price: Number(formData.priceCrecimiento), priceLabel: formatPriceLabel(formData.priceCrecimiento) };
    }
    if (plan.id === "escala") {
      return { ...plan, price: Number(formData.priceEscala), priceLabel: formatPriceLabel(formData.priceEscala) };
    }
    return plan;
  });

  const addonsList = existingContent.addons || defaultTemplate.addons;
  const updatedAddons = addonsList.map((addon) => {
    if (addon.id === "addon_pau_camara" && addon.options) {
      return {
        ...addon,
        options: addon.options.map((opt) => {
          if (opt.id === "pau_marca") {
            return { ...opt, priceValue: Number(formData.pricePauMarca), priceLabel: formatAddonLabel(formData.pricePauMarca) };
          }
          if (opt.id === "pau_creadora") {
            return { ...opt, priceValue: Number(formData.pricePauCreadora), priceLabel: formatAddonLabel(formData.pricePauCreadora) };
          }
          return opt;
        })
      };
    }
    if (addon.id === "addon_manejo") {
      return { ...addon, priceValue: Number(formData.priceManejoRedes), priceLabel: formatAddonLabel(formData.priceManejoRedes) };
    }
    if (addon.id === "addon_meta_ads") {
      return { ...addon, priceValue: Number(formData.priceMetaAds), priceLabel: formatAddonLabel(formData.priceMetaAds) };
    }
    return addon;
  });

  const token = existingContent.token || (Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6));

  const existingScope = existingContent.scope || {};
  const existingPricing = existingContent.pricing || {};

  const scope = {
    producciones_por_mes: Number(formData.produccionesPorMes) || existingScope.producciones_por_mes || 2,
    precio_sesion_extra: Number(formData.precioSesionExtra) || existingScope.precio_sesion_extra || 3500,
    tipo_sesion_default: formData.tipoSesionDefault || existingScope.tipo_sesion_default || "reels_batch"
  };

  const basePrice = Number(formData.priceCrecimiento) || existingPricing.basePrice || 14500;
  const extraSessionsCount = Number(formData.extraSessionsCount !== undefined ? formData.extraSessionsCount : existingPricing.extraSessionsCount) || 0;
  const totalPrice = basePrice + (extraSessionsCount * scope.precio_sesion_extra);

  const pricing = {
    basePrice,
    extraSessionsCount,
    totalPrice
  };

  return {
    ...existingContent,
    token,
    client: {
      ...(existingContent.client || {}),
      name: formData.clientName,
      shortName: formData.shortName || formData.clientName,
      email: formData.email !== undefined ? formData.email : (existingContent.client?.email || ""),
      whatsapp: formData.whatsapp !== undefined ? formData.whatsapp : (existingContent.client?.whatsapp || ""),
      instagram: formData.instagram !== undefined ? formData.instagram : (existingContent.client?.instagram || ""),
      location: formData.location !== undefined ? formData.location : (existingContent.client?.location || ""),
      proposalTitle: formData.proposalTitle || "Propuesta de Contenido",
      greeting: formData.greeting || defaultTemplate.client.greeting,
      vision: formData.vision || defaultTemplate.client.vision
    },
    pricingPlans: updatedPlans,
    addons: updatedAddons,
    scope,
    pricing,
    producciones_por_mes: scope.producciones_por_mes,
    tipo_sesion_default: scope.tipo_sesion_default
  };
}

