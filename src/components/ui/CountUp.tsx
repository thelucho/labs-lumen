"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const DURATION = 1400;

/**
 * Cifra que cuenta desde 0 al entrar en pantalla (DESIGN §8 Estadísticas). Se
 * renderiza con el valor final (sin JS y con prefers-reduced-motion queda así).
 */
export function CountUp({ value, pad = 0 }: { value: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    // Solo cuenta si todavía no se ve (debajo del pliegue).
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 4))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    // Antes de entrar arranca en 0 (fuera de pantalla: no se ve el cambio).
    frame = requestAnimationFrame(() => setShown(0));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {String(shown).padStart(pad, "0")}
    </span>
  );
}
