import { levels } from "@/data/building";
import { levelElevation } from "@/lib/building";

/**
 * Animación de entrada: el edificio "se construye" de abajo hacia arriba como
 * un timelapse. Un frente de obra sube por las cotas de cada nivel; cada tramo
 * entra con un easing (rápido y se asienta), así se lee piso por piso sin
 * perder fluidez. Las piezas del edificio se recortan a la altura del frente
 * (ver InstancedBoxes `rise`).
 */

/** Duración total en milisegundos. */
export const RISE_DURATION = 1700;

/** Cotas de los niveles (de abajo hacia arriba) más el remate de la azotea. */
let stops: number[] = levels.map((l) => levelElevation(l.index));

/** El edificio informa su punto más alto (núcleo, sala de máquinas, SUM). */
export function setRiseTop(top: number) {
  const roof = levelElevation(levels.length);
  stops = [...levels.map((l) => levelElevation(l.index)), Math.max(top, roof)];
}

let start: number | null = null;
let finished = false;
const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** easeOutCubic: cada piso entra rápido y se asienta. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * La escena avisa cuando terminó de cargar todas sus etapas: recién ahí sube
 * el edificio, sin compilaciones de shaders en el medio que traben la animación.
 */
let armed = false;
export function armRise() {
  armed = true;
}

/** Arranca el reloj (una sola vez, con la escena lista) y da la señal a la interfaz del hero. */
export function startRise(now: number) {
  if (!armed || start !== null || finished) return;
  start = now;
  revealHeroUI();
}

/**
 * Altura del frente de obra en este momento: -Infinity antes de empezar,
 * +Infinity al terminar (o con prefers-reduced-motion).
 */
export function riseFront(now: number): number {
  if (finished || reducedMotion) return Infinity;
  if (start === null) return -Infinity;
  const t = (now - start) / RISE_DURATION;
  if (t >= 1) {
    finished = true;
    // Avisa (sombras de contacto, que se calculan una sola vez con el edificio completo).
    finishListeners.forEach((listener) => listener());
    return Infinity;
  }
  const steps = stops.length - 1;
  const k = Math.min(steps - 1, Math.floor(t * steps));
  const local = t * steps - k;
  return stops[k] + ease(local) * (stops[k + 1] - stops[k]);
}

export function isRising(): boolean {
  return !finished && !reducedMotion;
}

const finishListeners = new Set<() => void>();

/** Avisa al terminar la construcción (enseguida si ya terminó o no hay animación). */
export function onRiseFinished(listener: () => void): () => void {
  if (!isRising()) {
    listener();
    return () => undefined;
  }
  finishListeners.add(listener);
  return () => finishListeners.delete(listener);
}

/** Cada cuántos pisos se recalcula el mapa de sombras durante la subida (es la parte cara del render). */
export const SHADOW_EVERY = 3;

/** Tramo (nivel) en el que va la obra: las sombras se recalculan una vez por tramo, no por cuadro. */
export function riseStep(now: number): number {
  if (start === null) return -1;
  if (finished || reducedMotion) return stops.length;
  return Math.min(stops.length - 2, Math.floor(((now - start) / RISE_DURATION) * (stops.length - 1)));
}

/**
 * La interfaz del hero (bloque editorial, luz del día y selector) entra con el
 * edificio: CSS en globals.css, disparado por este atributo.
 */
export function revealHeroUI() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.intro = "go";
}
