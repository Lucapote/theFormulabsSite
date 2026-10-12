/**
 * leadBranching.js
 * Funciones puras y deterministas para evaluar la ramificación de leads y captura de tracking.
 * Almacenado en src/utils/ siguiendo estrictamente GEMINI.md (Sección 3.I).
 */

/**
 * Calculates internal route based on roadmap priority logic:
 * 1. Objetivo = "Página web..." -> Web
 * 2. Objetivo = "Aprender a hacerlo..." -> Ruta C (Mentoría)
 * 3. Score >= 7 -> Ruta A (Gestión integral)
 * 4. Score 3..6 -> Ruta B (Proyecto puntual)
 * 5. Score < 3 -> Ruta C (Mentoría)
 * Nota: Estas rutas y rangos son estrictamente para uso interno del equipo.
 */
export function evaluateLeadBranching(answers = {}) {
  const p1Label = answers.objetivo?.label || "";
  const p1Points = answers.objetivo?.points || 0;
  const p3Points = answers.operacion?.points || 0;
  const p4Points = answers.gestion?.points || 0;
  const p5Points = answers.inversion?.points || 0;

  const totalScore = p1Points + p3Points + p4Points + p5Points;

  let route = "C";
  let routeName = "Mentoría";
  let suggestedRange = "$650 – $5,000 MXN por sesión o paquete";

  if (p1Label.toLowerCase().includes("web") || answers.objetivo?.directRoute === "web") {
    route = "web";
    routeName = "Sitio Web";
    suggestedRange = "$6,000 – $20,000 MXN proyecto único";
  } else if (p1Label.toLowerCase().includes("aprender") || answers.objetivo?.directRoute === "C") {
    route = "C";
    routeName = "Mentoría";
    suggestedRange = "$650 – $5,000 MXN por sesión o paquete";
  } else if (totalScore >= 7) {
    route = "A";
    routeName = "Gestión Integral";
    suggestedRange = "$7,000 – $18,000 MXN al mes";
  } else if (totalScore >= 3) {
    route = "B";
    routeName = "Proyecto Puntual";
    suggestedRange = "$6,000 – $20,000 MXN proyecto único";
  } else {
    route = "C";
    routeName = "Mentoría";
    suggestedRange = "$650 – $5,000 MXN por sesión o paquete";
  }

  return {
    score: totalScore,
    route,
    routeName,
    suggestedRange
  };
}

/**
 * Extrae parámetros UTM y tracking de URL de forma determinista y segura.
 */
export function extractUrlTracking() {
  if (typeof window === "undefined") {
    return {
      src: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      referrer: ""
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    src: params.get("src") || "",
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    referrer: document.referrer || ""
  };
}
