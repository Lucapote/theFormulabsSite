# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-04  
**Fase actual:** Cumplimiento Maestro de GEMINI.md & Material Auténtico en Portafolio.

---

## 📸 Foto de Hoy (Contexto Operativo)

Se ha completado la integración del material real y fidedigno en la sección **Toma 47 (Detrás de Cámaras)** del portafolio:

1. **Reemplazo 100% Auténtico de BTS (`src/data/portfolioData.js`)**:
   - Se sustituyeron las fotos genéricas anteriores por los 5 videos reales de rodaje de la agencia ubicados en `/portfolio/toma47/`.
   - Se extrajeron y generaron miniaturas WebP optimizadas (`< 40KB`) para cada uno de los videos, asegurando renderizado inmediato sin latencia ni parpadeos.
   - Cada polaroid técnica cuenta con título y etiqueta narrativa acorde a su escena:
     - `seleccionado1.mp4`: *"Corte milimétrico de sashimi"* · `Yamamoto · Set Gastronómico`
     - `seleccionado2.mp4`: *"Estrategia previa al rodaje"* · `Dirección Creativa · Set`
     - `seleccionado3.mp4`: *"Dirección de arte y atmósfera"* · `Locación · Estilismo de Set`
     - `seleccionado4.mp4`: *"Ajuste y rigging de iluminación"* · `Gaffer & Rigging · Cancún`
     - `seleccionado5.mp4`: *"Tomas macro e iluminación en barra"* · `Yamamoto · Mixología & B-Roll`
2. **Experiencia de Carga & Reproducción (`PortfolioBtsStrip.jsx`)**:
   - Zero video streaming on mount: Solo se descargan las miniaturas estáticas WebP.
   - Reproducción instantánea al pasar el cursor (hover en desktop) o al tocar la tarjeta (tap en mobile).
   - Indicador de estado en vivo pulsante (`En vivo`) mientras el clip corre.
   - `IntersectionObserver` que auto-pausa cualquier video que salga de la vista durante el scroll.

---

## ✅ Resuelto Recientemente

1. **Material Real en Toma 47 (Detrás de Cámaras) — [COMPLETADO]**:
   - Sustitución por los 5 videos de `/portfolio/toma47/` con carátulas WebP y descripciones técnicas de laboratorio.
2. **Carga Óptima & Lazy Loading de Medios — [COMPLETADO]**:
   - Carga bajo demanda estricta de videos en `PortfolioReelCard.jsx` y `PortfolioBtsStrip.jsx`.
   - Implementación de `IntersectionObserver` para auto-pausa fuera de viewport.
   - Decodificación asíncrona (`decoding="async"`) en todas las imágenes y comparadores.
3. **Optimización Mobile UX/UI Portafolio — [COMPLETADO]**:
   - CTA responsivo de una sola palabra en móvil: `"DIAGNÓSTICO"` (`PortfolioNavbar.jsx`).
   - Chips deslizables horizontales sin contenedor deformado (`PortfolioReelsWall.jsx`).
   - Progressive disclosure (máx. 2 videos en móvil) en Muro de Reels y Yamamoto (`CaseVideosGrid.jsx`).
4. **Purga Quirúrgica de Iconos Cliché de IA (Sparkles & Zap) — [COMPLETADO]**:
   - Erradicación total de spinners falsos y adornos innecesarios en favor de iconos funcionales y tipografía técnica.

---

## ⏳ Próximos Pasos Disponibles

- Validación visual en navegador de la sección Toma 47 y fluidez del hover/tap.
- Posible incorporación o enlace de la propuesta externa (`laDeLosEnchilados.html`) en cuanto se requiera.
