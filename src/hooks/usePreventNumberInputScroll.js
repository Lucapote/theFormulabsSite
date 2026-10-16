import { useEffect } from "react";

/**
 * usePreventNumberInputScroll
 * Hook global que previene que la rueda del ratón (evento 'wheel')
 * altere accidentalmente los valores numéricos de inputs de tipo número
 * al scrollear por formularios o dashboards.
 */
export function usePreventNumberInputScroll() {
  useEffect(() => {
    const handleWheel = () => {
      if (
        document.activeElement?.tagName === "INPUT" &&
        document.activeElement?.type === "number"
      ) {
        document.activeElement.blur();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
}

export default usePreventNumberInputScroll;
