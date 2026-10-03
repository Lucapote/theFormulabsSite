export const STEPS = [
  { id: "ingresos", q: "¿Cuáles son los ingresos mensuales aproximados?", opts: ["Menos de $5,000 USD", "$5,000 – $20,000 USD", "$20,000 – $100,000 USD", "Más de $100,000 USD"] },
  { id: "fuente", q: "¿Cuál es la fuente principal de clientes?", opts: ["Ads pagados (Meta, Google, TikTok)", "Orgánico (SEO, redes sociales)", "Referidos / boca a boca", "Outbound / ventas directas"] },
  { id: "problema", q: "¿Cuál es el principal problema percibido?", opts: ["No llegan suficientes prospectos", "Llegan prospectos pero no compran", "Compran una vez y no regresan", "Operaciones caóticas / no escala"] },
  { id: "ticket", q: "¿Cuál es el ticket promedio por cliente?", opts: ["Menos de $100 USD", "$100 – $500 USD", "$500 – $2,000 USD", "Más de $2,000 USD"] },
  { id: "conversion", q: "¿Tienes estimada tu tasa de conversión?", opts: ["Sí, menos del 5%", "Sí, entre 5% y 20%", "Sí, más del 20%", "No la conozco"] }
];

export const TUBE_COLORS = ["#ef18d6", "#188ff0", "#ef18d6", "#188ff0", "#ef18d6"];
export const TAG_BG = ["rgba(239, 24, 214, 0.12)", "rgba(24, 143, 240, 0.12)", "rgba(239, 24, 214, 0.12)", "rgba(24, 143, 240, 0.12)", "rgba(239, 24, 214, 0.12)"];
export const TAG_TXT = ["#ef18d6", "#188ff0", "#ef18d6", "#188ff0", "#ef18d6"];

export const PROCESSING = [
  "Indexando variables del sistema…",
  "Detectando restricción principal…",
  "Calculando fuga de ingresos…",
  "Generando Formula Rx™…",
  "Compilando diagnóstico…"
];

export function buildDiagnostic(a) {
  const isAds = a.fuente?.includes("Ads");
  const isNoConvert = a.problema?.includes("no compran");
  const isNoTraffic = a.problema?.includes("suficientes");
  const isChurn = a.problema?.includes("regresan");
  const isOps = a.problema?.includes("caóticas");
  const isLow = a.ingresos?.includes("5,000");

  let tipo, restriccion, fuga, oportunidad, urgencia;

  if (isNoConvert && isAds) {
    tipo = "Conversión — falla en el proceso de cierre";
    restriccion = "Gasto en adquisición sin infraestructura de conversión. El sistema financia su propio problema.";
    fuga = isLow ? "$1,800–$3,500/mes en ads no recuperados" : "$4,200–$9,000/mes en oportunidad perdida";
    oportunidad = "Construir un mecanismo de cierre: nurturing + argumento de valor + reducción de fricción en punto de decisión.";
    urgencia = "Crítico — ventana de acción: 2–4 semanas.";
  } else if (isNoTraffic) {
    tipo = "Adquisición — volumen de prospectos insuficiente";
    restriccion = "El sistema no genera suficiente demanda entrante. Sin volumen, no hay conversión posible.";
    fuga = isLow ? "$800–$2,000/mes en potencial no alcanzado" : "$3,500–$8,000/mes en capacidad instalada ociosa";
    oportunidad = "Diversificar fuentes de adquisición y activar canales orgánicos.";
    urgencia = "Alto — el techo de crecimiento permanece bloqueado.";
  } else if (isChurn) {
    tipo = "Retención — ciclo de vida del cliente truncado";
    restriccion = "Opera en modo adquisición permanente sin capitalizar la base existente.";
    fuga = isLow ? "$1,200–$2,800/mes en LTV no capturado" : "$5,000–$12,000/mes en ingresos recurrentes no generados";
    oportunidad = "Implementar seguimiento post-compra y programa de reactivación.";
    urgencia = "Moderado-Alto — impacto compuesto con el tiempo.";
  } else if (isOps) {
    tipo = "Operativo — sistema no escalable";
    restriccion = "El crecimiento está bloqueado por capacidad operativa. Más ventas = más caos.";
    fuga = isLow ? "$900–$2,200/mes en horas-hombre perdidas" : "$4,000–$10,000/mes en ineficiencia acumulada";
    oportunidad = "Mapear y sistematizar procesos críticos antes de escalar.";
    urgencia = "Alto — escalar sin resolver esto destruye valor.";
  } else {
    tipo = "Conversión — proceso de cierre no optimizado";
    restriccion = "El sistema tiene demanda pero no convierte eficientemente.";
    fuga = "$1,500–$4,000/mes en oportunidades no capturadas";
    oportunidad = "Optimizar el proceso de decisión: claridad de oferta + prueba social + reducción de fricción.";
    urgencia = "Moderado-Alto — impacto directo en el próximo ciclo.";
  }

  return [
    { label: "Tipo de problema", value: tipo, icon: "⚛", tag: "Diagnóstico primario", locked: false },
    { label: "Restricción principal", value: restriccion, icon: "🔬", tag: "Punto crítico", locked: false },
    { label: "Fuga de ingresos estimada", value: fuga, icon: "💊", tag: "Cálculo activo", locked: true },
    { label: "Oportunidad de optimización", value: oportunidad, icon: "🧪", tag: "Estrategia", locked: true },
    { label: "Urgencia / Impacto", value: urgencia, icon: "📊", tag: "Índice de impacto", locked: true }
  ];
}
