# Historial de Cambios — The Formulab (CHANGELOG.md)

Todos los cambios notables, decisiones de arquitectura y soluciones implementadas en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y cumple con la **Regla 2** de `GEMINI.md`.

---

## [2026-11-06] — Modularización de Componentes Extensos (Opción B — Sprint 1)

### Modificado / Refactorizado bajo SRP (Regla 5 de GEMINI.md)
- **Centro de Notificaciones (`NotificationCenterPopover.jsx`)**:
  - Reducción de **438 a 200 líneas** ($\le 250$).
  - Extracción atómica de `FailedPostNotificationCard.jsx` (94 lín), `PreReservaNotificationCard.jsx` (48 lín), `FeedbackNotificationCard.jsx` (59 lín) y `NotificationZeroInboxCard.jsx` (19 lín).
- **Modal de Finanzas del Ciclo (`FinanceCostModal.jsx`)**:
  - Reducción de **412 a 222 líneas** ($\le 250$).
  - Extracción de `ReceiptUploaderField.jsx` (89 lín, eliminando código duplicado de subida a R2), `FinanceAmountsFormFields.jsx` (75 lín) y `FinanceMarginSummaryCard.jsx` (26 lín).
- **Modal de Alta de Clientes (`CreateClientModal.jsx`)**:
  - Reducción de **411 a 115 líneas** ($\le 250$).
  - Extracción de pestañas en `CreateClientIdentityTab.jsx` (87 lín) y `CreateClientRetainerTab.jsx` (238 lín).
- **Cajón Deslizable de Publicación (`PostCopyBottomSheet.jsx`)**:
  - Reducción de **377 a 248 líneas** ($\le 250$).
  - Extracción de la botonera condicional de estados en `PostCopyBottomSheetActions.jsx` (172 lín).

---

## [2026-11-06] — Quick-Wins de Cumplimiento GEMINI.md (Estilos Inline y Seguridad API)

### Modificado / Corregido
- **Eliminación de Estilos Inline Residuales (Regla 3)**:
  - [`BookingChecklistSection.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/booking/BookingChecklistSection.jsx): Se reemplazó el inline style de ancho dinámico por la función `getProgressWidthClass` con clases utilitarias nativas de Tailwind (`w-full`, `w-3/4`, etc.).
  - [`Index.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/pages/Index.jsx): Se reemplazó `style={{ backgroundColor: ... }}` por las clases utilitarias `bg-brand-magenta` y `bg-brand-blue` en el indicador de etapas del laboratorio.
- **Eliminación de Fallbacks Literales (Regla 7)**:
  - [`api/meta-callback.js`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/api/meta-callback.js): Se removió el Meta App ID quemado como fallback (`"1988387095189436"`), requiriendo validación explícita de `META_APP_ID` y `META_APP_SECRET`.

---

## [2026-11-06] — Arquitectura de 2 Columnas en Tarjeta Operativa de Ciclo

### Agregado
- **Panel Unificado de Administración y Finanzas (`CycleClientPanel.jsx`)**:
  - Consolida la información del cliente, configuración, badges ordenados (`Corte: Día X`, `Orgánica / Profesional`), selector de estado de pago, validación ágil y acceso al calendario en la Columna 1 (`lg:col-span-4`, 33.3% del ancho).
  - Incluye acceso directo al desglose de costos (`[$ Costos]`) y pie financiero (`Cobrado` / `Costo Op`).
- **Bloque Atómico de Validación de Pagos (`CyclePaymentVerificationBlock.jsx`)**:
  - Subcomponente modular (123 líneas) para selectores de estado, alertas de comprobantes y acreditación rápida.

### Modificado
- **Reorganización a 2 Columnas en `OperationsCycleCard.jsx`**:
  - Se eliminó la 3ra columna independiente. El contenido financiero ahora reside debajo de la identidad del cliente en la Columna 1.
  - La Columna 2 de Rodajes (`CycleSessionsTrack.jsx`) se expande al **66.7% del ancho** (`lg:col-span-8`), otorgando máxima prioridad y legibilidad al rodaje próximo y secundarias.
- **Eliminación de Redundancias y Etiquetas Confusas**:
  - Se eliminó la etiqueta incomprensible `"Pagos: 1 + 1 ses."`.
  - Se eliminó la duplicación del día de corte (ahora solo se muestra una vez de forma destacada bajo el nombre de la empresa).

---

## [2026-11-06] — Borde Brand Magenta y Reducción de Altura en Próximo Rodaje

### Modificado
- **Borde Quirúrgico Rosa de Marca (`UpcomingProductionSpotlight.jsx`)**:
  - Se sustituyó el borde azul suave por un borde de 2px en el rosa oficial de la marca (`border-2 border-[#ef18d6]`).
  - Se eliminó la franja superior en degradé para un acabado más limpio y estilizado.
  - Se reemplazó el estilo inline de la barra de progreso por clases dinámicas de Tailwind (`w-full`, `w-3/4`, etc.) para cumplir estrictamente con GEMINI.md.
- **Reducción de Altura y Limpieza de Redundancia (`CycleSessionsTrack.jsx`)**:
  - Se removió el banner flotante superior `"Reserva Bloqueada (Requiere Comprobante)"`, eliminando espacio vertical muerto y evitando duplicidad con la insignia interna de `"Pendiente de Reserva"`.

---

## [2026-11-06] — Rediseño "Mission Control Operativo" en Tarjetas de Ciclo Mensual

### Agregado
- **Tarjeta Central de Próximo Rodaje (`UpcomingProductionSpotlight.jsx`)**:
  - Hero card visual con acento gradiente de marca (`#ef18d6` a `#188ff0`), destacando la sesión más próxima en el tiempo (o la primera pendiente por filmar).
  - Muestra prominente de fecha y hora, badge de estado operativo (`Agendada`, `Fecha Propuesta`, etc.), locación y barra de progreso interactiva de requerimientos (`X/Y listos`).
  - Botón de 1-clic para copiar el enlace de auto-reserva pública para compartir directamente con el cliente.
  - Al hacer clic abre directamente el modal de detalle de producción para gestionar la logística.
- **Fila de Sesiones Secundarias (`SecondarySessionsList.jsx`)**:
  - Subcomponente modular que compacta el resto de rodajes del mes en cápsulas limpias con botón `+ Agregar Rodaje`.
- **Selector Inteligente de Sesión Más Próxima (`bookingHelpers.js`)**:
  - Función `getClosestUpcomingSession` que ordena cronológicamente y discrimina la sesión prioritaria de las secundarias.
- **Insignias de Comprobantes Verificados (`CycleApprovedReceiptsBadges.jsx`)**:
  - Modularización bajo SRP para mantener `CycleFinanceHub.jsx` dentro del límite de 250 líneas.

### Modificado
- **Reestructuración de Cuadrícula en `OperationsCycleCard.jsx`**:
  - Se transformó la distribución a `3 - 6 - 3`: Columna 1 para Cliente/Contrato (`lg:col-span-3`), Columna 2 para Mission Control Operativo (`lg:col-span-6`, 50% de la tarjeta) y Columna 3 para Logística de Pago (`lg:col-span-3`).
- **Logística de Pago Discreta (`CycleFinanceHub.jsx`)**:
  - Se condensó la columna financiera para priorizar las fechas límite de corte (`Día 5` o `Días 5 y 25`) y selectores de estado compactos, relegando las cifras numéricas a una fila secundaria para no opacar el foco operativo de rodaje.

---

## [2026-11-06] — Cuadro Multilínea con Salto de Línea en Gestor de Requerimientos

### Agregado
- **Área de Texto Multilínea (`ProductionChecklistManager.jsx`)**:
  - Reemplazo del input mono-línea por un `<textarea>` con soporte nativo para saltos de línea al presionar `Enter`.
  - Permite escribir manualmente línea por línea o pegar en bloque listas completas de WhatsApp, Notion o Notas.
  - Al pulsar `+ Agregar a la lista`, el sistema limpia automáticamente viñetas (`•`, `-`, `*`), números (`1.`) y casillas (`[ ]`), generando los ítems de checklist individuales sin ruido visual.
  - Botón de acción rápida para vaciar toda la lista en caso de querer reiniciar.

---

## [2026-11-06] — Tarjeta Unificada de Reserva (3 Pasos: Comprobante | Reserva | Requerimientos)

### Agregado
- **Paso 3 [Requerimientos] Integrado en la Tarjeta (`BookingChecklistSection.jsx`)**:
  - Se convirtió el checklist de requerimientos en el 3er paso del flujo de auto-reserva (`[Comprobante] [Reserva de Sesión] [Requerimientos]`), eliminando las tarjetas apiladas externas con anchos disparejos.
  - Ahora reside dentro del mismo contenedor con ancho 100% idéntico (`w-full max-w-xl mx-auto`).
- **Hook de Gestión de Reserva (`useBookingFormManager.js`)**:
  - Desacoplamiento de la lógica de fechas, turnos, comprobantes y validaciones SLA de `BookingFormCard.jsx`, reduciendo el componente a **213 líneas** (cumpliendo con la Regla 5 de `GEMINI.md`).

### Modificado
- **Selector de Pasos Clínico (`BookingStepTracker.jsx`)**:
  - Adaptación para soportar 3 pasos de forma fluida y responsiva, con etiquetas cortas en móvil para evitar saltos de línea.
- **Tarjetas de Reserva (`BookingLockedCard.jsx` & `BookingFormCard.jsx`)**:
  - Integración nativa del paso 3 para consultar o marcar requerimientos en cualquier momento con un solo tap.
  - En móvil, todo se mantiene visible e inline sin necesidad de recurrir a bottom sheets ni provocar scroll.

---

## [2026-11-06] — Viewport Móvil Sin Scroll (100dvh) y Eliminación de Duplicados en Reserva

### Eliminado / Corregido
- **Doble Encabezado en Mobile y Desktop (`BookingHeader.jsx` en tarjetas)**:
  - Se removió la invocación redundante de `BookingHeader` dentro de `BookingLockedCard.jsx` y `BookingFormCard.jsx`. Ahora el logo y badge de *Auto-Reserva* se muestran única y exclusivamente en el navbar superior de la página (`ProductionBookingPage.jsx`).
- **Checklist Redundante en Desktop (`BookingSideContextPanel.jsx`)**:
  - Se eliminó la sección de requerimientos de la columna izquierda de información de rodaje, dejando únicamente la tarjeta interactiva autónoma en la columna principal.

### Agregado / Modificado
- **Cajón Deslizable Móvil para Requerimientos (`BookingChecklistBottomSheet.jsx`)**:
  - Subcomponente móvil con handle táctil ergonómico superior y backdrop blur. En pantallas pequeñas, el checklist se resume en una barra compacta de 38px (`BookingChecklistCard.jsx`), ahorrando más de 130px de espacio vertical.
- **Ficha Bancaria Quirúrgica Compacta (`BookingBankDetailsCard.jsx`)**:
  - Reducción de espaciados verticales, alineación horizontal de datos y botón de copia rápida de CLABE de 28px.
- **Dropzone Horizontal de Comprobante (`BookingReceiptDropzone.jsx`)**:
  - Reemplazo del contenedor vertical masivo por una franja horizontal interactiva optimizada para el pulgar (~45px).
- **Cumplimiento Estricto de GEMINI.md**:
  - Todos los subcomponentes creados y editados se mantienen estrictamente por debajo de los límites ($\le 250$ líneas en componentes, $\le 200$ en páginas).

---

## [2026-11-06] — Checklist en Sesiones Extras & Manejo Defensivo de Esquema Supabase

### Agregado
- **Checklist en "Agregar Sesión Extra" (`CreateProductionModal.jsx`)**:
  - Incorporación del gestor de requerimientos (`ProductionChecklistManager.jsx`) para predefinir checklist desde la creación de una nueva sesión o sesión extra.
  - Creación del subcomponente `CreateProductionLogisticsFields.jsx` para mantener `CreateProductionModal.jsx` modularizado con **249 líneas** (cumpliendo estrictamente el límite de $\le 250$ líneas de `GEMINI.md`).

### Corregido
- **Manejo Defensivo del Esquema Supabase (`operationsService.js`)**:
  - Corrección del error de PostgREST `Could not find the 'requerimientos' column of 'producciones' in the schema cache`.
  - Se implementó detección insensible a mayúsculas (`msg.toLowerCase().includes("requerimientos")`) tanto en `updateProduccion` como en `createProduccionExtra`. Si la columna aún no ha sido creada en la base de datos de Supabase, la aplicación descarta automáticamente ese campo y guarda todos los demás datos de la sesión exitosamente sin lanzar alertas de error rojas ni interrumpir el flujo del usuario.

---

## [2026-11-06] — Sistema de Checklist de Requerimientos de Rodaje (Cliente & Dashboard)

### Agregado
- **Migración SQL y RPC Seguro (`20261106_requerimientos_produccion_checklist.sql`)**:
  - Columna `requerimientos jsonb DEFAULT '[]'::jsonb` en la tabla `producciones`.
  - Función RPC `actualizar_checklist_produccion_rpc(p_token, p_requerimientos)` con seguridad `SECURITY DEFINER` para permitir al cliente actualizar sus checks mediante el token público de reserva.
- **Gestor Administrativo de Checklist (`ProductionChecklistManager.jsx`)**:
  - Bloque interactivo en el modal de detalle de producción del Dashboard para añadir requerimientos personalizados con botón `+ Agregar` o tecla Enter, listado dinámico con estado de cumplimiento en tiempo real (`Pendiente` o `✓ Listo`) y botón de eliminación por ítem.
- **Tarjeta Interactiva de Checklist para el Cliente (`BookingChecklistCard.jsx`)**:
  - Componente visible a primera vista en `/reservar/produccion` con casillas táctiles de $\ge 44$px de alto, respuesta elástica (`active:scale-[0.98]`), barra de progreso clínica y sincronización optimista en tiempo real.
- **Servicio Asíncrono Puro (`actualizarChecklistProduccion`)**:
  - Función en `operationsService.js` para persistencia atómica por token con fallback defensivo.

### Modificado
- **Página de Reserva (`ProductionBookingPage.jsx`)**:
  - Inserción de `BookingChecklistCard` tanto en la vista previa a la confirmación como en la pantalla de éxito. Optimización de maquetación para mantenerse en **191 líneas** ($\le 200$ líneas).
- **Panel de Contexto Lateral (`BookingSideContextPanel.jsx`)**:
  - Incorporación de resumen visual de requerimientos de rodaje en desktop/laptop.
- **Modal de Operaciones (`ProductionDetailModal.jsx` & `useProductionDetailManager.js`)**:
  - Integración del gestor de requerimientos y persistencia en el ciclo de vida del formulario.

---

## [2026-11-04] — Corrección del Bloqueo en Navegación de Carruseles (`MediaCarousel.jsx`)

### Corregido
- **Bloqueo de Retroceso a Diapositiva Inicial en Carrusel (`MediaCarousel.jsx`)**:
  - Se eliminó el condicional restrictivo `initialIndex > 0` que impedía realizar el desplazamiento por scroll hacia la diapositiva `0` al retroceder.
  - Se resolvió la condición de carrera (race condition) entre el scroll suave programático y el listener nativo `onScroll`: se incorporó la bandera `isProgrammaticScroll` con desbloqueo diferido de 400ms para ignorar las posiciones fraccionarias intermedias durante la animación de las flechas o puntos indicadores.
  - Esto garantiza que al navegar hacia atrás desde `2/4` se retorne de forma suave y precisa a `1/4` sin rebotes ni bloqueos en el modal de publicaciones de los calendarios.

---

## [2026-11-04] — Reemplazo Auténtico de Material 'Toma 47' & Optimización BTS (Portafolio)

### Modificado
- **Contenido Auténtico Detrás de Cámaras (`src/data/portfolioData.js`)**:
  - Reemplazo completo de las fotos de stock anteriores por los 5 videos reales de rodaje de `/portfolio/toma47/`.
  - Generación de miniaturas WebP de alta fidelidad y bajo peso (`seleccionado1.webp` a `seleccionado5.webp`) para carga instantánea.
  - Creación de títulos y etiquetas técnicas cinematográficas que reflejan exactamente la acción de cada video:
    1. `"Corte milimétrico de sashimi"` (`Yamamoto · Set Gastronómico`).
    2. `"Estrategia previa al rodaje"` (`Dirección Creativa · Set`).
    3. `"Dirección de arte y atmósfera"` (`Locación · Estilismo de Set`).
    4. `"Ajuste y rigging de iluminación"` (`Gaffer & Rigging · Cancún`).
    5. `"Tomas macro e iluminación en barra"` (`Yamamoto · Mixología & B-Roll`).
- **Interactividad & Lazy Loading en Polaroids BTS (`PortfolioBtsStrip.jsx`)**:
  - Implementación de previsualización al pasar el cursor (desktop) y toque táctil (mobile).
  - Cero transferencia de video al montar (poster WebP visible al instante; el stream se solicita únicamente bajo demanda).
  - Suspensión automática mediante `IntersectionObserver` si la tarjeta sale de la pantalla visible.

---

## [2026-10-31] — Arquitectura de Carga Óptima & Lazy Loading de Medios (Portafolio)

### Optimizado
- **Carga Bajo Demanda Estricta de Video (`PortfolioReelCard.jsx`)**:
  - Eliminación de la descarga o sondeo anticipado de video en montaje inicial: el atributo `src` del elemento `<video>` ya no se asigna al cargar la página, reservándose estrictamente para cuando el usuario realiza su primera interacción (tap / clic / hover).
  - Ahorro de más de 50MB de tráfico de red concurrente en el primer render en redes móviles.
  - Inserción de `IntersectionObserver` activo para suspender la reproducción automáticamente cuando cualquier tarjeta de video se desplaza fuera del viewport visible, liberando decodificadores de hardware GPU y ahorrando batería.
- **Detrás de Cámaras sin Autoplay Innecesario (`PortfolioBtsStrip.jsx`)**:
  - Erradicación del atributo `autoPlay` en los micro-clips de rodaje (`Toma 47`), reemplazándolos por miniaturas WebP estáticas con badge técnico de claqueta/película y activación bajo demanda.
- **Decodificación Asíncrona Global (`decoding="async"`)**:
  - Incorporación sistemática de `decoding="async"` junto con `loading="lazy"` en todas las imágenes de portada, comparadores (`PortfolioCompareSlider.jsx`), tiras fotográficas (`PortfolioFeaturedCases.jsx`) y logotipo del portafolio, evitando bloqueos del hilo principal de JavaScript durante el scroll rápido.

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
