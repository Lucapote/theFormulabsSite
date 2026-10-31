import { useRef, useCallback, useEffect } from "react";

/**
 * useFramingGestures
 * Handles mouse drag and touch gestures for panning images inside the framing canvas.
 */
export function useFramingGestures({ geometry, currentTransform, updateCurrentTransform }) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!geometry.canPanX && !geometry.canPanY) return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: currentTransform.panX || 0, y: currentTransform.panY || 0 };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const nextX = panStartRef.current.x + deltaX;
      const nextY = panStartRef.current.y + deltaY;

      updateCurrentTransform({
        panX: geometry.canPanX ? Math.max(geometry.minPanX, Math.min(geometry.maxPanX, nextX)) : 0,
        panY: geometry.canPanY ? Math.max(geometry.minPanY, Math.min(geometry.maxPanY, nextY)) : 0
      });
    },
    [geometry, updateCurrentTransform]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchStart = (e) => {
    if (!geometry.canPanX && !geometry.canPanY) return;
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { x: currentTransform.panX || 0, y: currentTransform.panY || 0 };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const nextX = panStartRef.current.x + deltaX;
    const nextY = panStartRef.current.y + deltaY;

    updateCurrentTransform({
      panX: geometry.canPanX ? Math.max(geometry.minPanX, Math.min(geometry.maxPanX, nextX)) : 0,
      panY: geometry.canPanY ? Math.max(geometry.minPanY, Math.min(geometry.maxPanY, nextY)) : 0
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return {
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

