import type Lenis from "lenis";

/** Instancia activa de Lenis (SmoothScroll); null con prefers-reduced-motion. */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Lleva a una sección por id: con Lenis, con su scroll suave; sin Lenis, salto
 * directo (prefers-reduced-motion). Actualiza el hash sin otro salto.
 */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else target.scrollIntoView();
  history.replaceState(null, "", id === "inicio" ? location.pathname : `#${id}`);
}
