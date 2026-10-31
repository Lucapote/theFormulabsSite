# Historial de Cambios — The Formulab (CHANGELOG.md)

Todos los cambios notables, decisiones de arquitectura y soluciones implementadas en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y cumple con la **Regla 2** de `GEMINI.md`.

---

## [2026-10-31] — Optimización Mobile UX/UI (Navbar, Chips Horizontales y Progressive Disclosure)

### Agregado
- **Subcomponente Atómico `CaseVideosGrid.jsx` (`src/components/portfolio/subcomponents/CaseVideosGrid.jsx`)**:
  - Implementa visualización de videos para casos de estudio con progressive disclosure en pantallas móviles (`< sm:`), limitando a 2 videos por defecto y agregando botón táctil elástico para expandir o colapsar el contenido restante.
- **Riel Horizontal Nativo de Filtros (`PortfolioReelsWall.jsx`)**:
  - Desplazamiento horizontal fluido en móviles con bleeding edge-to-edge (`-mx-6 px-6 overflow-x-auto [scrollbar-width:none]`) y chips individuales en forma de píldora táctil (`rounded-full active:scale-[0.98]`), erradicando la deformación por contenedor multilínea previo.

### Modificado
- **Navbar Portafolio Responsiva (`PortfolioNavbar.jsx`)**:
  - Sustitución del texto del CTA principal: `"Diagnóstico"` en móvil (`< sm:`) y `"Solicitar diagnóstico"` en desktop (`sm:` en adelante), optimizando el espacio visual de la barra superior.
- **Progressive Disclosure en Muro de Reels (`PortfolioReelsWall.jsx`)**:
  - Restricción a 2 reels visibles por defecto en móvil con botón de alternancia `"Ver todos los reels (N)"` / `"Ver menos reels"` con iconos `ChevronDown`/`ChevronUp` y reseteo automático de expansión al cambiar de categoría.
- **Modularización de Casos Destacados (`PortfolioFeaturedCases.jsx`)**:
  - Delegación de la cuadrícula de videos al subcomponente `CaseVideosGrid.jsx`, reduciendo el archivo a **198 líneas** (cumpliendo con la regla de $\le 200$ líneas).

---

## [2026-10-31] — Auditoría Maestro GEMINI.md, Ergonomía Háptica & Modularización Quirúrgica

### Eliminado
- **Purga de Iconos Cliché de IA (`Sparkles` & `Zap`)**:
  - Reemplazo del 100% de `Sparkles` giratorio por el componente estándar de carga `Loader2` en `Login.jsx`, `ClientCalendarsGrid.jsx`, `ClientListSidebar.jsx`, `MediaGallery.jsx` y `ScheduledPostsList.jsx`.
  - Eliminación de destellos decorativos innecesarios en `ImportWordModal`, `UploadContext`, `LeadAnswersBreakdown`, `LeadDetailModal`, `LeadMetricsHeader`, `CreateProductionModal`, `OperationsTabSection`, `ProductionScheduleFields` y `FramingControls`.
  - Sustitución de `Zap` en `LeadToClientModal` por `Package`, reservando `Flame` con rigor semántico exclusivo en `LeadQuestionCard` para el nicho *Wellness & Fitness*.

### Agregado
- **Alineación Vertical de Filtros en Portafolio (`PortfolioReelsWall.jsx`)**:
  - Reubicación del menú segmentado de categorías para posicionarse debajo del bloque descriptivo y titular, con geometría píldora (`rounded-full`) y respuesta táctil (`active:scale-[0.98]`).
- **Tactilidad & Feedback Físico Global (`src/components/ui/button.jsx`)**:
  - Incorporación de `cursor-pointer active:scale-[0.98] transition-all duration-150` en la base de `buttonVariants`, dotando de reactividad háptica a todos los botones shadcn del proyecto.
- **Nuevos Hooks de Dominio Especializados**:
  - `src/hooks/useMediaGalleryManager.js`: Encapsula carga reactiva, filtros, selecciones múltiples, eliminación en lote y asignación de medios a posts.
  - `src/hooks/useProductionDetailManager.js`: Centraliza validaciones de pago, cancelaciones, mapas y mutaciones RPC de sesiones de rodaje.
  - `src/hooks/useFramingGestures.js`: Manejador de eventos mouse/touch para encuadre y paneo libre en lienzo Instagram.
  - `src/hooks/useClientsCalendarManager.js`: Orquestador de CRUD de clientes y meses editoriales.
  - `src/hooks/useMediaRatios.js`: Detección en tiempo real de proporciones Meta (4:5 y 1.91:1).
- **Subcomponentes Atómicos Especializados**:
  - `src/components/dashboard/gallery/MediaGalleryEmptyState.jsx`.
  - `src/components/dashboard/operations/subcomponents/ProductionScheduleFields.jsx` & `ProductionLogisticsFields.jsx`.
  - `src/components/dashboard/calendar/subcomponents/FramingViewport.jsx` & `FramingControls.jsx`.
  - `src/utils/canvasFramingHelper.js`: Motor de renderizado offscreen y subida optimizada a Cloudflare R2.
  - `src/components/dashboard/calendar/subcomponents/PostModalClientFeedbackBanner.jsx`, `PostModalMediaGalleryPicker.jsx`, `PostModalScheduleFields.jsx`, `ClientsCalendarHeaderCard.jsx`.
  - `src/components/dashboard/operations/subcomponents/ReceiptCycleSelectorList.jsx` & `ReceiptPreviewActionPanel.jsx`.

### Modificado
- **Modularización Quirúrgica de Monolitos ($\le 250$ líneas)**:
  - `MediaFramingModal.jsx`: Reducido de 778 a **229 líneas**.
  - `ClientsCalendarSection.jsx`: Reducido de 662 a **232 líneas**.
  - `ProductionDetailModal.jsx`: Reducido de 528 a **158 líneas**.
  - `PostModal.jsx`: Reducido de 518 a **243 líneas**.
  - `MediaGallery.jsx`: Reducido de 504 a **246 líneas**.
  - `PendingReceiptsReviewModal.jsx`: Reducido de 380 a **164 líneas**.
- **Estandarización de Modales en `BaseFormModal` (Alto Estático 95vh)**:
  - Migración completa de `PendingReceiptsReviewModal.jsx` y `ProposalActivationModal.jsx` a `BaseFormModal` con `h-[95vh] max-h-[95vh]`, cabecera institucional `bg-slate-950` y scroll interno exclusivo.
- **Unificación de ADN Visual (Clinical High-Tech Lab)**:
  - Sustitución de `pink-500` / `pink-600` genéricos por `brand-magenta` (`#ef18d6`) y `brand-blue` (`#188ff0`) en más de 30 componentes de propuestas, calendarios, dashboard, feedback y notificaciones.
- **Validación Estricta de Páginas**:
  - Las 9 páginas de `src/pages/` cumplen con la restricción de $\le 200$ líneas.
  - Eliminación de cualquier emoji en UI en favor exclusivo de `lucide-react`.

---

## [2026-10-30] — Optimización de Alto Rendimiento para Videos en Móvil (iPhone & Android)

### Agregado
- **Generación de Pósters Ultra-Ligeros (FFmpeg WebP)**:
  - Generación de fotogramas clave en formato WebP (<40 KB) y JPEG para los 11 reels principales y tomas BTS en `public/portfolio/{brand}/`.
  - Contratos de datos actualizados en `src/data/portfolioData.js` incorporando `posterUrl` para cada video.
- **Micro-Spinner Táctil de Carga**:
  - Indicador visual `Loader2` animado en `PortfolioReelCard.jsx` que proporciona feedback instantáneo al usuario mientras el buffer de reproducción inicializa.

### Modificado
- **Propagación de Pósters en Casos de Estudio (`PortfolioFeaturedCases.jsx`)**:
  - Se vinculó explícitamente `posterUrl: video.posterUrl` en la instanciación de `PortfolioReelCard`, solucionando las tarjetas negras que persistían en los casos de Yamamoto Restaurante y Mau Fuentes.
- **Cero Pantallas Negras en iOS / Safari (`PortfolioReelCard.jsx`)**:
  - Inclusión de capa de respaldo estática `<img src={reel.posterUrl} />` visible de inmediato (0ms de latencia visual).
  - Configuración de flags de renderizado móvil estricto: `playsInline`, `webkit-playsinline="true"` y `x5-playsinline="true"`.
- **Carga Bajo Demanda y Ahorro Masivo de Datos en Android (`PortfolioReelCard.jsx`, `PortfolioMarquee.jsx`)**:
  - Reemplazo de precarga voraz por `preload="none"`. Reducción del payload inicial de ~56 MB a menos de 400 KB.
  - Reproducción bajo demanda (*lazy load*): el stream de video solo se monta tras interacción explícita (hover en desktop o tap en móvil).
  - Desactivación de autoPlay concurrente en el marquee duplicado para evitar saturación del decodificador móvil.
  - Aplicación de póster y `webkit-playsinline` a tomas BTS en `PortfolioBtsStrip.jsx`.

---

## [2026-10-30] — Navbar Minimalista de Portafolio & Reubicación de Componentes

### Modificado
- **Barra de Navegación Exclusiva (`PortfolioNavbar.jsx`)**:
  - Se removieron todos los enlaces de texto intermedios (`Reels`, `Casos`, `Diagnóstico`, etc.) y el menú hamburguesa.
  - La barra ahora presenta únicamente el **logotipo oficial** y el botón de alta conversión **"Solicitar diagnóstico"** en color magenta oficial con redirección a `/diagnostico`.
- **Estructura de Carpetas (`src/components/portfolio/`)**:
  - Al no ser de uso transversal para toda la aplicación, `Navbar` y `Footer` fueron reubicados desde `common/` hacia `src/components/portfolio/` como `PortfolioNavbar.jsx` y `PortfolioFooter.jsx`.
  - Se eliminó el directorio `src/components/common/nav/`.

---

## [2026-10-30] — Reorganización de Cabecera en Portafolio y Depuración del Navbar

### Modificado
- **Cabecera del Portafolio (`src/components/portfolio/PortfolioHero.jsx`)**:
  - Se reestructuró la jerarquía de lectura: la bajada descriptiva *"Videos pensados para retener en el primer segundo, explicar en quince y convertir antes del final..."* ahora se ubica directamente debajo del titular principal *"Contenido con fórmula, no con suerte."*, eliminando la fragmentación visual a la derecha.
  - El enlace con flecha animada conduce limpiamente a la sección `#reels`.
- **Barra de Navegación (`src/components/common/nav/Navbar.jsx`)**:
  - Se eliminó el enlace obsoleto hacia "Equipo" y enlaces huérfanos de la landing anterior.
  - El enlace "Diagnóstico" y el botón principal "Solicitar diagnóstico" ahora redirigen de manera oficial al formulario interactivo `/diagnostico` mediante `<Link to="/diagnostico">`.
  - Se mapearon las secciones activas del portafolio: `Reels` (`#reels`), `Casos` (`#casos`) y `Detrás de Cámaras` (`#bts`), sincronizadas en versión desktop y menú móvil.
- **Detrás de Cámaras (`src/components/portfolio/PortfolioBtsStrip.jsx`)**:
  - Se incorporó el identificador de ancla `id="bts"`.

---

## [2026-10-30] — Efecto Físico Shake Elástico en Tubo de Ensayo al Subir Nivel

### Modificado
- **Micro-interacción Shake Reactivo (`TestTube.jsx`, `Index.jsx` e `index.css`)**:
  - Se vinculó `shakeKey={stageIndex}` al componente `TestTube.jsx`.
  - Cada vez que la síntesis avanza y el Flip Text cambia de fase, el tubo ejecuta una animación física de mezcla (`origin-bottom`) con amortiguación natural (`cubic-bezier(0.36,0.07,0.19,0.97)` de 0.6s) simulando la agitación de la fórmula.
  - La oscilación va de mayor a menor amplitud ($-5^\circ \rightarrow +4^\circ \rightarrow -3^\circ \rightarrow +2^\circ \rightarrow 0^\circ$) brindando un acabado táctil y pulido.

---

## [2026-10-30] — Tubo de Ensayo en Proporción 4:8, Mayor Ancho y Centrado Total

### Modificado
- **Tubo de Ensayo Proporcionado y Centrado (`TestTube.jsx` e `Index.jsx`)**:
  - Se aumentó la altura del tubo de 350px a **390px** y su ancho proporcional a **135px**, haciendo que las paredes del cristal se vean sustancialmente más gruesas y con cuerpo real de laboratorio.
  - Se asignó una columna `lg:col-span-4` centrada (`justify-center items-center`), garantizando que el tubo se posicione en el **medio geométrico de su espacio disponible**.
  - La columna de contenidos se balanceó en `lg:col-span-8` manteniendo alineación a la izquierda y el recuadro dinámico con Flip Text.

---

## [2026-10-30] — Rebalanceo Asimétrico 3:9 y Aumento de Escala del Tubo

### Modificado
- **Proporción Asimétrica 3:9 (`src/pages/Index.jsx`)**:
  - Se reconfiguró el layout del grid: la columna izquierda del tubo ahora ocupa `lg:col-span-3` (alineada hacia la derecha de su celda para aproximarse al texto), mientras que la columna de narrativa se expande a `lg:col-span-9`.
  - Se eliminaron los espacios vacíos excesivos a los costados reduciendo el gap y balanceando los pesos visuales.
  - Se amplió la altura del tubo de ensayo reactivo a **350px**, logrando un instrumento estilizado y protagónico.

---

## [2026-10-30] — Tubo de Ensayo Protagónico & Indicador de Progreso con Flip Text

### Modificado
- **Tubo de Ensayo Protagónico (`TestTube.jsx` e `Index.jsx`)**:
  - Se habilitó escalado proporcional en `TestTube.jsx` y se aumentó la altura del tubo a 290px en la columna izquierda.
  - El tubo queda ahora completamente solo en su columna, ganando máxima presencia visual y espacial.
- **Progreso Dinámico con Efecto Flip Text (`Index.jsx`)**:
  - Se reubicó el pill de estado al lado derecho, justo debajo del titular *"Estamos calibrando una nueva fórmula"*.
  - Se implementó transición tridimensional `rotateX` (`AnimatePresence` de Framer Motion) sincronizada con la subida reactiva del fluido del tubo:
    - *Sintetizando activos (35%)* $\rightarrow$ *Calibrando iluminación en set (50%)* $\rightarrow$ *Ajustando retención del algoritmo (65%)* $\rightarrow$ *Optimizando micro-formatos (80%)* $\rightarrow$ *Comprimiendo fórmula final (95%)*.
  - Sincronización cromática inmediata del punto indicador y del líquido SVG en `#ef18d6` y `#188ff0`.

---

## [2026-10-30] — Ajuste de Viewport & Layout 2 Columnas en Pantalla Raíz

### Modificado
- **Layout en 2 Columnas y Cero Scroll (`src/pages/Index.jsx`)**:
  - Se ancló la pantalla completa al viewport exacto: `h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between`.
  - Se distribuyó el contenido en 2 columnas:
    - **Izquierda**: Tubo de Ensayo insignia reactivo (`TestTube.jsx`) renderizado directamente sobre la textura `#f4f4f4` (eliminada la tarjeta blanca que lo encapsulaba).
    - **Derecha**: Textos alineados a la izquierda (`text-left items-start`), con titular en display Sora, badge pill y párrafo descriptivo.
  - Se eliminó el botón de contacto directo por WhatsApp para enfocar la navegación en el proceso de diagnóstico oficial (`/diagnostico`) y el portafolio de producción (`/portafolio`).

---

## [2026-10-30] — Pantalla "En Preparación" (Coming Soon) & Depuración de Landing Anterior

### Agregado
- **Nueva Pantalla Raíz (`src/pages/Index.jsx`)**:
  - Pantalla sobria, minimalista y estética ("Clinical High-Tech Lab") que comunica el estado de preludio *"Estamos calibrando una nueva fórmula"*.
  - Tubo de ensayo insignia reactivo (`TestTube.jsx`) con ciclo continuo de fluidos en Magenta (`#ef18d6`) y Azul Eléctrico (`#188ff0`).
  - Accesos secundarios discretos en formato pill shape táctil a `/portafolio`, `/diagnostico` y contacto directo por WhatsApp.
  - Privacidad total: se omitió intencionalmente cualquier enlace o referencia visible a `/login`.
- **Componente Reutilizable (`src/components/common/TestTube.jsx`)**:
  - Reubicado el tubo de ensayo SVG reactivo para independizarlo de la landing anterior y garantizar el funcionamiento de la barra de progreso en `/diagnostico`.
- **Navegación Compartida (`src/components/common/nav/`)**:
  - Reubicados `Navbar.jsx` y `Footer.jsx` para dar soporte al portafolio de manera modular.

### Eliminado
- **Limpieza de Componentes Antiguos de Landing**:
  - Eliminados los archivos monolíticos en desuso de `src/components/landing/` (`HeroSection.jsx`, `ClientsSection.jsx`, `ValueSection.jsx`, `FrameworkSection.jsx`, `SpecialistsSection.jsx`, `SocialProofSection.jsx`, `OfferSection.jsx` y el directorio `InteractiveDiagnosticForm`).

---

## [2026-10-30] — Erradicación de Iconografía de IA en Capa Pública (Human Craft UI)

### Eliminado
- **Eliminación total del antipatrón de chispitas mágicas (`Sparkles`)**:
  - En vistas públicas principales (`Navbar.jsx`, `PortfolioHero.jsx`, `PortfolioFeaturedCases.jsx`, `PortfolioCtaSection.jsx`, `PortfolioReelCard.jsx`, `PublicCalendarHero.jsx`, `PublicCalendarFeedView.jsx`, `PublicCalendarStates.jsx`, `LeadContactCard.jsx`, `LeadSuccessCard.jsx`, `ProposalActivationModal.jsx`, `ProposalWhyUsAndConditions.jsx`, `BookingSuccessCard.jsx`).
- **Eliminación de iconos clichés de SaaS de IA (`Rocket`, `Zap`)**:
  - En el selector de planes de propuesta comercial (`ProposalCalculatorSection.jsx`, `proposalData.js`) y preguntas del embudo de diagnóstico (`LeadQuestionCard.jsx`, `leadFormData.js`).
- **Eliminación de glifos Unicode decorativos**:
  - Removido `✦` en la navegación móvil del Navbar y `★` en los puntos de optimización del reporte de diagnóstico (`diagnosticData.js`).

### Modificado
- **Sustitución por Iconografía Vectorial Técnica & Cinematográfica**:
  - Portafolio en Navbar: `<Film className="w-3.5 h-3.5" />` (consistente en desktop y mobile drawer).
  - Casos de Estudio en Portafolio: `<Microscope className="w-3.5 h-3.5" />`.
  - Sesión de Diagnóstico en CTA: `<Activity className="w-3.5 h-3.5" />`.
  - Estados de Carga en Calendario: Reemplazado `Sparkles` girando por `<Loader2 className="animate-spin" />`.
  - Planes de Propuesta: Plan Esencial identificado con `<Film />` y Plan Escala/Dominio con `<Target />`.
  - Opciones de formulario: Industria Wellness con `<Flame />`, Negocio en etapa temprana con `<Target />` y Agencia con `<Briefcase />`.
  - Activación de propuesta: `<Clapperboard className="w-5 h-5" />`.

---

## [2026-10-29] — Inversión de Columnas en Ramos Joyería (Layout Alternado Zig-Zag)

### Modificado
- **Layout Alternado en Casos Destacados (`PortfolioFeaturedCases.jsx` y `portfolioData.js`)**:
  - Se añadió la propiedad `reverseLayout: true` en el caso `case-ramos`.
  - Se configuraron clases condicionales en `PortfolioFeaturedCases.jsx`:
    - Columna de medios en scroll: `isReversed ? "lg:order-1" : "lg:order-2"` (pasa al lado izquierdo en Ramos Joyería).
    - Columna de información sticky: `isReversed ? "lg:order-2" : "lg:order-1"` (pasa al lado derecho en Ramos Joyería, manteniendo su comportamiento estático `lg:sticky lg:top-24 self-start` hasta la línea divisoria inferior).
  - Crea una composición rítmica de lectura visual alternada (zig-zag): Yamamoto (Info Izquierda / Medios Derecha) → Ramos Joyería (Medios Izquierda / Info Derecha) → Mau Fuentes (Info Izquierda / Medios Derecha).

---

## [2026-10-29] — Activación de CSS Sticky Nativo (Desbloqueo de Overflow)

### Modificado
- **Desbloqueo de `position: sticky` en Casos Destacados (`PortfolioFeaturedCases.jsx`)**:
  - Se eliminó la clase `overflow-hidden` de la etiqueta `<section id="casos">`, la cual neutralizaba el comportamiento de `position: sticky` en el navegador.
  - Los gradientes radiales de iluminación ambiental se encapsularon dentro de una capa absoluta independiente con `overflow-hidden pointer-events-none`.
  - La columna izquierda (`lg:sticky lg:top-24 self-start`) ahora opera de forma 100% nativa y fluida a 60/120fps, permaneciendo estática en pantalla a 96px mientras el usuario visualiza las imágenes de la columna derecha, y deteniéndose automáticamente antes de la línea divisoria gris (`border-b`).

---

## [2026-10-29] — Corrección de Alineación Superior y Delimitación Inferior

### Modificado
- **Alineación y Sticky Delimitado en Casos Destacados (`PortfolioFeaturedCases.jsx`)**:
  - Se eliminó el conflicto entre el pinning forzado de GSAP (`pinSpacing: false`) y el layout del grid, resolviendo el desfase vertical inicial entre ambas columnas.
  - Se implementó `lg:sticky lg:top-24 self-start` en la columna izquierda dentro del contenedor `items-start`, garantizando que la columna izquierda y la multimedia inicien en la misma coordenada horizontal superior (cero gap).
  - La columna de información se detiene automáticamente al alcanzar el borde inferior del artículo `<article>`, impidiendo que la cita testimonial rebase la línea divisoria gris (`border-b`).
  - GSAP ScrollTrigger se reorientó a micro-animaciones suaves de entrada (`fade-item`) sin interferir con el flujo del grid.

---

## [2026-10-29] — Inversión de Pinning: Columna de Información Fija al Viewport

### Modificado
- **Inversión de Anclaje en Casos Destacados (`PortfolioFeaturedCases.jsx`)**:
  - Se reorientó la lógica de GSAP ScrollTrigger para fijar (`pin`) la columna de información izquierda (`.case-info-col`) a `top: 100px`, impidiendo que se desplace hacia arriba y se oculte bajo el Navbar fijo.
  - La columna multimedia derecha (`.case-media-col`) ahora se desplaza naturalmente con el scroll del usuario hasta que todos los medios (slider comparador, fotografías o tiras de reels) han sido visualizados.
  - Se implementó fallback híbrido con clases Tailwind `lg:sticky lg:top-28` para máxima estabilidad visual.
- **Cuadrícula 2x2 para Yamamoto (`portfolioData.js` y `PortfolioFeaturedCases.jsx`)**:
  - Se incorporó el 4to reel ("Experiencia Omakase") y se configuró una cuadrícula responsive `grid-cols-1 sm:grid-cols-2 gap-4`, permitiendo que la columna derecha tenga la altura ideal para el recorrido del scroll.

---

## [2026-10-29] — Pinning con GSAP ScrollTrigger y Corrección de Contrastes

### Agregado
- **Animaciones e Interactividad con GSAP**:
  - Instaladas dependencias `gsap` y `@gsap/react`.
  - Integrado hook `useGSAP` y `ScrollTrigger` en `PortfolioFeaturedCases.jsx` con soporte para `gsap.matchMedia("(min-width: 1024px)")`.

### Modificado
- **Pinning de Columna Derecha (`PortfolioFeaturedCases.jsx`)**:
  - En pantallas de escritorio (`>= 1024px`), la columna derecha que contiene el comparador slider interactivo (Ramos Joyería) o las tiras de reels (Yamamoto y Mau Fuentes) se mantiene fija en viewport mientras la columna izquierda con la narrativa se desplaza suavemente con el scroll.
- **Corrección Quirúrgica de Contrastes**:
  - `PortfolioFeaturedCases.jsx`: Se forzó `!text-white` en encabezados `h2` y `h3` para evitar la sobreescritura accidental de la capa base global de Tailwind (`text-gray-900`), logrando contraste máximo sobre `#1E1B1F`.
  - Descripciones y etiquetas actualizadas a tonos luminosos (`text-gray-200` y `text-gray-300`).
  - Tarjetas de reto, fórmula y métricas actualizadas a `bg-white/[0.07] border-white/15 backdrop-blur-md`.
  - `PortfolioReelCard.jsx`: Títulos con `!text-white` y gradiente oscuro inferior ampliado (`from-black/95 via-black/40 to-transparent`) para legibilidad sobre cualquier fotograma.
  - `PortfolioCompareSlider.jsx`: Etiquetas de navegación ajustadas a `text-gray-300` y `text-brand-magenta font-extrabold`.
- **Estandarización de Alturas y Espacios en 'Toma 47' (`PortfolioBtsStrip.jsx` y `portfolioData.js`)**:
  - Unificada la proporción de todos los medios a `aspect-[4/5]`, eliminando el espacio blanco inferior vacío en las fotos de joyería y garantizando que las 5 tarjetas tengan exactamente la misma altura.

---

## [2026-10-29] — Transformación y Lanzamiento del Portafolio (.jsx + DESIGN.md)

### Agregado
- **Módulo de Portafolio en React (`/portafolio`)**:
  - `src/pages/PortfolioPage.jsx`: Controlador principal modularizado (50 líneas, cumpliendo el límite de ≤ 200 líneas de `GEMINI.md`).
  - `src/data/portfolioData.js`: Configuración declarativa con 11 reels, 3 casos de estudio, fotos detrás de cámaras y ecosistema de marcas.
  - `src/components/portfolio/PortfolioHero.jsx`: Cabecera display con badge de laboratorio y titular de alto impacto.
  - `src/components/portfolio/PortfolioMarquee.jsx`: Carrusel infinito con animación horizontal suave `animate-marquee` y pausa en hover.
  - `src/components/portfolio/PortfolioReelCard.jsx`: Mockup vertical (9:16) con reproducción inline, toggle de audio y control táctil.
  - `src/components/portfolio/PortfolioReelsWall.jsx`: Muro filtrable por categorías (Restaurantes, Marca Personal, Joyería, Wellness).
  - `src/components/portfolio/PortfolioFeaturedCases.jsx`: Casos de estudio en profundidad (Yamamoto, Ramos Joyería, Mau Fuentes) con retos, soluciones y métricas.
  - `src/components/portfolio/PortfolioCompareSlider.jsx`: Slider interactivo táctil "En el set vs Resultado final" para Ramos Joyería.
  - `src/components/portfolio/PortfolioBtsStrip.jsx`: Galería "Toma 47" de momentos de producción y rodaje.
  - `src/components/portfolio/PortfolioBrandsGrid.jsx`: Rejilla limpia de marcas colaboradoras.
  - `src/components/portfolio/PortfolioCtaSection.jsx`: Cierre de conversión conectando con `/diagnostico` y WhatsApp.

### Modificado
- `src/App.jsx`: Registradas las rutas `/portafolio` y `/portfolio`.
- `src/components/landing/Navbar.jsx`: Añadido enlace destacado al Portafolio en el menú desktop y móvil.
- `src/components/landing/Footer.jsx`: Añadido enlace al Portafolio de Reels en la barra de navegación inferior.
- `tailwind.config.js`: Añadidos keyframe y animación `marquee` para el desplazamiento infinito.

---

## [2026-10-27] — UX Responsive y Ciclo de Vida de Observaciones (Punto 5)

### Modificado
- **UX Móvil del Calendario (`CalendarMobileView.jsx`)**:
  - Al presionar cualquier celda del calendario mensual móvil, el evento táctil únicamente actualiza la fecha seleccionada activa (`selectedMobileDate`) en el cajón de agenda superior, sin lanzar modales ni popups intrusivos.
- **Viewport Desktop 100vh (`CalendarDesktopGrid.jsx` y `PublicCalendarPage.jsx`)**:
  - Implementadas filas proporcionales dinámicas (`grid-rows-5` y `grid-rows-6`) con `flex-1 min-h-0` y `h-full` en las tarjetas de días. La vista pública del calendario ahora encaja exactamente en el viewport de 100vh en laptops y pantallas de escritorio sin provocar scroll vertical.
- **Ciclo de Vida de Observaciones del Cliente (`PostModal.jsx` y `calendarService.js`)**:
  - El banner ámbar de observaciones/cambios solicitados ahora tiene una condición estricta ligada a `estado === "en_edicion"`.
  - Si la publicación ya fue atendida y su estado es "Programado" (`programado`), el banner no se muestra.
  - Al cambiar de estado a "Programado" o al presionar "Descartar", la función `updatePost` en Supabase limpia automáticamente los campos `notas_cambios = null` y `fecha_cambios = null` para prevenir advertencias obsoletas.

---

## [2026-10-27] — Eliminación de Estilos Inline en Landing (Regla 3)

### Modificado
- **Migración a Tailwind CSS puro (Regla 3: Sin estilos inline)**:
  - `ClientsSection.jsx`: Sustituidos estilos inline de colores por clases utilitarias `bg-brand-magenta`, `text-brand-magenta`, `bg-brand-blue` y `text-brand-blue`.
  - `FrameworkSection.jsx`: Reemplazados fondos, bordes de hover e iconos inline por clases utilitarias de Tailwind con `hover:border-brand-magenta/40` y `hover:border-brand-blue/40`.
  - `SocialProofSection.jsx`: Convertidas tarjetas de casos a clases `text-brand-magenta`, `bg-brand-magenta/10` y equivalentes en azul.
  - `SpecialistsSection.jsx`: Reemplazados bordes dinámicos, títulos de cargo y barras decorativas por clases Tailwind.
  - `ValueSection.jsx`: Badges, fondos de iconos y prescripciones (Rx) migrados a clases `bg-brand-magenta/15`, etc.
  - `ResultCard.jsx`: Bordes laterales y badges de diagnóstico convertidos a `border-l-brand-magenta`, etc.
  - `IntakePhase.jsx`: Barras de avance, etiquetas y botones interactivos migrados a hover y colores de Tailwind.
  - `TestTube.jsx`: SVG transformado a atributos directos `fill` y `fillRule`, con animación mediante `className="overflow-visible animate-[labShake_0.4s_ease-in-out_3]"`.

---

## [2026-10-27] — Modularización de Páginas y Estandarización de Memoria

### Agregado
- **Sistema de Continuidad (Regla 2)**:
  - Inclusión de `GEMINI.md` en la raíz del repositorio Git.
  - Creación de `STATUS.md` y `CHANGELOG.md` en el repositorio para seguimiento continuo entre chats.
- **Subcomponentes Atómicos para Páginas (Regla 4.B y 5)**:
  - `src/hooks/useDashboardData.js`: Hook para carga reactiva de propuestas, diagnósticos y suscripciones realtime en Supabase.
  - `src/components/dashboard/common/DashboardHeader.jsx`: Barra superior con popover de notificaciones y menú de usuario.
  - `src/components/dashboard/common/DashboardTabs.jsx`: Controles segmentados tipo píldora para pestañas del dashboard.
  - `src/utils/proposalHelpers.js`: Constructor desacoplado del payload JSON de propuestas (`buildProposalContentJson`).
  - `src/components/calendar/PublicCalendarHeader.jsx`: Cabecera pública con switchers de vista (Grid vs Feed).
  - `src/components/calendar/PublicCalendarStates.jsx`: Estados atómicos de carga (`PublicCalendarLoading`) y error (`PublicCalendarNotFound`).
  - `src/components/booking/BookingHeader.jsx`: Cabecera del portal de auto-reserva.
  - `src/components/booking/BookingStates.jsx`: Estados atómicos de carga (`BookingLoadingSkeleton`) y error (`BookingErrorCard`).

### Modificado
- **Modularización de Páginas (Cumplimiento 100% Regla 4.B ≤ 200 líneas)**:
  - `Dashboard.jsx`: Reducido de 481 líneas a **193 líneas**.
  - `PublicCalendarPage.jsx`: Reducido de 276 líneas a **185 líneas**.
  - `ProductionBookingPage.jsx`: Reducido de 232 líneas a **194 líneas**.

### Eliminado
- `src/components/dashboard/common/ConfirmDeleteModal.jsx`: Eliminado archivo redundante consolidando todas las importaciones en `@/components/common/ConfirmDeleteModal`.

---

## [2026-10-27] — Alineación Tipográfica y Resolución de Feedback

### Agregado
- **Tipografía y Fuentes (`DESIGN.md`)**:
  - Alias nativos de fuentes en `tailwind.config.js`: `sans`, `inter`, `body`, `sora`, `display` y `mono`.
  - Escala tipográfica semántica en Tailwind: `display` (3.5rem / 700), `h1` (2.5rem / 700), `h2` (1.875rem / 600) y `h3` (1.25rem / 600).
  - Carga asíncrona no bloqueante con `preconnect` a Google Fonts en `index.html`.
- **Nuevo Estado `publicado`**:
  - Incorporado a contratos en `postStatusHelpers.js` con el color oficial Brand Magenta (`#ef18d6`).
  - Añadido al dropdown de estados en `PostModal.jsx`, filtros en `ScheduledPostsFilterBar.jsx` y leyendas de progreso en `CalendarDesktopGrid.jsx`.
- **Botón Descartar Observación**:
  - Agregado en `PostModal.jsx` dentro del banner de feedback para permitir a la agencia resolver observaciones manualmente si se mantiene en edición.

### Modificado
- **Limpieza de Observaciones Obsoletas**:
  - Modificada la RPC `aprobar_post_publico` en Supabase para limpiar automáticamente `notas_cambios = NULL` y `fecha_cambios = NULL` cuando una publicación se aprueba.
  - Actualizado `calendarService.js` (`updatePost`) para limpiar automáticamente las observaciones al guardar la publicación en un estado distinto a `en_edicion`.
  - En `PostModal.jsx`, el banner de observaciones del cliente ahora solo se muestra si `estado === "en_edicion"` (ocultándose reactivamente al cambiar a `programado`, `aprobado` o `publicado`).
