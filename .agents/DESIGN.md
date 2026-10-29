# DESIGN.md — The Formulab

> Documento de referencia de diseño para desarrollo web (React).
> Fuente principal: *Manual de Marca The Formulab*.
> Las secciones marcadas como **[Propuesta]** no aparecen en el manual; son sugerencias para completar el sistema y deben validarse con el equipo de marca.

---

## 1. Visión general

**The Formulab** es una marca con identidad moderna, limpia y con un toque de laboratorio. El logotipo reemplaza la "i" de *formulab* por un tubo de ensayo, que conecta el nombre con la idea de experimentación y creación.

**Atributos de marca (deducidos de la identidad visual):**
- Moderna y minimalista
- Clara y legible
- Creativa y cercana
- Científica en el concepto, pero no fría

---

## 2. Logotipo

### 2.1 Versiones

| Versión | Cuándo usarla |
|---|---|
| **Color** | Versión principal. Úsala siempre que sea posible. |
| **Monocromática blanca** | Cuando no se pueda aplicar color. Solo sobre fondos oscuros con alto contraste. |
| **Monocromática negra** | Cuando no se pueda aplicar color. Solo sobre fondos claros con alto contraste. |

### 2.2 Combinaciones de color del logotipo

| Fondo | Texto "the formu" / "ab" | Tubo de ensayo |
|---|---|---|
| Magenta `#ef18d6` | Blanco | Blanco |
| Gris claro `#f4f4f4` | Negro + magenta en "lab" | Magenta |
| Negro | Blanco | Blanco |
| Blanco | Negro | Negro |

> **Nota:** En la versión a color sobre fondo claro, "the formu" va en negro y solo la parte "lab" (tubo incluido) va en magenta.

### 2.3 Área de protección

- Se mide tomando como referencia la **altura** y el **ancho de la letra "O"** del logotipo.
- Ese espacio se debe mantener **completamente libre** de cualquier otro elemento visual (textos, imágenes, bordes, íconos).
- Aplica a todas las versiones (color y monocromática).

### 2.4 Usos incorrectos (prohibidos)

No se permite:

- Deformar el logotipo (estirar, comprimir o distorsionar proporciones)
- Modificar colores fuera de las variantes oficiales
- Cambiar la tipografía del logotipo
- Agregar efectos (sombras, texturas, ruido)
- Espejar la marca
- Inclinar o rotar el logotipo
- Aplicar sombra
- Aplicar degradados
- Aplicar trazos o contornos

### 2.5 Implementación en React

El manual **no incluye archivos vectoriales** del logotipo. Se recomienda solicitar el SVG oficial al equipo de marca. Mientras tanto, se puede usar un componente que reciba el SVG como fuente:

```jsx
// components/Logo.jsx
export default function Logo({ variant = "color", className = "" }) {
  // variant: "color" | "mono-white" | "mono-black"
  // Reemplazar por el SVG oficial exportado desde el manual/Figma
  return (
    <img
      src={`/logos/formulab-${variant}.svg`}
      alt="The Formulab"
      className={className}
    />
  );
}
```

---

## 3. Color

### 3.1 Paleta de marca

| Token | HEX | Uso |
|---|---|---|
| `brand-primary` | `#ef18d6` | Color principal de marca: acentos, CTAs, íconos destacados, logotipo sobre fondos claros. |
| `brand-secondary` | `#188ff0` | Color secundario: enlaces, íconos de contacto, subtítulos de cargo. |
| `brand-secondary-50` | `#188ff0` al 50 % | Tonos intermedios y elementos de apoyo. |
| `brand-secondary-15` | `#188ff0` al 15 % | Fondos suaves, paneles laterales y secciones de apoyo. |
| `neutral-100` | `#f4f4f4` | Fondos neutros y superficies de tarjetas. |

**Equivalentes RGBA:**
- `brand-secondary-50` → `rgba(24, 143, 240, 0.5)`
- `brand-secondary-15` → `rgba(24, 143, 240, 0.15)`

### 3.2 Colores base [Propuesta]

El manual no define colores de texto, blanco ni negro puro. Se proponen para completar el sistema:

| Token | HEX | Uso |
|---|---|---|
| `ink` | `#111111` | Texto principal. |
| `ink-muted` | `#4a4a4a` | Texto secundario (el manual usa grises similares en sus bloques de texto). |
| `white` | `#ffffff` | Fondo principal. |
| `black` | `#000000` | Solo para la versión monocromática negra del logotipo. |

### 3.3 Contraste y accesibilidad

| Combinación | Contraste aproximado | Uso permitido |
|---|---|---|
| `#111` sobre `#fff` | Alto (> 15:1) | Texto de cuerpo. |
| `#ef18d6` sobre `#fff` | ~3.6:1 | Solo texto grande (≥ 24 px o ≥ 18.66 px en negrita) o elementos gráficos. |
| `#188ff0` sobre `#fff` | ~3.4:1 | Solo texto grande o elementos gráficos. |
| `#fff` sobre `#ef18d6` | ~3.6:1 | Solo texto grande (ej. el logotipo). |

> **Regla práctica:** para texto de párrafo, usa siempre `ink`. Reserva el magenta y el azul para títulos grandes, íconos y acentos.

### 3.4 Proporción de uso [Propuesta]

- ~70 % blanco / neutros
- ~15 % `brand-secondary-15` (fondos de sección)
- ~10 % `brand-secondary` (enlaces, íconos)
- ~5 % `brand-primary` (CTAs, acentos)

---

## 4. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| **Títulos** | **Sora** | Títulos, encabezados y piezas de alto impacto visual. |
| **Textos** | **Inter** | Textos largos, subtítulos, interfaces y lectura continua. |

Ambas son fuentes de Google Fonts.

### 4.1 Carga en React

Opción recomendada, con fuentes self-hosted:

```bash
npm install @fontsource-variable/sora @fontsource-variable/inter
```

```jsx
// main.jsx
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
```

### 4.2 Escala tipográfica [Propuesta]

El manual no define tamaños ni pesos. Propuesta base en `rem`:

| Token | Tamaño | Fuente | Peso | Uso |
|---|---|---|---|---|
| `display` | 3.5rem / 1.05 | Sora | 700 | Hero y piezas de impacto. |
| `h1` | 2.5rem / 1.1 | Sora | 700 | Títulos de página. |
| `h2` | 1.875rem / 1.2 | Sora | 600 | Secciones. |
| `h3` | 1.25rem / 1.3 | Sora | 600 | Subsecciones. |
| `body` | 1rem / 1.6 | Inter | 400 | Texto general. |
| `body-sm` | 0.875rem / 1.5 | Inter | 400 | Metadatos y notas. |
| `label` | 0.875rem / 1.4 | Inter | 500 | Etiquetas de formulario y botones. |

Longitud de línea recomendada: entre 60 y 80 caracteres (`max-width: 70ch`).

---

## 5. Forma, espaciado y elementos visuales

Observaciones del manual (valores aproximados, a confirmar):

- **Esquinas redondeadas** en tarjetas y contenedores (radio aproximado de 12–20 px).
- **Formas de píldora (pill)** en swatches de color y etiquetas como "Scan & talk".
- **Formas de arco** en la presentación tipográfica.
- **Curvas orgánicas** como fondo decorativo en piezas impresas (tarjetas de presentación).
- **Paneles laterales** en azul muy claro (`brand-secondary-15`) con bordes muy redondeados en una de sus esquinas.

### 5.1 Tokens de espaciado y radio [Propuesta]

```css
:root {
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 6. Tokens en código

### 6.1 Variables CSS

```css
/* styles/tokens.css */
:root {
  /* Marca */
  --color-brand-primary: #ef18d6;
  --color-brand-secondary: #188ff0;
  --color-brand-secondary-50: rgba(24, 143, 240, 0.5);
  --color-brand-secondary-15: rgba(24, 143, 240, 0.15);
  --color-neutral-100: #f4f4f4;

  /* Base [Propuesta] */
  --color-ink: #111111;
  --color-ink-muted: #4a4a4a;
  --color-white: #ffffff;
  --color-black: #000000;

  /* Tipografía */
  --font-display: "Sora", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

### 6.2 Configuración para Tailwind CSS

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#ef18d6",
          secondary: "#188ff0",
          "secondary-50": "rgba(24, 143, 240, 0.5)",
          "secondary-15": "rgba(24, 143, 240, 0.15)",
        },
        neutral: {
          100: "#f4f4f4",
        },
        ink: {
          DEFAULT: "#111111",
          muted: "#4a4a4a",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        md: "16px",
        lg: "24px",
      },
    },
  },
  plugins: [],
};
```

Uso:

```jsx
<h1 className="font-display text-brand-primary">Título</h1>
<p className="font-body text-ink">Texto de cuerpo.</p>
<section className="bg-brand-secondary-15 rounded-lg">...</section>
```

---

## 7. Componentes y patrones

### 7.1 Botón principal [Propuesta]

- Fondo `brand-primary`, texto blanco, radio pill.
- Estado hover: oscurecer ligeramente (no incluido en el manual).
- Estado focus visible: anillo de 2 px en `brand-secondary`.

### 7.2 Etiqueta "Scan & talk" (del manual)

- Fondo magenta, texto blanco, forma de píldora, tipografía pequeña.
- Acompaña a códigos QR.

### 7.3 Lista de contacto (del manual)

- Íconos en `brand-secondary`.
- Texto en `ink`.
- Orden: WhatsApp, correo, Instagram.

### 7.4 Tarjeta de presentación (referencia)

- Fondo azul muy claro con curva orgánica.
- Nombre en Sora, mayúsculas, peso alto.
- Cargo en Inter cursiva, color `brand-secondary`.
- Código QR en magenta.

---

## 8. Principios de uso

1. **Consistencia:** aplica siempre los mismos colores y tipografías en todas las piezas.
2. **Respiro:** respeta el área de protección del logotipo en cada pantalla o pieza.
3. **Jerarquía:** el magenta es el acento, no el color dominante del texto.
4. **Legibilidad primero:** si hay duda de contraste, usa la versión monocromática con mayor contraste.
5. **Creatividad con orden:** las formas orgánicas (curvas, arcos) son parte de la identidad; úsalas como fondos o marcos, nunca sobre el logotipo.

---

## 9. Pendientes

- [ ] Obtener el logotipo en SVG oficial (color y monocromático).
- [ ] Confirmar color de texto principal y escala tipográfica.
- [ ] Definir estados de interacción (hover, focus, disabled).
- [ ] Confirmar si existe modo oscuro.
- [ ] Definir tamaños mínimos del logotipo para web y móvil.
