import { useSyncExternalStore } from "react";

/**
 * Entrada de la página: un loader cubre el hero mientras la escena 3D compila
 * sus etapas; al terminar, la escena aparece con un fundido y entran los
 * paneles laterales (CSS en globals.css, disparado por html[data-intro="go"]).
 */

let progress = 0;
const listeners = new Set<() => void>();

/** La escena informa cuánto lleva cargado (0 a 1). */
export function setLoadProgress(value: number) {
  progress = Math.max(progress, Math.min(1, value));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLoadProgress(): number {
  return useSyncExternalStore(subscribe, () => progress, () => 0);
}

/** Saca el loader, muestra la escena y hace entrar los paneles (una sola vez). */
export function revealHero() {
  if (typeof document === "undefined") return;
  setLoadProgress(1);
  document.documentElement.dataset.intro = "go";
}

export function isRevealed(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.intro === "go";
}
