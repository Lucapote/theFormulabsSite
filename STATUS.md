# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-04  
**Fase actual:** Cumplimiento Maestro de GEMINI.md & Estabilidad de Carruseles en Calendarios.

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Corrección del Bloqueo en Carruseles (`MediaCarousel.jsx`) — [RESUELTO]**:
   - Se diagnosticó y corrigió el bug capturado en el video donde el carrusel de posts (p. ej. en el calendario público de Yamamoto) no permitía retroceder a la primera imagen (`1/4`) una vez avanzado a `2/4`.
   - Se erradicó la condición de carrera con un flag programático (`isProgrammaticScroll`) y se habilitó el scroll a `0` en la sincronización reactiva de índices.
2. **Material Real en Toma 47 (Detrás de Cámaras) — [RESUELTO]**:
   - Integrados los 5 videos reales de `/portfolio/toma47/` con carátulas WebP optimizadas y descripciones técnicas de laboratorio.
   - Eliminados todos los archivos redundantes `.jpg`.

---

## ✅ Resuelto Recientemente

1. **Bugfix de Navegación en Carruseles (`MediaCarousel.jsx`) — [COMPLETADO]**:
   - Navegación bidireccional suave y precisa entre diapositivas (adelante y atrás) tanto con flechas como con puntos y gestos táctiles.
2. **Material Real en Toma 47 (Detrás de Cámaras) — [COMPLETADO]**:
   - Sustitución por los 5 videos de `/portfolio/toma47/` con carátulas WebP y descripciones técnicas de laboratorio.
3. **Carga Óptima & Lazy Loading de Medios — [COMPLETADO]**:
   - Carga bajo demanda estricta de videos en `PortfolioReelCard.jsx` y `PortfolioBtsStrip.jsx`.
   - Implementación de `IntersectionObserver` para auto-pausa fuera de viewport.
   - Decodificación asíncrona (`decoding="async"`) en todas las imágenes y comparadores.

---

## ⏳ Próximos Pasos Disponibles

- Comprobación en navegador por parte del usuario del funcionamiento del carrusel en el calendario de Yamamoto (`/yamamoto/octubre-2026`).
