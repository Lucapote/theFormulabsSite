export const PROPOSAL_DATA = {
  // 1. INFORMACIÓN DEL CLIENTE Y MENSAJE DE BIENVENIDA
  client: {
    name: "Case Cool",
    shortName: "Case Cool",
    proposalTitle: "Propuesta de Contenido",
    logoUrl: "/logo.png",
    // Logo desde la carpeta public/
    greeting: "Hola!! Estuve d\xE1ndole vueltas a lo que platicamos y a c\xF3mo podemos estructurar mejor la estrategia para la marca. Quer\xEDa compartirte la visi\xF3n completa y aterrizada de todo el proyecto para que estemos en la misma p\xE1gina con el camino que vamos a tomar.",
    vision: "La idea principal con la que quiero que trabajemos es transformar la presencia digital del proyecto. No se trata solo de publicar por publicar ni de llenar un feed de fotos bonitas, sino de construir una estrategia que conecte de verdad con la gente correcta, posicione tu marca con la autoridad que merece y, sobre todo, genere resultados reales."
  },
  // 2. BASE ESTRATÉGICA INCLUIDA (Puntos clave incluidos en todos los paquetes)
  baseFeatures: [
    "Direcci\xF3n creativa",
    "Desarrollo de conceptos y hooks",
    "2 coberturas presenciales de levantamiento",
    "Banco de fotos org\xE1nico",
    "4 carruseles mensuales",
    "Calendarios de reels e historias"
  ],
  // 3. PLANES DE PRECIOS
  pricingPlans: [
    {
      id: "esencial",
      name: "Esencial",
      subtitle: "Iniciando",
      iconName: "Sparkles",
      // Opciones de ícono: "Sparkles", "TrendingUp", "Zap"
      price: 1e4,
      priceLabel: "$10,000",
      currency: "MXN",
      period: "/mes",
      reels: 5,
      description: "Mantenimiento activo y curado; selecci\xF3n precisa de conceptos clave al mes.",
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
      description: "Diversificaci\xF3n de pilares (2 impactos semanales), mayor profundidad narrativa y testing de formatos.",
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
      bonus: "\xA1Incluye 1 video publicado en colaboraci\xF3n en el feed de @pauthecreative!",
      description: "Cobertura integral de alta frecuencia (3 impactos semanales), saturaci\xF3n de marca y retenci\xF3n continua.",
      highlight: false
    }
  ],
  // 4. MÓDULOS ADICIONALES (ADD-ONS)
  addons: [
    {
      id: "addon_pau_camara",
      title: "A. Pau en C\xE1mara",
      description: "(4 videos del paquete contratado)",
      type: "radio",
      // "radio" para opciones mutuamente exclusivas
      options: [
        {
          id: "pau_marca",
          name: "Modalidad Marca",
          priceValue: 2e3,
          priceLabel: "+$2,000 MXN",
          details: "(Solo en perfil de Lemonade). Presencia como talento en c\xE1mara, conducci\xF3n y voz de marca en 4 de los reels pactados ($500 MXN por pieza)."
        },
        {
          id: "pau_creadora",
          name: "Modalidad Creadora / Colaboraci\xF3n",
          priceValue: 3e3,
          priceLabel: "+$3,000 MXN",
          details: "(Publicado en @pauthecreative + Lemonade). Presencia en c\xE1mara m\xE1s la tracci\xF3n de su audiencia personal y alcance cruzado en Instagram. Queda a $750 MXN por reel vs. los $1,200 MXN de su tarifa regular por pieza (ahorro de $1,800 MXN en el mes)."
        }
      ]
    },
    {
      id: "addon_manejo",
      title: "B. Manejo y Publicaci\xF3n de Redes Sociales",
      type: "checkbox",
      // "checkbox" para activar/desactivar individualmente
      priceValue: 3e3,
      priceLabel: "+$3,000 MXN",
      description: "Redacci\xF3n de copys finales orientados a conversi\xF3n, investigaci\xF3n de tendencias/audios, dise\xF1o de portadas y la programaci\xF3n/publicaci\xF3n \xEDntegra de reels, carruseles e historias. (Sin gesti\xF3n de DMs ni atenci\xF3n al cliente)."
    },
    {
      id: "addon_meta_ads",
      title: "C. Manejo y Optimizaci\xF3n de Meta Ads",
      type: "checkbox",
      priceValue: 2500,
      priceLabel: "+$2,500 MXN",
      description: "(Sin presupuesto de pauta). Configuraci\xF3n de campa\xF1as en Meta Business Suite, segmentaci\xF3n local en Canc\xFAn, testeo estrat\xE9gico pautando los mejores reels org\xE1nicos creados en el mes y entrega de reporte de m\xE9tricas."
    }
  ],
  // 5. ¿POR QUÉ NOSOTROS?
  whyUs: [
    "Resultados org\xE1nicos que se pueden comprobar, no promesas de agencia.",
    "Direcci\xF3n creativa con experiencia real en el sector belleza y wellness.",
    "Contenido pensado para retener y convertir, no solo para llenar el feed.",
    "Flexibilidad para acompa\xF1ar el ritmo real del negocio, no el nuestro."
  ],
  // 6. CONDICIONES COMERCIALES
  conditions: [
    "Los paquetes no incluyen gesti\xF3n, programaci\xF3n ni respuesta de redes sociales a menos que se agregue el m\xF3dulo correspondiente.",
    "El pago se realiza de forma mensual y por adelantado.",
    "Un cambio de paquete puede solicitarse antes de iniciar el siguiente ciclo, sin complicaciones.",
    "Todo el material se entrega en formato vertical, listo para publicar.",
    "Propuesta vigente por 15 d\xEDas naturales a partir de su env\xEDo."
  ],
  // 7. DATOS DE CONTACTO
  contact: {
    name: "Paulina N\xFA\xF1ez",
    title: "Founder & Direcci\xF3n Creativa",
    phone: "998-214-8831",
    email: "hello@theformulab.io",
    instagram: "@pauthecreative"
  }
};
