import { useEffect, useRef } from "react";

/**
 * useWindowFocusRefresh
 * Sincroniza datos automáticamente cuando el usuario vuelve a enfocar la pestaña del navegador
 * (window.onfocus y document.visibilitychange), permitiendo detectar cambios realizados por clientes
 * (auto-reservas, aprobación de propuestas o pagos) sin obligar a un F5 manual.
 *
 * Cumple rigurosamente con GEMINI.md (Secciones 3.G, 8 y 9.C):
 * - Encapsula lógica reactiva pura sin JSX.
 * - Limpia siempre los listeners globales en el cleanup function.
 * - Incluye throttle/cooldown por minIntervalMs para evitar llamadas redundantes en ráfaga.
 *
 * @param {Function} onRefresh - Callback a ejecutar al reactivar la pestaña
 * @param {object} [options]
 * @param {number} [options.minIntervalMs=8000] - Intervalo mínimo de enfriamiento entre refrescos
 * @param {boolean} [options.enabled=true] - Activa o suspende el listener reactivo
 */
export function useWindowFocusRefresh(onRefresh, { minIntervalMs = 8000, enabled = true } = {}) {
  const lastRefreshTimeRef = useRef(Date.now());
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current >= minIntervalMs) {
        lastRefreshTimeRef.current = now;
        if (typeof onRefreshRef.current === "function") {
          onRefreshRef.current();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, minIntervalMs]);
}
