# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-11  
**Fase actual:** Subida Directa a Cloudflare R2 (Bypass Vercel 413), Refresco de Auth Token (Bypass 401) y Sincronización Reactiva de Cajas Pendientes de Medios.

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Corrección de `calendario_id es requerido` (`PostModal.jsx` y `ScheduledPostsList.jsx`) — [100% COMPLETADO]**:
   - Se aseguró que `PostModal` entregue `id: initialData?.id`, `calendario_id: calendarioId || initialData?.calendario_id` y `archivosAnteriores` en el payload.
   - `handleSavePost` en `ScheduledPostsList.jsx` utiliza `formData.id || editingPost?.id`, invocando correctamente `updatePost` en vez de confundirlo con una creación de post (`createPost`).
2. **Blindaje Total de Cajas Pendientes de Medios (`ScheduledPostsList.jsx` y `ScheduledPostsFilterBar.jsx`) — [100% COMPLETADO]**:
   - Se erradicó el filtro restrictivo viejo: ahora en modo `showOnlyDrafts` (bajo la Galería), la lista retorna directamente `!firstFile`, evitando que publicaciones con copywriting importado desde Word queden ocultas en `(0 cajas)`.
   - Textos alineados con la identidad del sistema: *"CAJAS PENDIENTES DE MEDIOS (X cajas)"* y *"No hay cajas pendientes de medios"*.
2. **Sincronización Reactiva en Tiempo Real (`ClientsCalendarSection.jsx` y `ScheduledPostsList.jsx`) — [100% COMPLETADO]**:
   - Se agregó la prop `refreshTrigger = 0` y se pasó `refreshTrigger={galleryRefreshKey}` a la instancia de `ScheduledPostsList`.
   - Se conectó el hook global `useUpload` (`addUploadListener`) en `ScheduledPostsList`: tan pronto como finaliza una subida en segundo plano a ese calendario, la lista de cajas se recarga de inmediato sin requerir recargar la página.
3. **Subida Directa a Cloudflare R2 sin Límite 413 (`calendarService.js`) — [100% COMPLETADO]**:
   - Los videos y archivos mayores a 4 MB se transmiten directamente al bucket R2 mediante URLs prefirmadas `PUT` emitidas por S3 (`uploadBinaryWithProgress`), evitando el límite de 4.5 MB de Vercel.
4. **Refresco Proactivo de Tokens JWT (`r2Service.js`) — [100% COMPLETADO]**:
   - `getFreshAuthToken()` verifica la expiración del token y auto-renueva la sesión Supabase si faltan menos de 60 segundos, reintentando automáticamente en caso de 401.

---

## ✅ Resuelto Recientemente

1. **Sincronización Reactiva y Blindaje de Cajas — [COMPLETADO]**:
   - `ScheduledPostsList.jsx` (380 líneas).
   - `ScheduledPostsFilterBar.jsx` (218 líneas).
   - `ClientsCalendarSection.jsx` (231 líneas).
2. **Subida Directa a R2 y Refresco de Tokens — [COMPLETADO]**:
   - `calendarService.js` (658 líneas).
   - `r2Service.js` (116 líneas).
3. **Intercepción Móvil de Botón Atrás y Pestañas en Dashboard — [COMPLETADO]**:
   - `useModalHistoryBack.js` (96 líneas).
   - `BaseFormModal.jsx` (208 líneas).
   - `InstagramPostPreviewModal.jsx` (207 líneas).
   - `Login.jsx` (123 líneas).
   - `Dashboard.jsx` (194 líneas).

---

## ⏳ Próximos Pasos Inmediatos

- **Subir cambios a Git y desplegar en Vercel**: `git commit` y `git push` para que Vercel compile el nuevo bundle en `https://www.theformulab.io`.
- **Verificar en Producción**: Recargar `https://www.theformulab.io/dashboard?tab=calendars` y confirmar la aparición de las 6 cajas pendientes bajo la galería.
