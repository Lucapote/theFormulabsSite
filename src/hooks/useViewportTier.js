import { useState, useEffect } from "react";

/**
 * Breakpoints estándar de The Formulab:
 * - mobile: < 640px
 * - tablet: 640px - 1023px
 * - laptop: 1024px - 1439px
 * - desktop: >= 1440px
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440
};

function getTier(width) {
  if (width < BREAKPOINTS.sm) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  if (width < BREAKPOINTS["2xl"]) return "laptop";
  return "desktop";
}

/**
 * useViewportTier
 * Hook reactivo para consultar el nivel de pantalla actual (mobile, tablet, laptop, desktop).
 */
export function useViewportTier() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId = null;
    const handleResize = () => {
      // Debounce sutil para optimizar repaints
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tier = getTier(width);

  return {
    tier,
    width,
    isMobile: tier === "mobile",
    isTablet: tier === "tablet",
    isLaptop: tier === "laptop",
    isDesktop: tier === "desktop",
    isTouchDevice: tier === "mobile" || tier === "tablet",
    isLargeScreen: tier === "laptop" || tier === "desktop"
  };
}

export default useViewportTier;
