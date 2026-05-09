/**
 * usePullToRefresh — lightweight pull-to-refresh hook for mobile.
 * Attach containerRef to the scrollable element.
 * onRefresh must return a Promise.
 */
import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72; // px pulled before triggering

export function usePullToRefresh(containerRef, onRefresh) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop <= 0) {
        setPulling(true);
        setPullDistance(Math.min(dy * 0.5, THRESHOLD + 20));
        if (dy > 10) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (pulling && pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPulling(false);
        setPullDistance(0);
        try { await onRefresh(); } finally { setRefreshing(false); }
      } else {
        setPulling(false);
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [containerRef, onRefresh, pulling, pullDistance]);

  return { pulling, pullDistance, refreshing };
}