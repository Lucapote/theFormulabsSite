# Catálogo de Dependencias — The Formulab

Este documento describe la totalidad de paquetes instalados en el proyecto, su rol en la arquitectura y su justificación funcional dentro del sistema.

---

## 1. Core & Framework

| Paquete | Versión | Tipo | Propósito y Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **`react`** | `^18.3.1` | Producción | Librería fundamental para la interfaz declarativa basada en componentes. |
| **`react-dom`** | `^18.3.1` | Producción | Renderizador de React en el navegador (`src/main.jsx`). |
| **`react-router-dom`** | `^6.30.1` | Producción | Enrutamiento SPA (`/`, `/diagnostico`, `/propuesta/:id`, `/calendario/:token`, `/admin`, `/login`). |
| **`@tanstack/react-query`** | `^5.83.0` | Producción | Gestión de estado asíncrono, cacheo y fetching reactivo (`src/App.jsx`). |
| **`vite`** | `^5.4.19` | Desarrollo | Entorno de desarrollo ultrarrápido y empaquetador de producción Rollup. |
| **`@vitejs/plugin-react-swc`** | `^3.11.0` | Desarrollo | Compilación de JSX/TSX ultrarrápida mediante SWC (Rust). |

---

## 2. Backend Serverless, Base de Datos y Almacenamiento

| Paquete | Versión | Tipo | Propósito y Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **`resend`** | `^6.32.1` | Producción | SDK oficial para despacho de emails transaccionales en Vercel Functions (`api/notify-lead.js`). |
| **`@supabase/supabase-js`** | `^2.117.2` | Producción | Cliente oficial de Supabase para autenticación, consultas RLS y persistencia en PostgreSQL (`src/lib/supabase.js`). |
| **`@aws-sdk/client-s3`** | `^3.1147.0` | Producción | Cliente S3 compatible con Cloudflare R2 para almacenamiento de activos multimedia (`api/r2-presigned-url.js`). |
| **`@aws-sdk/s3-request-presigner`** | `^3.1147.0` | Producción | Generación de URLs prefirmadas para subidas seguras y directas hacia Cloudflare R2 sin exponer credenciales. |

---

## 3. Procesamiento Multimedia y Parsing en Cliente

| Paquete | Versión | Tipo | Propósito y Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **`@ffmpeg/ffmpeg`** | `^0.12.15` | Producción | Ejecución de FFmpeg compilado a WebAssembly en el navegador para compresión y transcodificación de video (`src/utils/mediaCompressor.js`). |
| **`@ffmpeg/util`** | `^0.12.2` | Producción | Utilidades para transformar archivos binarios y Blobs para el motor WebAssembly de FFmpeg. |
| **`browser-image-compression`** | `^2.0.2` | Producción | Compresión optimizada de imágenes en el cliente antes de ser enviadas a la nube (`src/utils/mediaCompressor.js`). |
| **`mammoth`** | `^1.13.0` | Producción | Conversión y extracción de texto/tablas desde archivos Word `.docx` para importar calendarios editoriales (`src/utils/docxCalendarParser.js`). |

---

## 4. Primitivas de UI y Accesibilidad (Radix UI)

Primitivas Headless WAI-ARIA accesibles que sustentan los componentes shadcn/ui en `src/components/ui/`:

| Paquete | Versión | Componente Asociado | Función |
| :--- | :--- | :--- | :--- |
| **`@radix-ui/react-accordion`** | `^1.2.11` | `accordion.jsx` | Secciones colapsables y FAQs. |
| **`@radix-ui/react-alert-dialog`**| `^1.1.14` | `alert-dialog.jsx` | Diálogos modales de confirmación crítica. |
| **`@radix-ui/react-aspect-ratio`**| `^1.1.7`  | `aspect-ratio.jsx` | Contenedores proporcionales (16:9, 9:16, 1:1) para posts y videos. |
| **`@radix-ui/react-avatar`**      | `^1.1.10` | `avatar.jsx` | Avatares de clientes y perfiles con fallback. |
| **`@radix-ui/react-checkbox`**    | `^1.3.2`  | `checkbox.jsx` | Casillas de verificación personalizadas. |
| **`@radix-ui/react-collapsible`** | `^1.1.11` | `collapsible.jsx` | Paneles desplegables dinámicos. |
| **`@radix-ui/react-context-menu`**| `^2.2.15` | `context-menu.jsx` | Menús contextuales con clic derecho. |
| **`@radix-ui/react-dialog`**      | `^1.1.14` | `dialog.jsx`, `sheet.jsx` | Ventanas modales centradas y laterales. |
| **`@radix-ui/react-dropdown-menu`**| `^2.1.15` | `dropdown-menu.jsx` | Menús desplegables para acciones rápidas. |
| **`@radix-ui/react-hover-card`**  | `^1.1.14` | `hover-card.jsx` | Tarjetas de información emergente en hover. |
| **`@radix-ui/react-label`**       | `^2.1.7`  | `label.jsx` | Etiquetas accesibles para inputs y campos de formulario. |
| **`@radix-ui/react-menubar`**     | `^1.1.15` | `menubar.jsx` | Barras de menú tipo aplicación de escritorio. |
| **`@radix-ui/react-navigation-menu`**| `^1.2.13`| `navigation-menu.jsx` | Menús de navegación complejos. |
| **`@radix-ui/react-popover`**     | `^1.1.14` | `popover.jsx` | Paneles flotantes anclados a elementos. |
| **`@radix-ui/react-progress`**    | `^1.1.7`  | `progress.jsx` | Barras de progreso de carga y compresión de archivos. |
| **`@radix-ui/react-radio-group`** | `^1.3.7`  | `radio-group.jsx` | Grupos de selección única accesibles. |
| **`@radix-ui/react-scroll-area`** | `^1.2.9`  | `scroll-area.jsx` | Scrollbars virtuales estilizados con estética dark/lab. |
| **`@radix-ui/react-select`**      | `^2.2.5`  | `select.jsx` | Selectores desplegables nativos con búsqueda. |
| **`@radix-ui/react-separator`**   | `^1.1.7`  | `separator.jsx` | Divisores semánticos horizontales/verticales. |
| **`@radix-ui/react-slider`**      | `^1.3.5`  | `slider.jsx` | Controles deslizantes para rangos de presupuesto. |
| **`@radix-ui/react-slot`**        | `^1.2.3`  | `button.jsx`, `breadcrumb.jsx` | Patrón `asChild` para componer elementos sin añadir nodos DOM. |
| **`@radix-ui/react-switch`**      | `^1.2.5`  | `switch.jsx` | Interruptores On/Off para configuraciones y estados de posts. |
| **`@radix-ui/react-tabs`**        | `^1.1.12` | `tabs.jsx` | Pestañas segmentadas en paneles administrativos. |
| **`@radix-ui/react-toast`**       | `^1.2.14` | `toast.jsx` | Primitiva legacy para notificaciones. |
| **`@radix-ui/react-toggle`**      | `^1.1.9`  | `toggle.jsx` | Botones de alternancia binaria. |
| **`@radix-ui/react-toggle-group`**| `^1.1.10` | `toggle-group.jsx` | Grupos de botones toggle (ej. selector de vista de feed/grilla). |
| **`@radix-ui/react-tooltip`**     | `^1.2.7`  | `tooltip.jsx` | Tooltips accesibles flotantes. |

---

## 5. Componentes Especializados y Utilidades de UI

| Paquete | Versión | Tipo | Propósito y Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **`sonner`** | `^1.7.4` | Producción | Sistema moderno y estilizado de notificaciones toast para feedback inmediato en subidas, copias de texto y errores (`src/components/ui/sonner.jsx`). |
| **`vaul`** | `^0.9.9` | Producción | Drawer / Bottom Sheet deslizable con gestos táctiles, imitando la experiencia de apps móviles de Instagram/iOS (`src/components/ui/drawer.jsx`). |
| **`lucide-react`** | `^0.462.0` | Producción | Set oficial y unificado de iconos vectoriales para toda la plataforma (estándar obligatorio de `GEMINI.md`). |
| **`framer-motion`** | `^11.0.0` | Producción | Animaciones fluidas, transiciones de páginas, modales y micro-interacciones de laboratorio. |
| **`recharts`** | `^2.15.4` | Producción | Gráficos estadísticos y métricas del panel administrativo (`src/components/ui/chart.jsx`). |
| **`embla-carousel-react`** | `^8.6.0` | Producción | Motor táctil ligero para carruseles de posts y galerías multimedia (`src/components/ui/carousel.jsx`). |
| **`cmdk`** | `^1.1.1` | Producción | Menú de comandos rápidos tipo paleta Spotlight/Raycast (`src/components/ui/command.jsx`). |
| **`input-otp`** | `^1.4.2` | Producción | Input especializado para ingreso de códigos de verificación numéricos (`src/components/ui/input-otp.jsx`). |
| **`react-day-picker`** | `^8.10.1` | Producción | Calendario de fechas interactivo para agendamiento de publicaciones (`src/components/ui/calendar.jsx`). |
| **`react-resizable-panels`** | `^2.1.9` | Producción | Paneles con divisores redimensionables mediante arrastre (`src/components/ui/resizable.jsx`). |
| **`react-hook-form`** | `^7.61.1` | Producción | Gestión de estado y validación eficiente de formularios (`src/components/ui/form.jsx`). |
| **`next-themes`** | `^0.3.0` | Producción | Detección y sincronización de temas dark/light en el componente Sonner (`src/components/ui/sonner.jsx`). |
| **`class-variance-authority`** | `^0.7.1` | Producción | Composición de variantes de diseño en Tailwind CSS (`cva`). |
| **`clsx`** | `^2.1.1` | Producción | Construcción condicional de clases de CSS (`src/lib/utils.js`). |
| **`tailwind-merge`** | `^2.6.0` | Producción | Fusión inteligente de clases conflictivas de Tailwind CSS (`twMerge` dentro de `cn()`). |

---

## 6. Estilos y Herramientas de Desarrollo

| Paquete | Versión | Tipo | Propósito |
| :--- | :--- | :--- | :--- |
| **`tailwindcss`** | `^3.4.17` | Desarrollo | Framework de CSS utilitario que rige todo el sistema visual del proyecto. |
| **`tailwindcss-animate`** | `^1.0.7` | Producción | Plugin de animaciones CSS para Tailwind utilizado por shadcn/ui. |
| **`postcss`** | `^8.5.6` | Desarrollo | Procesador de estilos para transformar Tailwind y prefijos CSS. |
| **`autoprefixer`** | `^10.4.21` | Desarrollo | Plugin de PostCSS para añadir prefijos de navegadores automáticamente. |
| **`eslint`** | `^9.32.0` | Desarrollo | Linter estático para garantizar la calidad y consistencia del código. |
| **`eslint-plugin-react-hooks`** | `^5.2.0` | Desarrollo | Reglas oficiales para el uso correcto de Hooks de React. |
| **`eslint-plugin-react-refresh`** | `^0.4.20` | Desarrollo | Integración de Fast Refresh sin recargas completas durante el desarrollo. |
| **`globals`** | `^15.15.0` | Desarrollo | Definiciones de variables globales para la configuración de ESLint. |

---

## 7. Dependencias Depuradas y Eliminadas (Auditoría Octubre 2026)

Durante la auditoría de dependencias, se identificaron y desinstalaron los siguientes paquetes no utilizados, reduciendo el tamaño del árbol de `node_modules` y acelerando los tiempos de compilación:

1. **`@ffmpeg/core`**: Innecesario en el bundle local. El cargador de WebAssembly en `src/utils/mediaCompressor.js` consume el binario directamente desde el CDN oficial de unpkg (`@ffmpeg/core@0.12.6`), ahorrando más de 30 MB en dependencias locales.
2. **`@hookform/resolvers`**: No se registraron resolvers externos en el proyecto; la validación de formularios se maneja directamente con lógica nativa y controlada.
3. **`date-fns`**: El formateo de fechas y horas se resuelve con la API nativa de JavaScript (`Intl.DateTimeFormat`) y utilidades puras en `src/utils/formatters.js`.
4. **`gsap`**: Reemplazado por `framer-motion` y animaciones CSS de Tailwind, evitando duplicidad de motores de animación.
5. **`react-simple-maps`**: Sin uso ni pantallas cartográficas en la aplicación.
6. **`zod`**: Sin esquemas declarativos en uso dentro del frontend o backend serverless.
7. **`@tailwindcss/typography`**: No estaba registrado en `tailwind.config.js` ni se utilizaban clases `.prose`.
