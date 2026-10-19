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

/** Breakpoint `sm` de Tailwind: margen lateral 12 px por debajo, 32 px desde acá. */
const GUTTER_BREAKPOINT = 640;

/** Medidas del hero que el encuadre 3D tiene que esquivar (ver HeroIntro y FloorSelector). */
const INTRO_LEFT = 32; // lg:left-8
const INTRO_WIDTH = 368; // lg:w-[23rem]
const SELECTOR_WIDTH = 160;
const GAP = 24;
const GAP_STACKED = 8;

/**
 * Franja horizontal libre (px, relativa al canvas) donde tiene que entrar el
 * edificio: entre el bloque editorial o el borde, y el selector.
 */
export function freeBand(width: number): { left: number; right: number } {
  const gutter = width < GUTTER_BREAKPOINT ? 12 : 32;
  const sideBySide = width >= HERO_BREAKPOINT;
  const left = sideBySide ? INTRO_LEFT + INTRO_WIDTH + GAP : gutter;
  const gap = sideBySide ? GAP : GAP_STACKED;
  const right = width - gutter - SELECTOR_WIDTH - gap;
  return { left, right: Math.max(right, left + 120) };
}
