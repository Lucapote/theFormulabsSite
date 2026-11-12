# Historial de Cambios — The Formulab (CHANGELOG.md)

Todos los cambios notables, decisiones de arquitectura y soluciones implementadas en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y cumple con la **Regla 2** de `GEMINI.md`.

---

## [2026-11-12] — Exclusión de Medios en Uso en el Modal de Publicación

### Agregado
- **Subcomponente Modular de Texto (`PostModalCaptionField.jsx`)**:
  - Extraído de `PostModal.jsx` para mantener el modal estrictamente en 244 líneas ($\le 250$). Encapsula el campo multilínea de caption e instrucciones de historia.

### Modificado
- **Exclusión de Medios en Uso (`PostModal.jsx`)**:
  - Implementación del cálculo `availableGalleryFiles` con doble verificación: evalúa si el archivo multimedia está presente en cualquier otra publicación de `existingPosts` o tiene la bandera `en_uso` en la base de datos.
  - Al crear un post nuevo, se ocultan al 100% los archivos comprometidos (tanto videos como imágenes).
  - Al editar un post existente, se mantienen los archivos propios ya asignados a este post (apareciendo seleccionados) y se ocultan los de los demás posts.
- **Transparencia en Selector de Medios (`PostModalMediaGalleryPicker.jsx`)**:
  - Encabezado con contador real de disponibles y badge informativo `X en uso ocultos`.
  - Mensaje de estado vacío explicativo cuando todos los medios compatibles están en uso en otras publicaciones.
- **Suministro Reactivo de Posts (`ScheduledPostsList.jsx` y `MediaGallery.jsx`)**:
  - Envío de `existingPosts={posts}` a `<PostModal>` para resolver el filtro de disponibilidad de forma síncrona sin latencia de red.

---

## [2026-11-11] — Balance de Alturas y Estados Vacíos Compactos en Agenda de Inicio

### Modificado
- **Estados Vacíos Compactos (`HomePostsAgenda.jsx` y `HomeProductionsAgenda.jsx`)**:
  - Reducción del padding de `py-12` a `py-6 sm:py-8`.
  - Iconos de 40px (`w-10 h-10`) con estilo sobrio de laboratorio.
  - Textos descriptivos sintetizados en una línea para evitar dominancia visual vacía.
  - Botones CTA de 32px de altura (`h-8 px-4 text-xs`).
- **Tarjetas de Publicación Enriquecidas y Proporcionadas (`HomePostsAgenda.jsx`)**:
  - Aumento de padding a `p-4 sm:p-5` con bordes redondeados `rounded-2xl`.
  - Badges de plataforma (*Instagram* en púrpura suave) y hora en tipografía mono.
  - Miniatura ampliada a 16x16 / 20x20 con indicador de video centrado.
  - Extracto de copy de 2 a 3 líneas con tipografía nítida `leading-relaxed`.
  - Botones de acción visibles: "Ver Vista Previa" y "Editar".
- **Equilibrio Simétrico en Columnas (`HomeTabSection.jsx`)**:
  - Cuadrícula con `items-stretch` y contenedores con `h-full min-h-[290px] sm:min-h-[310px] flex flex-col justify-between`.
  - Eliminación del desnivel visual asimétrico cuando una columna tiene elementos y la otra está vacía.
  - Integración de `InstagramPostPreviewModal` al hacer clic en "Ver Vista Previa".

---

## [2026-11-11] — Tarjeta y Tira Desplegable "En Esta Semana" en Inicio

### Agregado
- **Tira Semanal Desplegable de 7 Días (`HomeWeekStrip.jsx`)**:
  - Cuadrícula responsive de Lunes a Domingo que desglosa la cantidad de publicaciones y rodajes para cada día.
  - Resaltado visual del día seleccionado y badge de "Hoy".
  - Navegación al instante: hacer clic en cualquier día cambia de inmediato la agenda inferior a esa fecha.
- **Función de Rango Semanal en Servicio (`homeService.js`)**:
  - `getWeekAgendaSummary`: Calcula dinámicamente Lunes y Domingo de la semana y consulta de forma atómica en Supabase los posts y producciones en rango, agregando los totales de actividades.

### Modificado
- **Tarjeta Métrica "En Esta Semana" (`HomeDayMetrics.jsx`)**:
  - Sustitución de la 3ra tarjeta superior por "EN ESTA SEMANA", mostrando el total de actividades acumuladas de los 7 días y botón de toggle interactivo.
- **Orquestador de Inicio (`HomeTabSection.jsx`)**:
  - Integración del estado `isWeekOpen` y renderizado de `HomeWeekStrip` entre las métricas y la agenda (173 líneas, $\le 200$).

---

## [2026-11-11] — Pantalla de Inicio y Agenda Diaria ("Qué Toca Hoy")

### Agregado
- **Módulo de Inicio en Dashboard (`src/components/dashboard/home/`)**:
  - `HomeTabSection.jsx`: Orquestador principal de la agenda diaria ($\le 150$ líneas).
  - `HomeDateNavigator.jsx`: Barra de control de fecha con accesos rápidos (*Ayer*, *Hoy*, *Mañana*), selector nativo de fecha, avance/retroceso por día y botón de recarga.
  - `HomeDayMetrics.jsx`: Indicadores KPI con publicaciones del día (listas vs en proceso), rodajes programados y marcas activas hoy.
  - `HomePostsAgenda.jsx`: Columna cronológica de publicaciones del día con hora, cliente, formato (Reel, Carrusel, Historia), estado visual y apertura de modal de edición/previsualización al hacer clic.
  - `HomeProductionsAgenda.jsx`: Columna cronológica de rodajes del día con horario de filmación, cliente, locación, tipo de sesión, estado y conteo de requerimientos de producción, con apertura directa de la ficha de logística al hacer clic.
- **Servicio Asíncrono de Agenda Diaria (`src/services/homeService.js`)**:
  - `getDayScheduledPosts`: Obtiene publicaciones de la fecha con joins enriquecidos hacia calendarios y clientes.
  - `getDayProductions`: Obtiene sesiones de rodaje de la fecha vinculadas con clientes y ciclos.
  - `getDayAgendaSummary`: Consolida posts, rodajes y métricas consolidadas en una sola llamada paralela.

### Modificado
- **Pestaña por Defecto en Dashboard (`Dashboard.jsx` y `DashboardTabs.jsx`)**:
  - Se agregó la pestaña **"Inicio"** como la primera opción en la barra superior con icono `Home`.
  - Se configuró `"inicio"` como la pestaña inicial por defecto al ingresar a `/dashboard`.
  - Mantiene estricto cumplimiento de $\le 200$ líneas en `Dashboard.jsx` (198 líneas).

---

## [2026-11-11] — Corrección de `calendario_id es requerido` al Actualizar Publicaciones

### Corregido
- **Persistencia de `id` y `calendario_id` al Guardar Post (`PostModal.jsx`)**:
  - Al enviar el formulario de edición de publicación, `PostModal` no incluía `id: initialData?.id` ni `calendario_id` en el objeto `payload`.
  - Esto causaba que `ScheduledPostsList.jsx` interpretara la edición como una creación de nuevo post (`!formData.id`) y llamara a `createPost` sin `calendario_id`, arrojando el error `calendario_id es requerido`.
  - Se incluyeron explícitamente `id`, `calendario_id` y `archivosAnteriores` en el payload de `PostModal.jsx` y se agregaron fallbacks defensivos en `handleSavePost` de `ScheduledPostsList.jsx` (`formData.id || editingPost?.id`).

---

## [2026-11-11] — Subida Directa a Cloudflare R2 (Bypass Vercel 413), Refresco de Auth Token (Bypass 401) y Sincronización de Cajas Pendientes de Medios

### Agregado
- **Renovación Proactiva de Sesión JWT (`r2Service.js`)**:
  - Función `getFreshAuthToken()` que inspecciona la caducidad del token Supabase (`expires_at`) y ejecuta `supabase.auth.refreshSession()` si restan menos de 60 segundos antes de vencer.
  - Mecanismo de reintento automático (`retry on 401`) al solicitar URLs prefirmadas en `getR2PresignedUploadUrl`.

### Modificado / Corregido
- **Eliminación del Error 413 (`calendarService.js`)**:
  - Los archivos pesados y videos (`isVideo || size > 4 MB`) ahora se transmiten **directamente desde el navegador hacia Cloudflare R2** mediante URLs prefirmadas `PUT` emitidas por S3 (`uploadBinaryWithProgress`).
  - Se eliminó el reenvío de archivos pesados a través de `/api/upload-r2` en Vercel, eludiendo el tope estructural de 4.5 MB de las funciones serverless.
- **Sincronización de Cajas Pendientes de Medios (`ScheduledPostsList.jsx` y `ScheduledPostsFilterBar.jsx`)**:
  - Corrección de la condición de filtrado: cambió de `!firstFile && !post.caption` a `!firstFile`.
  - Ahora las publicaciones importadas desde Word con copy pero sin imágenes/videos asignados aparecen inmediatamente en *"CAJAS PENDIENTES DE MEDIOS"* en lugar de reportar erróneamente `(0 cajas)`.

---

## [2026-11-07] — Intercepción del Botón Atrás en Móviles (Pila LIFO) y Persistencia de Pestañas en Dashboard

### Agregado
- **Hook de Intercepción Móvil de Historial (`useModalHistoryBack.js`)**:
  - Pila LIFO en memoria combinada con `window.history.pushState` al abrir cualquier modal.
  - Al pulsar el botón físico o gesto de Atrás en dispositivos móviles (Android/iOS), el navegador intercepta el `popstate` y cierra el modal más reciente en vez de navegar fuera de la aplicación o al login.
  - Soporte de cierre ordenado por capas en diálogos superpuestos (ej. confirmación sobre modal).
  - Manejo de cierre programático marcado (`history.back()` silencioso) cuando el usuario pulsa la "X", "Cancelar" o el backdrop.
- **Integración Universal en Modales (`BaseFormModal.jsx` e `InstagramPostPreviewModal.jsx`)**:
  - Cobertura automática para todos los modales administrativos del Dashboard y para el visor full-screen de publicaciones y stories.

### Modificado
- **Eliminación de la Pantalla de Login del Historial (`Login.jsx`)**:
  - Redirección con `navigate("/dashboard", { replace: true })` para sustituir `/login` en el historial del navegador.
- **Persistencia de Pestañas Activas en URL (`Dashboard.jsx`)**:
  - Sincronización bidireccional con `useSearchParams` (`?tab=...`) usando `{ replace: true }`, manteniendo la vista activa tras recargar o navegar.
  - Cumplimiento estricto de límites de código ($\le 200$ líneas en `Dashboard.jsx` y $\le 250$ líneas en componentes).

---

## [2026-11-07] — Corrección del Selector de Clientes en Creación de Calendarios y Limpieza de Cabecera

### Modificado / Corregido
- **Eliminación del Botón Superior "Nuevo Calendario" (`ClientsCalendarHeaderCard.jsx`)**:
  - Se removió el botón redundante de la barra superior para que quede únicamente `[Nuevo Cliente]` y recarga.
- **Corrección de Event Leak en Creación de Calendarios (`ClientCalendarsGrid.jsx` y `useClientsCalendarManager.js`)**:
  - Al pulsar `+ Crear Calendario` o `+ Crear Primer Calendario`, el evento de clic de React (`SyntheticMouseEvent`) se propagaba hacia la función `openNewCalendarModal(clienteOverride)`.
  - Esto provocaba que el estado de `selectedCliente` fuera sobrescrito por un objeto evento que carecía de `id` y `nombre`, mostrando `Cliente: undefined` y arrojando el error `Cliente no seleccionado`.
  - Se corrigió garantizando que solo se invoque `() => onOpenCalendarModal?.(selectedCliente)` y protegiendo el hook `useClientsCalendarManager` mediante una validación estricta `isClientObject` con chequeo de propiedad `id`.
  - Ahora cada cliente seleccionado abre inmediatamente el modal de creación preconfigurado con su nombre, mes, año y slug inteligente.

---

## [2026-11-07] — Paquete de Historias de Instagram (Stories Pack) y Simulador Interactivo

### Agregado
- **Formato Historias (Pack) en Modal de Publicación (`PostModalScheduleFields.jsx`)**:
  - Incorporación del 3er formato de publicación (`Reel (1 Video)`, `Carrusel (Múltiple)`, `Historias (Pack)` con icono de `Smartphone`).
  - Campo de texto dinámico en `PostModal.jsx` que conmuta automáticamente a *"Instrucciones de la Historia / Secuencia"* con placeholder para stickers, enlaces, encuestas y música.
- **Simulador Interactivo de Instagram Stories (`InstagramStoryViewerModal.jsx`)**:
  - Renderizado vertical en proporción exacta 9:16 de dispositivo móvil.
  - Barras segmentadas de progreso superior calculadas en tiempo real ($N$ barras para $N$ diapositivas/historias).
  - Navegación táctil bilateral: toques al 35% izquierdo para retroceder, 65% derecho para avanzar.
  - Interacción táctil de pausa: `onMouseDown` / `onTouchStart` pausa el temporizador de la historia activa.
  - Cajón deslizable de instrucciones (`StoryInstructionsDrawer.jsx`): Permite visualizar el desglose del copywriter, copiar las instrucciones al portapapeles con 1 clic y descargar individualmente cada elemento multimedia.
- **Delegación Unificada en Previsualizador (`InstagramPostPreviewModal.jsx`)**:
  - Detecta automáticamente `tipo_post === "historia"` y delega al simulador de stories, garantizando paridad en el Dashboard administrativo y en el Calendario Público del Cliente.
- **Distinción Visual en Cuadrículas de Calendario**:
  - `CalendarDesktopGrid.jsx`: Anillo gradiente oficial Instagram / The Formulab (`#ef18d6` a `#188ff0`), icono `Smartphone` y contador `Historias (N)`.
  - `CalendarMobileView.jsx`: Miniatura con anillo gradiente y badge en la agenda drawer.
  - `postStatusHelpers.js`: Función `getPostFormatMeta` para normalización de metadatos de formato.
- **Subcomponente Modular de Acciones (`PostCardItemActions.jsx`)**:
  - Extracción atómica de la barra de acciones de la tarjeta para reducir `PostCardItem.jsx` de 321 a 240 líneas ($\le 250$).

### Modificado / Protegido (Publicación Manual de Historias)
- **Aislamiento en Cron y APIs Serverless (`api/cron-publish.js` y `api/publish-now.js`)**:
  - Se añadieron filtros estrictos para ignorar publicaciones con `tipo_post === "historia"`.
  - La API rechaza llamadas de auto-publicación para historias, garantizando que el workflow sea guiado manualmente (dado que Meta Graph API no soporta stickers interactivos ni enlaces nativos).
  - Ocultación automática del botón *"Publicar Ahora"* en la tarjeta de historias.

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
