# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-11  
**Fase actual:** Pantalla de Inicio y Agenda Diaria ("Qué Toca Hoy" - Mission Control).

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Pantalla de Inicio & Agenda Diaria ("Qué Toca Hoy") (`src/components/dashboard/home/`) — [100% COMPLETADO]**:
   - Se implementó la nueva vista principal `Inicio`, configurada como la primera pestaña y abierta por defecto al entrar a `/dashboard`.
   - **Navegador de Fechas (`HomeDateNavigator.jsx`)**: Botones rápidos (*Ayer*, *Hoy*, *Mañana*), selector nativo de fecha, avance/retroceso y recarga.
   - **Métricas del Día (`HomeDayMetrics.jsx`)**: Indicadores clave de publicaciones del día (listas vs en edición), rodajes agendados y marcas activas.
   - **Agenda de Publicaciones (`HomePostsAgenda.jsx`)**: Listado cronológico de posts programados para la fecha seleccionada con hora, formato (Reel/Carrusel/Historia), cliente, estado visual y clic directo para previsualizar/editar.
   - **Agenda de Rodajes (`HomeProductionsAgenda.jsx`)**: Listado cronológico de sesiones de filmación con horario, locación, tipo de sesión, estado y avance del checklist de requerimientos, con apertura directa de la ficha logística.
   - **Servicio Asíncrono Puro (`homeService.js`)**: Consultas enriquecidas con joins a `posts`, `producciones`, `calendarios` y `clientes`.
2. **Corrección de `calendario_id es requerido` (`PostModal.jsx` y `ScheduledPostsList.jsx`) — [100% COMPLETADO]**:
   - `PostModal` ahora envía `id: initialData?.id`, `calendario_id` y `archivosAnteriores`, permitiendo guardar publicaciones sin que se intenten crear duplicados.
3. **Blindaje Total de Cajas Pendientes de Medios (`ScheduledPostsList.jsx` y `ScheduledPostsFilterBar.jsx`) — [100% COMPLETADO]**:
   - En modo `showOnlyDrafts`, retorna directamente `!firstFile`, permitiendo que publicaciones con copy importado desde Word se visualicen y sincronicen en tiempo real con la galería.
4. **Subida Directa a Cloudflare R2 sin Límite 413 (`calendarService.js` y `r2Service.js`) — [100% COMPLETADO]**:
   - Transmisión directa mediante URLs prefirmadas `PUT` a R2 y renovación proactiva de tokens JWT de Supabase.

---

## ✅ Resuelto Recientemente

1. **Pantalla de Inicio y Agenda Diaria — [COMPLETADO]**:
   - `homeService.js` (214 líneas).
   - `HomeDateNavigator.jsx` (154 líneas).
   - `HomeDayMetrics.jsx` (104 líneas).
   - `HomePostsAgenda.jsx` (168 líneas).
   - `HomeProductionsAgenda.jsx` (179 líneas).
   - `HomeTabSection.jsx` (148 líneas).
   - `DashboardTabs.jsx` (92 líneas).
   - `Dashboard.jsx` (198 líneas).
2. **Corrección de Actualización de Post — [COMPLETADO]**:
   - `PostModal.jsx` (252 líneas).
   - `ScheduledPostsList.jsx` (382 líneas).
3. **Sincronización Reactiva y Blindaje de Cajas — [COMPLETADO]**:
   - `ScheduledPostsFilterBar.jsx` (218 líneas).
   - `ClientsCalendarSection.jsx` (231 líneas).

---

## ⏳ Próximos Pasos Inmediatos

- Desplegar la actualización a GitHub/Vercel (`git push origin main`).
- Recargar el Dashboard para ver la nueva pantalla de **Inicio** como portada principal.
