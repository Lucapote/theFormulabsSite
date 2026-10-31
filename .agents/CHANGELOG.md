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
