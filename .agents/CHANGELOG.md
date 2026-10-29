# Historial de Cambios — The Formulab (CHANGELOG.md)

Todos los cambios notables, decisiones de arquitectura y soluciones implementadas en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y cumple con la **Regla 2** de `GEMINI.md`.

---

## [2026-10-27] — Memoria de IA, Estandarización Tipográfica y Resolución de Feedback

### Agregado
- **Sistema de Continuidad (Regla 2)**:
  - Copia de `GEMINI.md` en la raíz del repositorio Git.
  - Creación de `STATUS.md` para seguimiento en tiempo real del estado de trabajo.
  - Creación de `CHANGELOG.md` para registro acumulativo de decisiones.
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
- **Navegación Dinámica en Notificaciones**:
  - En `NotificationCenterPopover.jsx`: el botón de acción ahora muestra el nombre exacto del calendario (`Abrir Octubre 2026 →`) y navega directamente seleccionando cliente y calendario en `ClientsCalendarSection.jsx` a través de props de `Dashboard.jsx`.
- **UX de Filtros en Calendario**:
  - Reemplazados los 8 botones horizontales que se desbordaban en `ScheduledPostsFilterBar.jsx` por dos dropdowns compactos (`Estado` y `Formato`) con botón de restablecimiento.
- **Interacción de Tarjetas de Post**:
  - En `PostCardItem.jsx`: el clic en cualquier parte de la tarjeta abre `PostModal` para editar; el clic en miniatura o botón `Eye` abre la previsualización.
- **Previsualización Admin vs Cliente**:
  - En `PostCopyBottomSheet.jsx`: cuando se visualiza desde el dashboard administrativo (`isInternal = true`), se ocultan los botones de aprobación de clientes y se muestra el indicador `● Esperando validación del cliente`.
- **Eliminación de Clases Residuales**:
  - Reemplazada la clase genérica `font-sans` por `font-inter` en `ProposalView.jsx` y `ProposalLabPdfReport.jsx`.
  - Eliminado el `@import url(...)` bloqueante en `src/index.css`.

---

## [2026-10-26] — Contratos de Publicación y Protocolos de Rodaje

### Agregado
- **6 Estados Oficiales de Publicación**:
  - `sin_empezar` (Rojo), `en_edicion` (Amarillo), `en_aprobacion` (Morado), `aprobado` (Verde), `programado` (Azul), `publicado` (Magenta).
  - Regla de validación: `sin_empezar` y `en_edicion` permiten guardarse sin archivos adjuntos; `en_aprobacion`, `aprobado`, `programado` y `publicado` exigen obligatoriamente archivos asignados de la galería.
- **Sidepanel de Contexto y Protocolos SLA en Booking**:
  - Integración de `BookingSideContextPanel.jsx` en `ProductionBookingPage.jsx`.
  - Fondo rosa claro con textos magenta (`text-brand-magenta`), iconos contrastados y tipografía unificada `font-sora` / `font-inter`.

---

## [2026-10-25] — Auditoría de Seguridad Zero Trust e Integración Meta

### Agregado
- Verificación estricta de JWT en endpoints serverless `/api/*` (`r2-presigned-url.js`, `publish-now.js`, `upload-r2.js`).
- Encabezados de seguridad HTTP en `vercel.json` (`X-Frame-Options: DENY`, `Strict-Transport-Security`, etc.).
- Sanitización de `.env.example`.
