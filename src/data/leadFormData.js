/**
 * leadFormData.js
 * Fuentes de verdad declarativas para el Formulario de Diagnóstico de Leads.
 * Paleta bicolor oficial The Formulab: Celeste/Azul (#188ff0) y Rosa/Magenta (#ef18d6).
 */

export const LEAD_FORM_STEPS = [
  {
    id: "objetivo",
    stepNumber: 1,
    title: "¿Qué necesita tu marca hoy?",
    subtitle: null,
    helperText: null,
    options: [
      {
        id: "identidad",
        label: "Construir mi presencia desde cero",
        points: 0,
        directRoute: null,
        color: "magenta",
        icon: "Palette"
      },
      {
        id: "views_engagement",
        label: "Más alcance, views y comunidad",
        points: 1,
        directRoute: null,
        color: "blue",
        icon: "TrendingUp"
      },
      {
        id: "clientes_ventas",
        label: "Clientes y ventas reales, no solo likes",
        points: 1,
        directRoute: null,
        color: "magenta",
        icon: "Target"
      },
      {
        id: "web_landing",
        label: "Página web, landing o menú digital",
        points: 0,
        directRoute: "web",
        color: "blue",
        icon: "Globe"
      },
      {
        id: "aprender_equipo",
        label: "Aprender o capacitar a mi equipo",
        points: -5,
        directRoute: "C",
        color: "magenta",
        icon: "GraduationCap"
      }
    ]
  },
  {
    id: "nicho",
    stepNumber: 2,
    title: "¿Cuál es tu industria o nicho?",
    subtitle: null,
    helperText: null,
    isGrid: true,
    options: [
      { id: "restaurante", label: "Restaurante, café o bar", points: 0, color: "blue", icon: "UtensilsCrossed" },
      { id: "hotel", label: "Hotel o rentas vacacionales", points: 0, color: "magenta", icon: "Hotel" },
      { id: "experiencias", label: "Tours y experiencias", points: 0, color: "blue", icon: "Compass" },
      { id: "wellness", label: "Belleza, spa o fitness", points: 0, color: "magenta", icon: "Sparkles" },
      { id: "salud", label: "Salud o clínica dental", points: 0, color: "blue", icon: "Stethoscope" },
      { id: "inmobiliaria", label: "Inmobiliaria o bienes raíces", points: 0, color: "magenta", icon: "Building2" },
      { id: "retail", label: "Retail o tienda online", points: 0, color: "blue", icon: "ShoppingBag" },
      { id: "servicios", label: "Servicios profesionales", points: 0, color: "magenta", icon: "Briefcase" },
      { id: "marca_personal", label: "Marca personal o coach", points: 0, color: "blue", icon: "UserCheck" },
      { id: "otro", label: "Otro sector", points: 0, color: "magenta", icon: "Layers" }
    ]
  },
  {
    id: "operacion",
    stepNumber: 3,
    title: "¿En qué etapa está tu negocio?",
    subtitle: null,
    helperText: null,
    options: [
      {
        id: "empezando",
        label: "Apenas empezando o por lanzar",
        points: -3,
        color: "blue",
        icon: "Rocket"
      },
      {
        id: "sin_equipo",
        label: "Tengo clientes, pero sin equipo",
        points: -2,
        color: "magenta",
        icon: "User"
      },
      {
        id: "equipo_chico",
        label: "Equipo chico (2 a 5 personas)",
        points: 2,
        color: "blue",
        icon: "Users"
      },
      {
        id: "equipo_grande",
        label: "Más de 5 personas o sucursales",
        points: 4,
        color: "magenta",
        icon: "Building"
      }
    ]
  },
  {
    id: "gestion",
    stepNumber: 4,
    title: "¿Quién maneja tus redes hoy?",
    subtitle: null,
    helperText: null,
    options: [
      {
        id: "nadie",
        label: "Nadie, están pausadas",
        points: 0,
        color: "blue",
        icon: "Clock"
      },
      {
        id: "yo_tiempo",
        label: "Yo mismo, cuando tengo tiempo",
        points: 0,
        color: "magenta",
        icon: "Smartphone"
      },
      {
        id: "familiar_empleado",
        label: "Un familiar o colaborador",
        points: 1,
        color: "blue",
        icon: "Users"
      },
      {
        id: "freelance_cm",
        label: "Un freelance o community manager",
        points: 3,
        color: "magenta",
        icon: "UserCheck"
      },
      {
        id: "agencia",
        label: "Una agencia externa",
        points: 4,
        color: "blue",
        icon: "Sparkles"
      }
    ]
  },
  {
    id: "inversion",
    stepNumber: 5,
    title: "¿Cuánto inviertes al mes en marketing?",
    subtitle: "Incluye pauta, creadores o herramientas",
    helperText: null,
    options: [
      { id: "nada", label: "Nada por ahora", points: -2, color: "magenta", icon: "CircleOff" },
      { id: "menos_5k", label: "Menos de $5,000 MXN", points: 0, color: "blue", icon: "Coins" },
      { id: "5k_15k", label: "De $5,000 a $15,000 MXN", points: 2, color: "magenta", icon: "Wallet" },
      { id: "15k_40k", label: "De $15,000 a $40,000 MXN", points: 4, color: "blue", icon: "CreditCard" },
      { id: "mas_40k", label: "Más de $40,000 MXN", points: 4, color: "magenta", icon: "TrendingUp" }
    ]
  }
];

export const UBICACIONES_LIST = [
  "Cancún",
  "Playa del Carmen",
  "Tulum",
  "Otra ciudad de México",
  "Fuera de México"
];

export const CUANDO_INICIAR_LIST = [
  "Esta misma semana",
  "Durante este mes",
  "En 1 a 3 meses",
  "Solo explorando"
];
