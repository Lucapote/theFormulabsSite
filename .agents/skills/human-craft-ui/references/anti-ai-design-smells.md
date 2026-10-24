# Matriz de Detección: Clichés de IA (AI Slop) vs Artesanía Senior

Usa esta guía comparativa para detectar patrones perezosos generados por modelos de lenguaje y transformarlos en interfaces con diseño artesanal de alto nivel.

---

## 1. Iconografía y Decoración

| Patrón Perezoso de IA (AI Smell) ❌ | Enfoque Artesanal Senior (Human Craft) ✅ |
| :--- | :--- |
| Usar emojis en títulos, botones o pestañas (`"🚀 Lanzamiento"`, `"🔥 Oferta"`, `"✨ IA"`). | Iconografía vectorial de `lucide-react` con escala intencional (`w-4 h-4`) y color balanceado. |
| Gradientes violetas/índigo borrosos genéricos flotando en el fondo sin justificación. | Texturas de laboratorio limpias (`bg-[#f4f4f4]`) con gradientes radiales sutiles en una esquina (`from-[#ef18d6]/10`). |
| Ilustraciones genéricas 3D tipo arcilla o placeholders monocromáticos vacíos. | Componentes con identidad real (Tubo de Ensayo reactivo con burbujas físicas, mockups de alta fidelidad). |

---

## 2. Ergonomía Móvil y Distribución

| Patrón Perezoso de IA (AI Smell) ❌ | Enfoque Artesanal Senior (Human Craft) ✅ |
| :--- | :--- |
| Comprimir la grilla de escritorio a 1 columna sin adaptar la ergonomía táctil. | Rediseño táctil para la "Zona del Pulgar" (*Thumb Zone*), botones de acción anclados abajo. |
| Modales centrados con textos densos que quedan cortados por el teclado en móvil. | *Bottom Sheets* deslizables con barra de agarre táctil superior (`w-12 h-1 bg-slate-600 rounded-full`). |
| Scroll horizontal involuntario en la pantalla debido a márgenes o anchos fijos. | Estructura `overflow-x-hidden w-full`, anchos fluidos y respeto por áreas seguras (`pb-safe`). |
| Botones pequeños de 28–32px difíciles de pulsar con el pulgar. | Alturas mínimas de 44–48px (`h-11` o `h-12`) con radio de pulsación generoso. |

---

## 3. Física, Movimiento y Retroalimentación Táctil

| Patrón Perezoso de IA (AI Smell) ❌ | Enfoque Artesanal Senior (Human Craft) ✅ |
| :--- | :--- |
| Botones rígidos que no reaccionan al clic o solo cambian ligeramente de color. | Botones con feedback táctil elástico: `active:scale-[0.98] transition-transform duration-100`. |
| Modales que cambian de altura bruscamente al navegar entre pestañas (*content jumping*). | Modales fijados a altura de pantalla estática (`h-[95vh]`) con scroll interno independiente. |
| Spinners genéricos que congelan la pantalla completa sin contexto. | Estados de carga con pulso (`animate-pulse`) o esqueletos que respetan la forma exacta del contenido final. |

---

## 4. Tipografía y Copywriting

| Patrón Perezoso de IA (AI Smell) ❌ | Enfoque Artesanal Senior (Human Craft) ✅ |
| :--- | :--- |
| Textos corporativos inflados y vacíos (*"Impulsa tu sinergia con soluciones de vanguardia"*). | Copy conciso, directo y técnico (*"Producción mensual comprometida: 2 sesiones (8h)"*). |
| Una sola fuente de sistema para todo el sitio (ej. Arial o Roboto por defecto). | Sistema tipográfico de 3 capas: **Sora** (titulares/métricas), **Inter** (lectura/formularios) y **Mono** (datos técnicos). |
| Textos secundarios en gris ultraclaro que fallan contraste sobre blanco. | Grises clínicos contrastados (`text-gray-500` o `text-gray-600`), garantizando legibilidad en cualquier pantalla. |
