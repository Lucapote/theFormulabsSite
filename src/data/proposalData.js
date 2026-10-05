/**
 * Default Template for creating new generic dynamic proposals
 */
export const DEFAULT_PROPOSAL_TEMPLATE = {
  // 1. INFORMACIÓN DEL CLIENTE Y MENSAJE DE BIENVENIDA
  client: {
    name: "Nombre del Cliente",
    shortName: "Cliente",
    proposalTitle: "Propuesta de Contenido",
    logoUrl: "/logo.png",
    greeting: "Hola! Estuve dándole vueltas a lo que platicamos y a cómo podemos estructurar mejor la estrategia para la marca. Quería compartirte la visión completa y aterrizada de todo el proyecto para que estemos en la misma página con el camino que vamos a tomar.",
    vision: "La idea principal con la que quiero que trabajemos es transformar la presencia digital del proyecto. No se trata solo de publicar por publicar ni de llenar un feed de fotos bonitas, sino de construir una estrategia que conecte de verdad con la gente correcta, posicione tu marca con la autoridad que merece y, sobre todo, genere resultados reales."
  },

  // 2. BASE ESTRATÉGICA INCLUIDA EN TODOS LOS PLANES
  baseFeatures: [
    "Dirección creativa",
    "Desarrollo de conceptos y hooks",
    "2 coberturas presenciales de levantamiento",
    "Banco de fotos orgánico",
    "4 carruseles mensuales",
    "Calendarios de reels e historias"
  ],

  // 3. PLANES DE PRECIOS BASE (EDITABLES EN DASHBOARD)
  pricingPlans: [
    {
      id: "esencial",
      name: "Esencial",
      subtitle: "Iniciando",
      iconName: "Sparkles",
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
      bonus: "¡Incluye 1 video publicado en colaboración estratégica!",
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
      type: "radio",
      options: [
        {
          id: "pau_marca",
          name: "Modalidad Marca",
          priceValue: 2000,
          priceLabel: "+$2,000 MXN",
          details: "Presencia como talento en cámara, conducción y voz de marca en 4 de los reels pactados ($500 MXN por pieza)."
        },
        {
          id: "pau_creadora",
          name: "Modalidad Creadora / Colaboración",
          priceValue: 3000,
          priceLabel: "+$3,000 MXN",
          details: "Presencia en cámara más la tracción de su audiencia personal y alcance cruzado en Instagram. Queda a $750 MXN por reel vs. tarifa regular."
        }
      ]
    },
    {
      id: "addon_manejo",
      title: "B. Manejo y Publicación de Redes Sociales",
      type: "checkbox",
      priceValue: 3000,
      priceLabel: "+$3,000 MXN",
      description: "Redacción de copys finales orientados a conversión, investigación de tendencias/audios, diseño de portadas y la programación/publicación íntegra de reels, carruseles e historias. (Sin gestión de DMs ni atención al cliente)."
    },
    {
      id: "addon_meta_ads",
      title: "C. Gestión de Campaña Meta Ads (Pauta)",
      type: "checkbox",
      priceValue: 2500,
      priceLabel: "+$2,500 MXN",
      description: "Montaje, segmentación de públicos, optimización semanal y reporte de resultados para campañas de tráfico, interacción o mensajes. (No incluye el presupuesto de inversión que se paga directo a Meta)."
    }
  ],

  // 5. POR QUÉ NOSOTROS Y CONDICIONES
  whyUs: [
    "Enfoque en conversión y presencia estratégica de marca.",
    "Procesos ágiles de producción sin fricción para el cliente.",
    "Dirección estética orientada al posicionamiento orgánico."
  ],
  conditions: [
    "Los pagos son mensuales por adelantado.",
    "Los precios indicados no incluyen IVA en caso de requerir factura.",
    "La vigencia de las propuestas es de 15 días naturales a partir de su envío."
  ],

  // 6. DATOS DE CONTACTO DE LA PROPUESTA
  contact: {
    name: "The Formulab",
    title: "Dirección de Estrategia Digital",
    phone: "998-123-4567",
    email: "hola@theformulab.io",
    instagram: "@theformulab"
  }
};

export const PROPOSAL_DATA = DEFAULT_PROPOSAL_TEMPLATE;
