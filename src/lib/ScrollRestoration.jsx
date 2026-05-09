/**
 * ScrollRestoration — preserves scroll position per-route so switching
 * between bottom tabs returns the user to where they were.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map();

export function useScrollRestoration(containerRef) {
  const { pathname } = useLocation();

  // Save position before leaving
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const save = () => scrollPositions.set(pathname, el.scrollTop);
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, [pathname, containerRef]);

  // Restore position on mount
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const saved = scrollPositions.get(pathname) ?? 0;
    // Defer so content has rendered
    const raf = requestAnimationFrame(() => { el.scrollTop = saved; });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
}