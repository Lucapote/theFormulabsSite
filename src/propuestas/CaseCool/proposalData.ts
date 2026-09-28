/**
 * ==============================================================================
 * CONFIGURACIÓN DE DATOS DE LA PROPUESTA - THE FORMULAB (CASE COOL)
 * ==============================================================================
 * Edita este archivo para personalizar la propuesta comercial para cada cliente.
 * Cambia nombres, textos, planes, precios, adicionales y datos de contacto.
 * ==============================================================================
 */

export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  price: number;
  priceLabel: string;
  currency: string;
  period: string;
  reels: number;
  description: string;
  highlight: boolean;
  bonus?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  priceValue: number;
  priceLabel: string;
  details: string;
}

export interface Addon {
  id: string;
  title: string;
  description?: string;
  type: 'radio' | 'checkbox';
  priceValue?: number;
  priceLabel?: string;
  options?: AddonOption[];
}

export interface ProposalData {
  client: {
    name: string;
    shortName: string;
    proposalTitle: string;
    logoUrl: string;
    greeting: string;
    vision: string;
  };
  baseFeatures: string[];
  pricingPlans: PricingPlan[];
  addons: Addon[];
  whyUs: string[];
  conditions: string[];
  contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
    instagram: string;
  };
}

export const PROPOSAL_DATA: ProposalData = {
  // 1. INFORMACIÓN DEL CLIENTE Y MENSAJE DE BIENVENIDA
  client: {
    name: "Case Cool",
    shortName: "Case Cool",
    proposalTitle: "Propuesta de Contenido",
    logoUrl: "/logo.png", // Imagen en la carpeta public/
    greeting: "Hola!! Estuve dándole vueltas a lo que platicamos y a cómo podemos estructurar mejor la estrategia para la marca. Quería compartirte la visión completa y aterrizada de todo el proyecto para que estemos en la misma página con el camino que vamos a tomar.",
    vision: "La idea principal con la que quiero que trabajemos es transformar la presencia digital del proyecto. No se trata solo de publicar por publicar ni de llenar un feed de fotos bonitas, sino de construir una estrategia que conecte de verdad con la gente correcta, posicione tu marca con la autoridad que merece y, sobre todo, genere resultados reales."
  },

  // 2. BASE ESTRATÉGICA INCLUIDA (Puntos clave incluidos en todos los paquetes)
  baseFeatures: [
    "Dirección creativa",
    "Desarrollo de conceptos y hooks",
    "2 coberturas presenciales de levantamiento",
    "Banco de fotos orgánico",
    "4 carruseles mensuales",
    "Calendarios de reels e historias"
  ],

  // 3. PLANES DE PRECIOS
  pricingPlans: [
    {
      id: "esencial",
      name: "Esencial",
      subtitle: "Iniciando",
      iconName: "Sparkles", // Opciones de ícono: "Sparkles", "TrendingUp", "Zap"
      price: 10000,
      priceLabel: "$10,000",
      currency: "MXN",
      period: "/mes",
      reels: 5,
      description: "Mantenimiento activo y curado; selección precisa de conceptos clave al mes.",
      highlight: false
    },
    {
      id: "crecimiento",
      name: "Crecimiento",
      subtitle: "Recomendado",
      iconName: "TrendingUp",
      price: 14500,
      priceLabel: "$14,500",
      currency: "MXN",
      period: "/mes",
      reels: 8,
      description: "Diversificación de pilares (2 impactos semanales), mayor profundidad narrativa y testing de formatos.",
      highlight: true
    },
    {
      id: "escala",
      name: "Escala / Dominio",
      subtitle: "Alto Impacto",
      iconName: "Zap",
      price: 18500,
      priceLabel: "$18,500",
      currency: "MXN",
      period: "/mes",
      reels: 12,
      bonus: "¡Incluye 1 video publicado en colaboración en el feed de @pauthecreative!",
      description: "Cobertura integral de alta frecuencia (3 impactos semanales), saturación de marca y retención continua.",
      highlight: false
    }
  ],

  // 4. MÓDULOS ADICIONALES (ADD-ONS)
  addons: [
    {
      id: "addon_pau_camara",
      title: "A. Pau en Cámara",
      description: "(4 videos del paquete contratado)",
      type: "radio", // "radio" para opciones mutuamente exclusivas
      options: [
        {
          id: "pau_marca",
          name: "Modalidad Marca",
          priceValue: 2000,
          priceLabel: "+$2,000 MXN",
          details: "(Solo en perfil de Lemonade). Presencia como talento en cámara, conducción y voz de marca en 4 de los reels pactados ($500 MXN por pieza)."
        },
        {
          id: "pau_creadora",
          name: "Modalidad Creadora / Colaboración",
          priceValue: 3000,
          priceLabel: "+$3,000 MXN",
          details: "(Publicado en @pauthecreative + Lemonade). Presencia en cámara más la tracción de su audiencia personal y alcance cruzado en Instagram. Queda a $750 MXN por reel vs. los $1,200 MXN de su tarifa regular por pieza (ahorro de $1,800 MXN en el mes)."
        }
      ]
    },
    {
      id: "addon_manejo",
      title: "B. Manejo y Publicación de Redes Sociales",
      type: "checkbox", // "checkbox" para activar/desactivar individualmente
      priceValue: 3000,
      priceLabel: "+$3,000 MXN",
      description: "Redacción de copys finales orientados a conversión, investigación de tendencias/audios, diseño de portadas y la programación/publicación íntegra de reels, carruseles e historias. (Sin gestión de DMs ni atención al cliente)."
    },
    {
      id: "addon_meta_ads",
      title: "C. Manejo y Optimización de Meta Ads",
      type: "checkbox",
      priceValue: 2500,
      priceLabel: "+$2,500 MXN",
      description: "(Sin presupuesto de pauta). Configuración de campañas en Meta Business Suite, segmentación local en Cancún, testeo estratégico pautando los mejores reels orgánicos creados en el mes y entrega de reporte de métricas."
    }
  ],

  // 5. ¿POR QUÉ NOSOTROS?
  whyUs: [
    "Resultados orgánicos que se pueden comprobar, no promesas de agencia.",
    "Dirección creativa con experiencia real en el sector belleza y wellness.",
    "Contenido pensado para retener y convertir, no solo para llenar el feed.",
    "Flexibilidad para acompañar el ritmo real del negocio, no el nuestro."
  ],

  // 6. CONDICIONES COMERCIALES
  conditions: [
    "Los paquetes no incluyen gestión, programación ni respuesta de redes sociales a menos que se agregue el módulo correspondiente.",
    "El pago se realiza de forma mensual y por adelantado.",
    "Un cambio de paquete puede solicitarse antes de iniciar el siguiente ciclo, sin complicaciones.",
    "Todo el material se entrega en formato vertical, listo para publicar.",
    "Propuesta vigente por 15 días naturales a partir de su envío."
  ],

  // 7. DATOS DE CONTACTO
  contact: {
    name: "Paulina Núñez",
    title: "Founder & Dirección Creativa",
    phone: "998-214-8831",
    email: "hello@theformulab.io",
    instagram: "@pauthecreative"
  }
};
