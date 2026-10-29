# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-10-27  
**Fase actual:** Cumplimiento y estandarización integral de `GEMINI.md` (Punto por punto).

---

## 📸 Foto de Hoy (Contexto Operativo)

Estamos ejecutando la auditoría y adecuación sistemática del proyecto para alinearlo con las directrices de `GEMINI.md` y `DESIGN.md`. La plataforma cuenta con backend en Supabase, Cloudflare R2, integraciones con Meta API y un frontend en React + Tailwind + Vite.

---

## ✅ Resuelto Recientemente

1. **Estados de Publicación y Flujo de Feedback**:
   - Integración de los 6 estados oficiales: `sin_empezar` (rojo), `en_edicion` (amarillo), `en_aprobacion` (morado), `aprobado` (verde), `programado` (azul), `publicado` (magenta `#ef18d6`).
   - El estado `publicado` fue agregado a contratos en `postStatusHelpers.js`, `PostModal.jsx`, `ScheduledPostsList.jsx`, `PostCardItem.jsx` y `CalendarDesktopGrid.jsx`.
   - Modificación de la RPC `aprobar_post_publico` y servicio `updatePost` para limpiar automáticamente `notas_cambios` y `fecha_cambios` al aprobar o programar.
   - En `PostModal.jsx`, el aviso de observaciones del cliente solo se muestra si el estado es `en_edicion` e incluye botón "Descartar".

2. **UX de Calendario y Notificaciones**:
   - Rediseño de la barra de filtros en `ScheduledPostsFilterBar.jsx`: reemplazo de 8 botones horizontales por 2 `<Select>` tipo píldora (`Estado` y `Formato`) con botón de restablecer.
   - En `PostCardItem.jsx`: el clic en el cuerpo de la tarjeta abre directamente el modal de edición (`PostModal`); el clic en miniatura o botón con icono `Eye` abre la previsualización.
   - En `NotificationCenterPopover.jsx`: navegación directa al calendario específico y dinámico (`Abrir Octubre 2026 →`) enlazado con `ClientsCalendarSection.jsx`.
   - En previsualización (`PostCopyBottomSheet.jsx`): modo administrativo (`isInternal = true`) muestra "Esperando validación del cliente" y oculta botones de aprobación del cliente.

3. **Alineación Tipográfica (DESIGN.md)**:
   - Configuración de alias nativos `sans`, `inter`, `body`, `sora`, `display`, `mono` en `tailwind.config.js`.
   - Incorporación de tokens semánticos de escala (`display`, `h1`, `h2`, `h3`).
   - Carga no bloqueante de fuentes en `index.html` con `preconnect` hacia Google Fonts y eliminación de `@import` bloqueante en `index.css`.
   - Reemplazo de clases residuales `font-sans` por `font-inter` en `ProposalView.jsx` y `ProposalLabPdfReport.jsx`.

4. **Sistema de Memoria y Continuidad (Regla 2)**:
   - Inclusión de `GEMINI.md` en la raíz del repositorio.
   - Creación de `STATUS.md` (este archivo).
   - Creación de `CHANGELOG.md` con el registro acumulativo.

---

## ⏳ Tareas Inmediatas en Curso (Punto por Punto)

### [ ] Punto 2: Estandarización de Modales en `BaseFormModal` (Regla 3.3)
- Migrar `PendingReceiptsReviewModal.jsx` a `BaseFormModal`.
- Migrar `ProposalOnboardingDialog.jsx` a `BaseFormModal`.
- Migrar `ProposalActivationModal.jsx` a `BaseFormModal`.
- Eliminar duplicación de `src/components/dashboard/common/ConfirmDeleteModal.jsx` consolidando en `src/components/common/ConfirmDeleteModal.jsx`.

### [ ] Punto 3: Modularización y Límite de Líneas (Reglas 4.B y 5)
- Desacoplar páginas que exceden 200 líneas:
  - `src/pages/Dashboard.jsx` (481 líneas) → Extraer submódulos.
  - `src/pages/PublicCalendarPage.jsx` (276 líneas).
  - `src/pages/ProductionBookingPage.jsx` (232 líneas).
- Subdividir componentes monolíticos de más de 350 líneas (`MediaFramingModal.jsx`, `ClientsCalendarSection.jsx`, `PostModal.jsx`).

### [ ] Punto 4: Eliminación de Estilos Inline Residuales (Regla 3)
- Migrar los 10 archivos con `style={{ ... }}` a clases utilitarias de Tailwind o variables CSS limpias (especialmente en `TestTube.jsx` y secciones de landing).

### [ ] Punto 5: UX Responsive (Mobile & Desktop)
- UX móvil del calendario público: clic en día con publicaciones solo actualiza la selección superior sin abrir modal forzado.
- Viewport laptop/desktop: eliminar scroll vertical innecesario para ajustar el calendario al 100vh.
