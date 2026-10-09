/** Breakpoint `md` de Tailwind: desde acá el panel es lateral (abajo, bottom sheet). */
export const PANEL_BREAKPOINT = 768;

/** Breakpoint `lg` de Tailwind: desde acá el hero va lado a lado (texto · 3D · selector). */
export const HERO_BREAKPOINT = 1024;

/** Breakpoint `sm` de Tailwind: margen lateral 12 px por debajo, 32 px desde acá. */
const GUTTER_BREAKPOINT = 640;

/** Ancho del panel de ficha en escritorio (clase `md:w-[420px]` en UnitPanel). */
export const PANEL_WIDTH = 420;

/** Medidas del hero que el encuadre 3D tiene que esquivar (ver HeroIntro y FloorSelector). */
const INTRO_LEFT = 32; // lg:left-8
const INTRO_WIDTH = 336; // lg:w-[21rem]
const SELECTOR_WIDTH = 160;
const GAP = 24;
const GAP_STACKED = 8;

/**
 * Franja horizontal libre (px, relativa al canvas) donde tiene que entrar el
 * edificio: entre el bloque editorial o el borde, y el selector o el panel.
 */
export function freeBand(width: number, isPanelOpen: boolean): { left: number; right: number } {
  const gutter = width < GUTTER_BREAKPOINT ? 12 : 32;
  const sideBySide = width >= HERO_BREAKPOINT;
  const panelBeside = isPanelOpen && width >= PANEL_BREAKPOINT;
  const left = sideBySide && !isPanelOpen ? INTRO_LEFT + INTRO_WIDTH + GAP : gutter;
  const gap = sideBySide ? GAP : GAP_STACKED;
  const right = width - (panelBeside ? PANEL_WIDTH : 0) - gutter - SELECTOR_WIDTH - gap;
  return { left, right: Math.max(right, left + 120) };
}
