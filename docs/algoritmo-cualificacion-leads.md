# Algoritmo de Cualificación y Ramificación de Leads · The Formulab

Este documento describe la arquitectura, lógica matemática y reglas de decisión que operan en segundo plano para clasificar automáticamente a cada prospecto que completa el diagnóstico interactivo en The Formulab.

---

## 1. Filosofía de Diseño: "Cualificación Invisible"

### ¿Por qué el Score no se muestra en la interfaz?
El puntaje numérico (`score`) es un **mecanismo de cálculo interno**, una heurística algorítmica diseñada para predecir la madurez operativa y la capacidad de inversión del cliente.

1. **Enfoque Comercial Directo**: Al equipo de ventas y cuentas no le resulta útil ver un número abstracto como `+5 pts` o `-2 pts`. Lo que realmente necesita saber al abrir un expediente es:
   - **¿Qué servicio necesita?** (Gestión Integral, Proyecto Puntual, Mentoría Clínica, Sitio Web).
   - **¿Cuál es su capacidad de inversión / presupuesto mensual?**
   - **¿Qué tamaño de equipo tiene y cómo opera actualmente?**
   - **¿A través de qué canal contactarlo?** (WhatsApp o Instagram).
2. **Cero Sesgo ni Fricción**: El cliente jamás se siente juzgado por un número o calificado como "bueno" o "malo".
3. **Decisiones Claras**: El score procesa las respuestas y se traduce inmediatamente en una **Ruta de Servicio** con su rango de propuesta sugerido.

---

## 2. Estructura de Evaluación y Ponderaciones

El formulario consta de 5 preguntas clínicas de diagnóstico seguidas por la pantalla de captura de contacto. Cuatro de estas preguntas ponderan puntos matemáticos para inferir la madurez del negocio:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Objetivo │ ──► │  2. Nicho   │ ──► │  3. Etapa   │ ──► │ 4. Gestión  │ ──► │ 5. Inversión│
│   (0 a +1)  │     │ (0 pts / BD)│     │  (-3 a +4)  │     │  (0 a +4)   │     │  (-2 a +4)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Pregunta 1: Objetivo Principal
*¿Qué es lo que más necesitas ahora mismo?*

| Opción | Puntos | Efecto en la Ramificación |
|---|:---:|---|
| Construir mi identidad en redes desde cero | `0` | Flujo estándar |
| Ya publico pero no crezco: quiero views y engagement real | `+1` | Flujo estándar |
| Que las redes me traigan clientes, no solo likes | `+1` | Flujo estándar |
| **Página web, landing o menú digital** | `0` | **Asignación directa: Sitio Web** |
| **Aprender a hacerlo yo mismo o con mi equipo** | `−5` | **Asignación directa: Mentoría Clínica** |

---

### Pregunta 2: Nicho o Industria
*¿A qué se dedica tu negocio?*
- Opciones: Restaurante/Café, Hotel/Hospedaje, Tours/Experiencias, Belleza/Wellness, Salud/Clínica/MedSpa, Inmobiliaria, Retail/E-commerce, Servicios profesionales, Marca personal/Creador, Otro.
- **Puntos:** `0` (Dato analítico puro para dimensionar el costo de producción y casos de éxito relevantes).

---

### Pregunta 3: Etapa Operativa del Negocio
*¿En qué etapa está tu negocio hoy?*

| Opción | Puntos | Justificación Heurística |
|---|:---:|---|
| Apenas estoy empezando o por lanzar | `−3` | Etapa temprana; requiere validar antes de delegar. |
| Ya tengo clientes, pero trabajo sin equipo | `−2` | Emprendedor solitario; presupuesto limitado. |
| Ya tengo un equipo chico (2 a 5 personas) | `+2` | Tracción validada; capacidad para delegar tareas. |
| Somos más de 5 personas o tenemos varias sucursales | `+4` | Empresa establecida; alta capacidad de retención. |

---

### Pregunta 4: Gestión Actual de Marketing
*¿Quién maneja tus redes hoy?*

| Opción | Puntos | Justificación Heurística |
|---|:---:|---|
| Nadie, están abandonadas | `0` | Falta de hábito o prioridad comercial. |
| Yo, cuando me da tiempo | `0` | Disposición a pagar aún no demostrada. |
| Un familiar o empleado que no es especialista | `+1` | Reconoce la necesidad pero busca economía. |
| Un freelance o community manager | `+3` | Disposición a pagar ya demostrada ($3k–$8k). |
| Una agencia | `+4` | Experiencia previa con agencias; busca mejor calidad/ROI. |

---

### Pregunta 5: Inversión Mensual Actual en Marketing
*¿Cuánto inviertes al mes hoy en marketing y contenido?*

| Opción | Puntos | Justificación Heurística |
|---|:---:|---|
| Nada por ahora | `−2` | Cero cultura de inversión publicitaria. |
| Menos de $5,000 MXN | `0` | Presupuesto micro; perfil para mentoría. |
| Entre $5,000 y $15,000 MXN | `+2` | Presupuesto viable para proyectos o retainers base. |
| Entre $15,000 y $40,000 MXN | `+4` | Presupuesto óptimo para retainer de Gestión Integral. |
| Más de $40,000 MXN | `+4` | Cuenta corporativa de alto valor. |

---

## 3. Motor de Ramificación (Árbol de Decisión)

El algoritmo suma los puntos de las preguntas 1, 3, 4 y 5 (rango teórico: `−10` a `+13` puntos) y evalúa la ruta en estricto orden de precedencia:

```
                  ¿Objetivo = "Página web"?
                       │
             ┌─────────┴─────────┐
            SÍ                  NO
             │                   │
      [Ruta: Sitio Web]   ¿Objetivo = "Aprender"?
                                 │
                       ┌─────────┴─────────┐
                      SÍ                  NO
                       │                   │
               [Ruta C: Mentoría]     ¿Score ≥ 7?
                                           │
                                 ┌─────────┴─────────┐
                                SÍ                  NO
                                 │                   │
                        [Ruta A: Gestión]     ¿Score 3 a 6?
                                                   │
                                         ┌─────────┴─────────┐
                                        SÍ                  NO
                                         │                   │
                                [Ruta B: Proyecto]   [Ruta C: Mentoría]
```

---

## 4. Catálogo de Rutas Clínicas y Guía de Propuesta

| Ruta | Servicio Asignado | Perfil Típico del Cliente | Rango Recomendado de Propuesta |
|:---:|---|---|---|
| **A** | **Gestión Integral** | Negocio estructurado con equipo y presupuesto establecido ($15k+). Busca delegar por completo estrategia, guion, grabación, edición y pauta. | **$7,000 – $18,000 MXN / mes** *(fee mensual recurrente)* |
| **B** | **Proyecto Puntual** | Negocio en crecimiento con necesidad de activos específicos (identidad de marca, paquete de reels, menú digital, embudo). | **$6,000 – $20,000 MXN** *(pago por proyecto / entrega)* |
| **C** | **Mentoría Clínica** | Emprendedor solitario, pre-lanzamiento o negocio que busca aprender la metodología paso a paso para ejecutarla internamente. | **$650 – $5,000 MXN** *(por sesión o paquete de asesoría)* |
| **Web**| **Sitio Web / Funnel** | Cliente que solicitó explícitamente landing page, e-commerce, web corporativa o menú interactivo. | **$6,000 – $20,000 MXN** *(según alcance técnico)* |

---

## 5. Implementación en Código

El algoritmo se encuentra encapsulado en `src/services/leadService.js` mediante la función pura `calculateLeadFit(answers)`:

```javascript
export function calculateLeadFit(answers = {}) {
  // 1. Reglas directas de objetivo
  if (answers.objetivo?.value === 'web') {
    return { route: 'web', route_name: 'Sitio Web', score: 0, suggestedRange: '$6k – $20k MXN' };
  }
  if (answers.objetivo?.value === 'aprender') {
    return { route: 'C', route_name: 'Mentoría Clínica', score: -5, suggestedRange: '$650 – $5,000 MXN' };
  }

  // 2. Suma de puntos interna
  let score = 0;
  score += answers.objetivo?.points || 0;
  score += answers.operacion?.points || 0;
  score += answers.gestion?.points || 0;
  score += answers.inversion?.points || 0;

  // 3. Ramificación por umbrales de madurez
  if (score >= 7) {
    return { route: 'A', route_name: 'Gestión Integral', score, suggestedRange: '$7,000 – $18,000 MXN/mes' };
  } else if (score >= 3) {
    return { route: 'B', route_name: 'Proyecto Puntual', score, suggestedRange: '$6,000 – $20,000 MXN' };
  } else {
    return { route: 'C', route_name: 'Mentoría Clínica', score, suggestedRange: '$650 – $5,000 MXN' };
  }
}
```

---

## 6. Resumen de Visualización en el Dashboard

Con esta arquitectura:
- El **Dashboard administrativo** (`DiagnosticsTabSection`) muestra métricas 100% orientadas al valor comercial:
  - Volumen de diagnósticos capturados en base de datos.
  - Servicio predominante y demanda en tiempo real.
  - Distribución del pipeline por servicio (`Mentoría`, `Proyecto`, `Gestión`).
  - Tarjetas de expediente con badges de estado (`En espera`, `Contactado`) y servicio asignado.
  - Acceso instantáneo a WhatsApp e Instagram con presupuesto reportado.
- El **Score numérico** permanece seguro en la base de datos y en este documento técnico como motor de inteligencia, sin generar fricciones ni tecnicismos en la vista diaria.
