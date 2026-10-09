import { buildingHeight } from "@/lib/building";

export const TARGET: [number, number, number] = [0, buildingHeight() * 0.5, 0];
export const DISTANCE = 88;
export const ELEVATION = 10;
export const FOV = 30;
/** Tope de distancia: más lejos el edificio se vuelve un punto en mobile angosto. */
export const MAX_DISTANCE = 210;

/**
 * Niebla relativa a la distancia de cámara: empieza un poco detrás del edificio
 * y termina antes del borde del suelo, así el horizonte se funde igual en
 * cualquier encuadre.
 */
export function fogRange(distance: number): [number, number] {
  return [distance + 30, distance + 210];
}

/** Azimut 0 = mirando el frente norte desde el norte; 90 = lateral este. */
export const INITIAL_AZIMUTH = 35;

/** Solo en desarrollo: `?cam=front|east|back|west` para capturas de control. */
const DEBUG_VIEWS: Record<string, number> = { front: 0, east: 90, back: 180, west: 270 };

export function readAzimuth(): number {
  if (process.env.NODE_ENV === "production") return INITIAL_AZIMUTH;
  const view = new URLSearchParams(window.location.search).get("cam") ?? "";
  return DEBUG_VIEWS[view] ?? INITIAL_AZIMUTH;
}

export function cameraPosition(azimuthDeg: number): [number, number, number] {
  const a = (azimuthDeg * Math.PI) / 180;
  return [
    TARGET[0] + Math.sin(a) * DISTANCE,
    TARGET[1] + ELEVATION,
    TARGET[2] + Math.cos(a) * DISTANCE,
  ];
}

/** Punto en el cielo según azimut (grados desde el norte hacia el este) y altura angular. */
export function skyPoint(azimuthDeg: number, elevationDeg: number, radius: number): [number, number, number] {
  const a = (azimuthDeg * Math.PI) / 180;
  const e = (elevationDeg * Math.PI) / 180;
  return [
    Math.sin(a) * Math.cos(e) * radius,
    Math.sin(e) * radius,
    Math.cos(a) * Math.cos(e) * radius,
  ];
}
