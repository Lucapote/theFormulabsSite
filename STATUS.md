# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-07  
**Fase actual:** Intercepción del Botón Atrás en Móviles (Pila LIFO) y Persistencia de Pestañas en Dashboard.

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Intercepción del Botón Atrás en Celulares (`useModalHistoryBack.js`) — [100% COMPLETADO]**:
   - **Gestión LIFO de Modales**: Se implementó una pila global en memoria de callbacks de cierre combinada con `window.history.pushState` al abrir cualquier modal.
   - Al presionar el botón físico o gesto de "Atrás" en móviles (Android/iOS), el navegador ya no abandona el Dashboard ni redirige al login: intercepta el `popstate` y **cierra el modal superior** suavemente.
   - Si existen modales anidados (ej. diálogo de confirmación sobre un modal), el primer toque de Atrás cierra el diálogo superior y el segundo toque cierra el modal base.
   - **Cierre por UI Silencioso**: Si el usuario cierra el modal mediante la "X", "Cancelar" o clic en el backdrop, el hook ejecuta un `history.back()` programático marcado, limpiando la entrada sintética sin disparar eventos redundantes.
   - **Integración Universal en `BaseFormModal.jsx`**: Protege de forma automática a más del 90% de los modales de la plataforma sin duplicar lógica en cada vista.
   - **Integración en Visor de Medios (`InstagramPostPreviewModal.jsx`)**: El lightbox de publicaciones y el visor de stories también se cierran suavemente con el botón Atrás.
2. **Eliminación de la Pantalla de Login del Historial (`Login.jsx`) — [100% COMPLETADO]**:
   - Al iniciar sesión exitosamente, se utiliza `navigate("/dashboard", { replace: true })`, eliminando `/login` de la pila de historial del navegador para que nunca se vuelva a ella por retroceso.
3. **Persistencia de Pestaña Activa en URL (`Dashboard.jsx`) — [100% COMPLETADO]**:
   - Sincronización bidireccional mediante `useSearchParams` (`?tab=operaciones`, `?tab=calendars`, `?tab=proposals`, `?tab=diagnostics`) usando `{ replace: true }`.
   - Permite que el usuario permanezca exactamente en la pestaña donde estaba tras recargar la página o navegar con el botón Atrás.

---

## ✅ Resuelto Recientemente

1. **Intercepción Móvil de Botón Atrás y Pestañas en Dashboard — [COMPLETADO]**:
   - `useModalHistoryBack.js` (96 líneas).
   - `BaseFormModal.jsx` (208 líneas).
   - `InstagramPostPreviewModal.jsx` (207 líneas).
   - `Login.jsx` (123 líneas).
   - `Dashboard.jsx` (194 líneas).
2. **Flujo de Creación de Calendarios por Cliente — [COMPLETADO]**:
   - `ClientsCalendarHeaderCard.jsx` (53 líneas): Sin botón de nuevo calendario en cabecera superior.
   - `ClientsCalendarSection.jsx` (231 líneas): Props depuradas sin parámetros huérfanos.
   - `ClientCalendarsGrid.jsx` (235 líneas): Invocación segura sin paso de eventos del DOM.
   - `useClientsCalendarManager.js`: Validación `isClientObject` con protección defensiva.
2. **Paquete de Historias de Instagram (Stories Pack) — [COMPLETADO]**:
   - `getPostFormatMeta` en `postStatusHelpers.js`.
   - `PostModalScheduleFields.jsx` (135 líneas) y `PostModal.jsx` (250 líneas).
   - `InstagramStoryViewerModal.jsx` (239 líneas) y `StoryInstructionsDrawer.jsx` (161 líneas).
   - `InstagramPostPreviewModal.jsx` (204 líneas).
   - `CalendarDesktopGrid.jsx` (219 líneas) y `CalendarMobileView.jsx` (246 líneas).
   - `PostCardItem.jsx` (240 líneas) y `PostCardItemActions.jsx` (134 líneas).
   - `api/cron-publish.js` y `api/publish-now.js` con exclusión segura de historias.
2. **Modularización Progresiva de Componentes Extensos (Opción B — Sprint 1) — [COMPLETADO]**:
   - `NotificationCenterPopover.jsx` (200 líneas).
   - `FinanceCostModal.jsx` (222 líneas).
   - `CreateClientModal.jsx` (115 líneas).
   - `PostCopyBottomSheet.jsx` (248 líneas).
3. **Arquitectura de 2 Columnas en Tarjetas de Ciclo — [COMPLETADO]**:
   - `OperationsCycleCard.jsx` (149 líneas) ensambla el layout 4/8 con Columna 1 de Administración/Finanzas y Columna 2 de Mission Control Rodajes.
4. **Spotlight Próximo Rodaje & Requerimientos de Producción — [COMPLETADO]**:
   - Borde rosa 2px (`border-2 border-[#ef18d6]`), cuadro multilínea en checklist con auto-limpieza de viñetas y flujo de 3 pasos en auto-reserva.

---

## ⏳ Próximos Pasos Disponibles

- Recargar el navegador para disfrutar del nuevo botón de **Historias (Pack)** en el modal de publicaciones y del simulador interactivo de Instagram Stories en el calendario y vista previa.
- Ejecutar la migración SQL `20261106_requerimientos_produccion_checklist.sql` en Supabase para persistir permanentemente los requerimientos si aún no se aplicó.
