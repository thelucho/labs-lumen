import { useSyncExternalStore } from "react";

/**
 * Las sombras se calculan una vez y se congelan (mapa de sombras del sol y
 * ContactShadows con frames=1). Cuando cambia algo que proyecta sombra —al
 * montarse, o por recarga en caliente en desarrollo— hay que recalcularlas;
 * si no, quedan sombras de objetos que ya no están.
 */
let version = 0;
const listeners = new Set<() => void>();

/** Llamar después de colocar o cambiar geometría que proyecta sombra. */
export function invalidateShadows() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getShadowVersion(): number {
  return version;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useShadowVersion(): number {
  return useSyncExternalStore(subscribe, getShadowVersion, getShadowVersion);
}
