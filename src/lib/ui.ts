import type { CSSProperties } from "react";

/**
 * Entrada del hero (globals.css): demora y desplazamiento de una pieza. Va con
 * el atributo `data-intro`.
 */
export function introStyle(delayMs: number, x = 0, y = 16): CSSProperties {
  return { "--intro-delay": `${delayMs}ms`, "--intro-x": `${x}px`, "--intro-y": `${y}px` } as CSSProperties;
}

/** Breakpoint `lg` de Tailwind: desde acá el hero va lado a lado (texto · 3D · selector). */
export const HERO_BREAKPOINT = 1024;

/** Breakpoint `sm` de Tailwind: margen del selector dentro de la tarjeta, 12 px por debajo y 24 px desde acá. */
const GUTTER_BREAKPOINT = 640;

/**
 * Medidas del hero que el encuadre 3D tiene que esquivar (ver HeroIntro y
 * FloorSelector), relativas a la tarjeta del canvas: el hero tiene 12 px de
 * margen (p-3) y el bloque editorial va a 36 px del borde (lg:left-9).
 */
const INTRO_LEFT = 24;
const INTRO_WIDTH = 400; // lg:w-[25rem]
const SELECTOR_WIDTH = 160;
const GAP = 24;
const GAP_STACKED = 8;

/**
 * Franja horizontal libre (px, relativa al canvas) donde tiene que entrar el
 * edificio: entre el bloque editorial o el borde, y el selector.
 */
export function freeBand(width: number): { left: number; right: number } {
  const gutter = width < GUTTER_BREAKPOINT ? 12 : 24;
  const sideBySide = width >= HERO_BREAKPOINT;
  const left = sideBySide ? INTRO_LEFT + INTRO_WIDTH + GAP : gutter;
  const gap = sideBySide ? GAP : GAP_STACKED;
  const right = width - gutter - SELECTOR_WIDTH - gap;
  return { left, right: Math.max(right, left + 120) };
}
