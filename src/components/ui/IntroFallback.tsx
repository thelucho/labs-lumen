"use client";

import { useEffect } from "react";
import { revealHero } from "@/lib/intro";

/** Si la escena no avisa en este tiempo (ms), el loader se va igual. */
const MAX_WAIT = 8000;

/**
 * Respaldo del loader: normalmente lo saca la escena 3D al terminar de cargar;
 * si tarda demasiado o WebGL no está disponible, la página aparece igual.
 */
export function IntroFallback() {
  useEffect(() => {
    const timer = window.setTimeout(revealHero, MAX_WAIT);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
