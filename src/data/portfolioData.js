/**
 * portfolioData.js
 * Datos estructurados y contratos de medios para el Portafolio oficial de The Formulab.
 * Activos alojados localmente en /public/portfolio/{marca}/{archivo}.
 * Incluye posterUrl optimizado en WebP para erradicar pantallas negras en iOS y acelerar carga en Android.
 */

export const PORTFOLIO_CATEGORIES = [
  { id: "all", label: "Todos los reels" },
  { id: "restaurantes", label: "Restaurantes & Gastro" },
  { id: "marcas-personales", label: "Marcas Personales" },
  { id: "retail-joyeria", label: "Joyería & Retail" },
  { id: "wellness", label: "Wellness & Lifestyle" }
];

export const PORTFOLIO_REELS = [
  {
    id: "yamamoto-1",
    client: "Yamamoto",
    category: "restaurantes",
    categoryLabel: "Restaurantes",
    title: "Platillo del Mes",
    hook: "El chef presenta su receta icónica en 15 segundos con ritmo dinámico.",
    videoUrl: "/portfolio/yamamoto/1.mp4",
    posterUrl: "/portfolio/yamamoto/1_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  },
  {
    id: "yamamoto-2",
    client: "Yamamoto",
    category: "restaurantes",
    categoryLabel: "Restaurantes",
    title: "Detrás de la Barra",
    hook: "La preparación artesanal que nadie ve antes de que el plato llegue a la mesa.",
    videoUrl: "/portfolio/yamamoto/2.mp4",
    posterUrl: "/portfolio/yamamoto/2_poster.webp",
    aspect: "vertical",
    colorAccent: "#188ff0"
  },
  {
    id: "yamamoto-3",
    client: "Yamamoto",
    category: "restaurantes",
    categoryLabel: "Restaurantes",
    title: "La Toma del Vapor",
    hook: "Una toma macro cinematográfica diseñada específicamente para generar antojo inmediato.",
    videoUrl: "/portfolio/yamamoto/3.mp4",
    posterUrl: "/portfolio/yamamoto/3_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  },
  {
    id: "yamamoto-4",
    client: "Yamamoto",
    category: "restaurantes",
    categoryLabel: "Restaurantes",
    title: "Experiencia Omakase",
    hook: "El ritual completo de cocina japonesa tradicional de 37 años de legado.",
    videoUrl: "/portfolio/yamamoto/4.mp4",
    posterUrl: "/portfolio/yamamoto/4_poster.webp",
    aspect: "vertical",
    colorAccent: "#188ff0"
  },
  {
    id: "mau-1",
    client: "Mau Fuentes",
    category: "marcas-personales",
    categoryLabel: "Marcas personales",
    title: "El Formato Propio",
    hook: "Un hook visual inconfundible que se reconoce en el primer segundo del scroll.",
    videoUrl: "/portfolio/mauFuentes/1.mp4",
    posterUrl: "/portfolio/mauFuentes/1_poster.webp",
    aspect: "vertical",
    colorAccent: "#188ff0"
  },
  {
    id: "mau-2",
    client: "Mau Fuentes",
    category: "marcas-personales",
    categoryLabel: "Marcas personales",
    title: "Storytime en Acción",
    hook: "Una narrativa real de alto valor contada mientras ocurre una acción física paralela.",
    videoUrl: "/portfolio/mauFuentes/2.mp4",
    posterUrl: "/portfolio/mauFuentes/2_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  },
  {
    id: "xochi-1",
    client: "Xochipilli",
    category: "wellness",
    categoryLabel: "Wellness",
    title: "De la Llegada a la Calma",
    hook: "La experiencia de relajación holística transmitida en primera persona.",
    videoUrl: "/portfolio/xochipilli/1.mp4",
    posterUrl: "/portfolio/xochipilli/1_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  },
  {
    id: "xochi-2",
    client: "Xochipilli",
    category: "wellness",
    categoryLabel: "Wellness",
    title: "Ritual de Sanación",
    hook: "Conexión con la naturaleza y calma sensorial en menos de 20 segundos.",
    videoUrl: "/portfolio/xochipilli/2.mp4",
    posterUrl: "/portfolio/xochipilli/2_poster.webp",
    aspect: "vertical",
    colorAccent: "#188ff0"
  },
  {
    id: "margaret-1",
    client: "Margaret",
    category: "marcas-personales",
    categoryLabel: "Marcas Personales",
    title: "Lookbook en Movimiento",
    hook: "Transición estilizada destacando texturas y fluidez del producto.",
    videoUrl: "/portfolio/margaret/1.mp4",
    posterUrl: "/portfolio/margaret/1_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  },
  {
    id: "margaret-2",
    client: "Margaret",
    category: "marcas-personales",
    categoryLabel: "Marcas Personales",
    title: "Detalles Quirúrgicos",
    hook: "Cortes rápidos y encuadres cercanos que realzan la calidad de la prenda.",
    videoUrl: "/portfolio/margaret/2.mp4",
    posterUrl: "/portfolio/margaret/2_poster.webp",
    aspect: "vertical",
    colorAccent: "#188ff0"
  },
  {
    id: "lemonade-1",
    client: "Lemonade",
    category: "retail-joyeria",
    categoryLabel: "Beauty & Retail",
    title: "Antes y Después",
    hook: "El resultado del servicio filmado con ritmo ágil y tendencia de audio actual.",
    videoUrl: "/portfolio/lemonade/1.mp4",
    posterUrl: "/portfolio/lemonade/1_poster.webp",
    aspect: "vertical",
    colorAccent: "#ef18d6"
  }
];

export const FEATURED_CASES = [
  {
    id: "case-yamamoto",
    code: "FL-GA-01 · GASTRONOMÍA",
    badgeLabel: "Caso Gastronómico",
    clientName: "Yamamoto Restaurante",
    challenge: "37 años de tradición culinaria de alta gama con necesidad de rejuvenecer audiencia sin perder sobriedad.",
    solution: "Micro-formatos cinematográficos de 15 segundos enfocados en sonido ASMR, vapor y corte preciso del sashimi.",
    metrics: [
      { label: "Vistas orgánicas", value: "+420K" },
      { label: "Retención promedio", value: "88%" },
      { label: "Mesas reservadas", value: "+34%" }
    ],
    quote: "Lograron que un restaurante de casi 4 décadas se sienta como el lugar más contemporáneo de Cancún en Instagram.",
    clientRole: "Dirección General · Yamamoto",
    stripVideos: [
      { id: "y1", title: "Platillo del mes", url: "/portfolio/yamamoto/1.mp4", posterUrl: "/portfolio/yamamoto/1_poster.webp" },
      { id: "y2", title: "Detrás de la barra", url: "/portfolio/yamamoto/2.mp4", posterUrl: "/portfolio/yamamoto/2_poster.webp" },
      { id: "y3", title: "La toma del vapor", url: "/portfolio/yamamoto/3.mp4", posterUrl: "/portfolio/yamamoto/3_poster.webp" },
      { id: "y4", title: "Experiencia Omakase", url: "/portfolio/yamamoto/4.mp4", posterUrl: "/portfolio/yamamoto/4_poster.webp" }
    ],
    color: "#ef18d6"
  },
  {
    id: "case-ramos",
    code: "FL-JY-02 · ALTA JOYERÍA",
    badgeLabel: "Caso Retail & Producto",
    clientName: "Ramos Joyería",
    reverseLayout: true,
    challenge: "Piezas de oro y gemas de alto valor que en foto convencional perdían el brillo, destello y volumen real.",
    solution: "Set de iluminación macro con óptica especializada y postproducción de color de precisión para capturar la refracción auténtica.",
    metrics: [
      { label: "Interacción de compra", value: "+145%" },
      { label: "Consultas por WhatsApp", value: "+82%" },
      { label: "Conversión de campaña", value: "3.4x" }
    ],
    quote: "La diferencia entre una foto de catálogo aburrida y una pieza que hipnotiza en pantalla es absoluta.",
    clientRole: "Brand Manager · Ramos Joyería",
    hasCompareSlider: true,
    compareImages: {
      setImg: "/portfolio/ramosJoyeria/2a.webp",
      finalImg: "/portfolio/ramosJoyeria/2b.webp",
      setLabel: "En el set (Raw)",
      finalLabel: "Resultado final (Postproducción)"
    },
    stripPhotos: [
      { id: "r1", title: "Anillo Solitario", url: "/portfolio/ramosJoyeria/1.webp" },
      { id: "r3", title: "Argolla Diamantada", url: "/portfolio/ramosJoyeria/3.webp" }
    ],
    color: "#188ff0"
  },
  {
    id: "case-mau",
    code: "FL-MP-03 · MARCA PERSONAL",
    badgeLabel: "Caso Marca Personal",
    clientName: "Mau Fuentes",
    challenge: "Gran autoridad y conocimiento técnico, pero con formatos dispersos que no retenían la atención en los primeros 3 segundos.",
    solution: "Diseño de un sistema de contenido en lote (batch recording) con ganchos auditivos y tomas b-roll en movimiento constante.",
    metrics: [
      { label: "Nuevos seguidores calificados", value: "+28K" },
      { label: "Tasa de completitud de video", value: "+74%" },
      { label: "Mensajes directos comerciales", value: "2.8x" }
    ],
    quote: "Grabar 20 videos en una sola sesión de 3 horas cambió por completo la consistencia de mi negocio.",
    clientRole: "Creador & Consultor",
    stripVideos: [
      { id: "m1", title: "El formato propio", url: "/portfolio/mauFuentes/1.mp4", posterUrl: "/portfolio/mauFuentes/1_poster.webp" },
      { id: "m2", title: "Storytime en acción", url: "/portfolio/mauFuentes/2.mp4", posterUrl: "/portfolio/mauFuentes/2_poster.webp" }
    ],
    color: "#ef18d6"
  }
];

export const BTS_SHOTS = [
  {
    id: "bts-1",
    title: "Montaje de luces macro",
    tag: "Ramos Joyería · Set",
    imgUrl: "/portfolio/ramosJoyeria/1.webp",
    aspect: "aspect-[4/5]",
    rotation: "-rotate-1"
  },
  {
    id: "bts-2",
    title: "Calibración de color en set",
    tag: "Ramos Joyería · Post",
    imgUrl: "/portfolio/ramosJoyeria/2a.webp",
    aspect: "aspect-[4/5]",
    rotation: "rotate-1"
  },
  {
    id: "bts-3",
    title: "Composición de producto final",
    tag: "Ramos Joyería · Entrega",
    imgUrl: "/portfolio/ramosJoyeria/3.webp",
    aspect: "aspect-[4/5]",
    rotation: "-rotate-2"
  },
  {
    id: "bts-4",
    title: "Dirección de escena gastronómica",
    tag: "Yamamoto · Cancún",
    videoPreview: "/portfolio/yamamoto/2.mp4",
    posterUrl: "/portfolio/yamamoto/2_bts_poster.webp",
    aspect: "aspect-[4/5]",
    rotation: "rotate-2"
  },
  {
    id: "bts-5",
    title: "Grabación en lote y ritmo dinámico",
    tag: "Mau Fuentes · Estudio",
    videoPreview: "/portfolio/mauFuentes/1.mp4",
    posterUrl: "/portfolio/mauFuentes/1_bts_poster.webp",
    aspect: "aspect-[4/5]",
    rotation: "-rotate-1"
  }
];

export const PORTFOLIO_BRANDS = [
  { id: "yamamoto", name: "Yamamoto", niche: "Gastronomía Japonesa" },
  { id: "ramos", name: "Ramos Joyería", niche: "Alta Joyería" },
  { id: "mau", name: "Mau Fuentes", niche: "Marca Personal" },
  { id: "xochipilli", name: "Xochipilli", niche: "Retiros & Wellness" },
  { id: "margaret", name: "Margaret", niche: "Marca Personal" },
  { id: "lemonade", name: "Lemonade", niche: "Beauty & Retail" },
  { id: "mv-mobile", name: "MV Mobile Notary", niche: "Servicios Legales B2B" },
  { id: "universal", name: "Universal Hyundai", niche: "Automotriz B2C" }
];
