# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-12  
**Fase actual:** Exclusión y filtrado de medios en uso en PostModal (Archivos en working tree, sin commit/push por solicitud del usuario).

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Exclusión y Filtrado de Medios en Uso en PostModal (`PostModal.jsx`, `PostModalMediaGalleryPicker.jsx`, `PostModalCaptionField.jsx`) — [100% IMPLEMENTADO EN LOCAL]**:
   - **Exclusión total en creación**: Al programar un post nuevo o asignar medios a una caja vacía, los archivos en uso (tanto videos como imágenes) quedan 100% ocultos del selector de medios de galería.
   - **Conservación inteligente en edición**: Al editar una publicación existente, los archivos que ya le pertenecen se muestran seleccionados (Check 1, 2, 3...) mientras que los archivos en uso por otras publicaciones se ocultan de inmediato.
   - **Contador y feedback transparente**: La cabecera refleja con precisión los medios disponibles reales (ej. `0 asignados / 3 disponibles`) y muestra un badge informativo `X en uso ocultos`.
   - **Arquitectura y modularización**: Se extrajo `PostModalCaptionField.jsx` (37 líneas) manteniendo a `PostModal.jsx` estrictamente en 244 líneas ($\le 250$).
   - **Optimización de red**: `ScheduledPostsList.jsx` y `MediaGallery.jsx` suministran `existingPosts={posts}` evitando peticiones redundantes.
2. **Balance de Alturas y Estados Vacíos Compactos en Agenda (`HomePostsAgenda.jsx`, `HomeProductionsAgenda.jsx` y `HomeTabSection.jsx`) — [100% COMPLETADO]**:
   - Estados vacíos reducidos a `py-6 sm:py-8` con icono de 40px y botón de 32px.
   - Tarjetas de publicaciones enriquecidas con badge Instagram, horario mono, miniatura y botones de previsualización y edición.
   - Cuadrícula con `items-stretch` y `min-h-[290px]`, eliminando escalones verticales.
3. **Tarjeta y Tira Desplegable "En Esta Semana" (`HomeDayMetrics.jsx` y `HomeWeekStrip.jsx`) — [100% COMPLETADO]**:
   - 3ra tarjeta superior "EN ESTA SEMANA" con total de actividades y botón de toggle.
   - Tira de 7 días interactiva con actualización instantánea de agenda al pulsar cualquier día.

---

## ✅ Resuelto Recientemente

1. **Exclusión de Medios en Uso en PostModal — [COMPLETADO EN LOCAL]**:
   - `PostModal.jsx` (244 líneas).
   - `PostModalMediaGalleryPicker.jsx` (137 líneas).
   - `PostModalCaptionField.jsx` (37 líneas).
   - `ScheduledPostsList.jsx` (392 líneas).
   - `MediaGallery.jsx` (261 líneas).
2. **Balance de Alturas y Estados Vacíos Compactos — [COMPLETADO]**:
   - `HomePostsAgenda.jsx` (189 líneas).
   - `HomeProductionsAgenda.jsx` (176 líneas).
   - `HomeTabSection.jsx` (179 líneas).
