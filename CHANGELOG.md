# Historial de Cambios — The Formulab (CHANGELOG.md)

Todos los cambios notables, decisiones de arquitectura y soluciones implementadas en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y cumple con la **Regla 2** de `GEMINI.md`.

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
