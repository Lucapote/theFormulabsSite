import { useRef, useCallback } from "react";

/**
 * Custom hook to handle Press and Hold (Long Press) for Instagram-style media preview
 * vs Quick Click for media selection.
 */
export function useLongPress(onLongPress, onClick, { delay = 400 } = {}) {
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (event) => {
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        if (onLongPress) {
          onLongPress(event);
        }
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (shouldTriggerClick && !isLongPress.current && onClick) {
        onClick(event);
      }
    },
    [onClick]
  );

  return {
    onMouseDown: (e) => start(e),
    onMouseUp: (e) => clear(e, true),
    onMouseLeave: (e) => clear(e, false),
    onTouchStart: (e) => start(e),
    onTouchEnd: (e) => clear(e, true),
    onTouchMove: (e) => clear(e, false)
  };
}
