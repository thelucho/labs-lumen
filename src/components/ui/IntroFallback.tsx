"use client";

import { useEffect } from "react";
import { revealHeroUI } from "@/components/scene/rise";

/** La interfaz del hero espera al edificio, pero no más que esto (ms): no demora el contenido principal. */
const MAX_WAIT = 900;

/**
 * Respaldo de la entrada del hero: si la escena 3D tarda (o no carga), la
 * interfaz aparece igual pasado MAX_WAIT. Normalmente la dispara la escena al
 * empezar a construir el edificio.
 */
export function IntroFallback() {
  useEffect(() => {
    const timer = window.setTimeout(revealHeroUI, MAX_WAIT);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
