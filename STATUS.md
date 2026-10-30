# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-10-30  
**Fase actual:** Despliegue de Pantalla "En Preparación" en Raíz ('/') & Limpieza de Landing Anterior.

---

## 📸 Foto de Hoy (Contexto Operativo)

Se ha optimizado la barra de navegación del Portafolio y la estructura modular de carpetas:
- **Navbar Limpio y Minimalista (`PortfolioNavbar.jsx`)**:
  - Se eliminaron todos los textos intermedios (`Reels`, `Casos`, etc.) y el menú hamburguesa móvil.
  - La barra ahora contiene **exclusivamente el logotipo oficial a la izquierda y el botón magenta "Solicitar diagnóstico" a la derecha** (`Link to="/diagnostico"`).
- **Arquitectura de Carpetas Refactorizada**:
  - Al no ser de uso transversal en todo el SaaS, `Navbar` y `Footer` fueron trasladados desde `src/components/common/nav/` a su dominio exclusivo: `src/components/portfolio/` (`PortfolioNavbar.jsx` y `PortfolioFooter.jsx`).
  - Se eliminó el directorio huérfano `src/components/common/nav/`, manteniendo `src/components/common/` únicamente para primitivas y componentes realmente compartidos (`TestTube`, modales base, carruseles).
- **Pantalla Raíz ("En Preparación")**: Mantiene su micro-interacción con el tubo reactivo de 390px, shake físico elástico y cero scroll.

---

## ✅ Resuelto Recientemente

1. **Inversión de Columnas para Ramos Joyería — [COMPLETADO]**:
   - Bandera declarativa `reverseLayout: true` en `case-ramos` (`portfolioData.js`).
   - Clases dinámicas `lg:order-1` y `lg:order-2` en `PortfolioFeaturedCases.jsx` (211 líneas).
   - Comportamiento sticky impecable en la columna derecha.

2. **Activación de Sticky Nativo — [COMPLETADO]**:
   - Retirado `overflow-hidden` de la sección contenedora y encapsulado en capa absoluta.
   - Alineación inicial en píxel 0 (`items-start` + `self-start`) y frenado automático en el borde inferior.

3. **Portafolio Oficial de Reels (.jsx) — [COMPLETADO]**:
   - `PortfolioPage.jsx` modularizada con 51 líneas.
   - Enlace oficial en Navbar y Footer.

---

## ⏳ Próximos Pasos Disponibles

- Recibir nuevos videos o casos de estudio para anexar al catálogo de `public/portfolio`.
- Pruebas adicionales en dispositivos físicos según requerimientos del cliente.
