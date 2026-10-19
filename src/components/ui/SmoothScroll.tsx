"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Scroll suave con Lenis. Se detiene con el panel o el modal abiertos y no se
 * activa con prefers-reduced-motion. Las zonas con scroll propio llevan
 * `data-lenis-prevent`.
 */
export function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ autoRaf: true });
    const sync = ({ isDetailOpen, isModalOpen }: { isDetailOpen: boolean; isModalOpen: boolean }) => {
      if (isDetailOpen || isModalOpen) lenis.stop();
      else lenis.start();
    };
    sync(useUIStore.getState());
    const unsubscribe = useUIStore.subscribe(sync);
    return () => {
      unsubscribe();
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
