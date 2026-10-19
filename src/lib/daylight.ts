import { INITIAL_AZIMUTH } from "@/components/scene/camera";

/**
 * Recorrido del sol en Buenos Aires (hemisferio sur, frente norte): sale por
 * el este, al mediodía solar está al norte y se pone por el oeste. Modelo
 * simple y continuo, sin estaciones: alcanza para leer luces y sombras.
 */
const SUNRISE = 6.5;
const SUNSET = 19.5;
/** Mediodía solar (huso horario argentino: ≈ 13 h). */
const SOLAR_NOON = (SUNRISE + SUNSET) / 2;
const HALF_DAY = (SUNSET - SUNRISE) / 2;
/** Azimut al salir y al ponerse, en grados desde el norte (100 = un poco al sur del este). */
const AZIMUTH_SWING = 100;
const MAX_ELEVATION = 58;

/** Rango del slider, en horas. */
export const DAY_START = 6;
export const DAY_END = 22;

/** Hora por defecto: el sol queda detrás de la cámara inicial e ilumina frente y balcones. */
export const DEFAULT_HOUR = SOLAR_NOON - (INITIAL_AZIMUTH / AZIMUTH_SWING) * HALF_DAY;

/** Referencias debajo del slider. Orientan: el control es continuo. */
export const DAY_MARKS = [
  { id: "morning", label: "Mañana", hour: 7.5 },
  { id: "noon", label: "Mediodía", hour: 13 },
  { id: "evening", label: "Tarde", hour: 18 },
  { id: "night", label: "Noche", hour: 21.5 },
] as const;

export type DayMarkId = (typeof DAY_MARKS)[number]["id"];

export function clampHour(hour: number): number {
  return Math.min(DAY_END, Math.max(DAY_START, hour));
}

/** Azimut del sol (grados desde el norte hacia el este). */
export function sunAzimuth(hour: number): number {
  return ((SOLAR_NOON - hour) / HALF_DAY) * AZIMUTH_SWING;
}

/** Altura del sol sobre el horizonte (grados; negativa de noche). */
export function sunElevation(hour: number): number {
  return MAX_ELEVATION * Math.sin((Math.PI * (hour - SUNRISE)) / (SUNSET - SUNRISE));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** 1 de día, 0 de noche, con un crepúsculo corto alrededor del horizonte. */
export function daylightFactor(hour: number): number {
  return smoothstep(-5, 6, sunElevation(hour));
}

/** 1 con el sol alto, 0 al ras del horizonte: luz más cálida y tenue al amanecer y al atardecer. */
export function highSunFactor(hour: number): number {
  return smoothstep(4, 32, sunElevation(hour));
}

/** 10.8333 → "10:50" */
export function formatHour(hour: number): string {
  const minutes = Math.round(hour * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
