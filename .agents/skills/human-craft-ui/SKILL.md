---
name: human-craft-ui
description: >-
  Use this skill whenever designing, reviewing, or building user interfaces, components,
  landing pages, or mobile views. It enforces handcrafted, human-level UX/UI, eliminating
  AI design clichés (AI slop, emojis, generic templates, lack of tactile feedback) while
  applying surgical precision, mobile-first ergonomics, and the Clinical High-Tech Lab DNA.
---

# Human Craft UI: Diseño Artesanal & Anti-IA

Este skill define la doctrina de diseño para erradicar el software que parece "generado por IA" (*AI Slop*) y reemplazarlo por interfaces con **acabado artesanal, peso táctil, ergonomía de producto maduro y precisión quirúrgica**.

---

## 1. El Manifiesto "Anti-AI Slop"

Las IAs tienden a generar interfaces predecibles, insípidas y desconectadas de la ergonomía física humana: fondos morados con gradientes borrosos genéricos, exceso de emojis en títulos, tarjetas flotantes sin bordes definidos, botones planos sin respuesta táctil y adaptaciones móviles que son solo "páginas de escritorio encogidas".

**Una interfaz artesanal se reconoce porque:**
1. **Tiene peso y física**: Los botones se hunden ligeramente al tacto (`active:scale-[0.98] transition-transform`), las transiciones tienen amortiguación intencional (`ease-out`), y las superficies tienen jerarquía física tangible.
2. **Es sobria y rigurosa**: Cero emojis en la interfaz. La elegancia se transmite con tipografía cuidada (Sora + Inter + Mono) e iconografía quirúrgica (`lucide-react`).
3. **Se siente nativa en móvil**: En pantallas pequeñas emula la fluidez y ergonomía de una app de Instagram o TikTok (botones en la zona del pulgar, *bottom sheets* deslizables con barra de agarre, cero scroll horizontal accidental).
4. **Respeta la textura ambiental**: Superficies de laboratorio clínico (`bg-[#f4f4f4]` o `bg-gray-50/80`) con gradientes radiales apenas perceptibles en esquinas, nunca fondos negros ciegos ni blancos cegadores sin textura.

---

## 2. Los 5 Mandamientos de Artesanía Visual

### Regla 1: Erradicación Total de Emojis en UI
- ❌ **Prohibido**: `"🚀 Empezar ahora"`, `"✨ Características"`, `"📅 Calendario"`, `"💡 Tip"`.
- ✅ **Estándar**: Iconos vectoriales deliberados de `lucide-react` con tamaño exacto (`w-4 h-4` o `w-3.5 h-3.5`) y contraste cuidado:
  `<Calendar className="w-4 h-4 text-brand-blue" /><span>Calendario Editorial</span>`

### Regla 2: Respuesta Táctica & "Haptic Feel" en Botones y Controles
Todo elemento interactivo debe reaccionar físicamente al usuario:
- **Estado Activo (Presión)**: `active:scale-[0.98] transition-all duration-150`
- **Cursor Explícito**: Siempre `cursor-pointer` en botones, switches y pestañas.
- **Micro-animaciones de Carga**: En estados de carga, spinners suaves (`animate-spin`) con textos descriptivos (`"Guardando cambios..."` en lugar de congelar el botón).

### Regla 3: Ergonomía Móvil Nativa (Instagram / TikTok UX Pattern)
En pantallas `< 768px`, la experiencia debe sentirse como una app móvil de primer nivel:
- **Thumb Zone (Zona del Pulgar)**: Los botones de acción primaria (`COPIAR`, `GUARDAR`, `PUBLICAR`, `DESCARGAR`) deben ubicarse en la parte inferior accesible con una sola mano, con alturas táctiles mínimas de 44–48px (`h-11` o `h-12`).
- **Bottom Sheets Deslizables**: La información contextual secundaria (detalles de post, copy, metadatos) no debe abrir modales flotantes centrados en móvil, sino un cajón inferior con *pill handle* superior centrado:
  ```html
  <div class="w-12 h-1 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto my-2.5" />
  ```
- **Visores Inmersivos 9/16**: En publicaciones y medios verticales, ocupar la proporción de pantalla con esquinas redondeadas de dispositivo (`rounded-[28px]`) y botón `X` flotante translúcido.

### Regla 4: Arquitectura de Modales sin "Content Jumping" (Alto Estático 95vh)
En modales complejos con pestañas o formularios divididos:
- **Estrictamente prohibido el redimensionamiento dinámico**: El modal no debe crecer o encogerse según el contenido de cada pestaña.
- **Fijación de Viewport**: El diálogo debe anclarse a una altura casi completa (`className="h-[95vh] max-h-[95vh]"`), con cabecera fija, pestañas superiores ancladas mediante controles segmentados y área de contenido con scroll vertical interno exclusivo (`bodyClassName="max-h-none flex-1 overflow-y-auto min-h-0"`).

### Regla 5: Jerarquía Tipográfica Quirúrgica
- **Display / Títulos / CTAs / Métricas**: `font-sora` (`Sora, sans-serif`) con tracking cerrado (`tracking-tight` o `tracking-wide` en mayúsculas pequeñas).
- **Lectura / UI / Formularios**: `font-inter` (`Inter, sans-serif`) con interlineado generoso (`leading-relaxed`).
- **Datos Técnicos / Fechas / Badges de Laboratorio**: `font-mono` (`JetBrains Mono, monospace` con `.lab-mono`).

---

## 3. ADN Visual: The Formulab ("Clinical High-Tech Lab")

Toda vista o componente del SaaS debe alinearse con esta paleta y geometría:

| Elemento | Clase Tailwind / Valor | Rol de Diseño |
| :--- | :--- | :--- |
| **Fondo Base** | `bg-[#f4f4f4]` o `bg-gray-50` | Textura neutra de laboratorio clínico; nunca blanco plano ni oscuro aislado. |
| **Efecto Ambiental** | `bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ef18d6]/10 via-transparent to-transparent pointer-events-none` | Luz volumétrica tenue en esquinas superiores. |
| **Tarjetas** | `bg-white` o `bg-white/80 backdrop-blur-lg border border-gray-100 shadow-sm rounded-2xl` | Superficies de precisión con bordes quirúrgicos. |
| **Brand Magenta** | `#ef18d6` (`text-brand-magenta`, `bg-brand-magenta`) | Acento de alta energía y llamadas a la acción vitales. |
| **Brand Electric Blue** | `#188ff0` (`text-brand-blue`, `bg-brand-blue`) | Confianza técnica, estados de éxito y acciones primarias. |
| **Gradiente Lab** | `linear-gradient(135deg, #ef18d6 0%, #188ff0 100%)` (`text-gradient`) | Firma de marca en titulares clave. |
| **Pill Shape Dominante** | `rounded-full` | Estética de cápsula para badges, botones principales y selectores segmentados. |

---

## 4. Checklist Rápido de Validación de Diseño

Antes de dar por terminado cualquier componente o pantalla, verifica:
- [ ] ¿Hay algún emoji? Si lo hay, elimínalo y usa un icono de `lucide-react`.
- [ ] ¿Los botones tienen estado `active:scale-[0.98]` y `cursor-pointer`?
- [ ] ¿En móvil los elementos interactivos tienen al menos 44px de altura táctil?
- [ ] ¿El modal tiene altura fija o sufre de saltos bruscos (*content jumping*) entre pestañas?
- [ ] ¿Hay scrolls horizontales accidentales en dispositivos móviles?
- [ ] ¿Los contrastes de texto cumplen con accesibilidad (evitar textos grises ilegibles sobre fondos claros)?
- [ ] ¿Los badges de estado usan `font-mono uppercase tracking-wider` con esquinas redondeadas de cápsula?

---

## 5. Recursos Adicionales

- [Checklist de "AI Red Flags vs Senior Craft"](./references/anti-ai-design-smells.md)
- [Recetas de Componentes Táctiles (Tailwind CSS)](./references/tactile-component-recipes.md)
- [Ejemplos de Componentes Artesanales (React)](./examples/HumanCraftedComponents.jsx)
