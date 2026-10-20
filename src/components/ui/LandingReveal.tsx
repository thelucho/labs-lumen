"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { play } from "./reveal";

const STAGGER = 80;

/**
 * Aparición de las secciones de la landing al hacer scroll (DESIGN §9): los
 * `[data-reveal]` de la landing y el footer que están debajo del pliegue se ocultan y
 * entran escalonados al llegar. Sin JS o con prefers-reduced-motion, todo
 * queda visible.
 */
export function LandingReveal() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const items = [...document.querySelectorAll<HTMLElement>("main [data-reveal], footer [data-reveal]")].filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          el.style.opacity = "";
          animations.push(...play(el, batch++ * STAGGER));
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of items) {
      el.style.opacity = "0";
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      items.forEach((el) => (el.style.opacity = ""));
    };
  }, [reducedMotion]);

  return null;
}
