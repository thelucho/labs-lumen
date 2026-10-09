import { HALF_D, HALF_W } from "./dimensions";

/**
 * Distribución de árboles y arbustos alrededor del edificio. Pura y
 * determinística (semilla fija): siempre el mismo paisaje, testeable.
 * Ejes como en el resto de la escena: +X este, +Z norte (frente).
 */

export type TreeKind = "round" | "columnar";

export interface Tree {
  kind: TreeKind;
  x: number;
  z: number;
  /** Altura total en metros. */
  height: number;
  /** Radio de copa en metros. */
  crown: number;
  /** 0, 1 o 2: elige el tono de verde. */
  tone: number;
}

export interface Shrub {
  x: number;
  z: number;
  radius: number;
  tone: number;
}

/** Zonas sin vegetación dispersa (rectángulos en planta: x0, x1, z0, z1). */
export const KEEP_CLEAR: [number, number, number, number][] = [
  // Edificio con balcones al este y un margen.
  [-HALF_W - 3, HALF_W + 4.5, -HALF_D - 3, HALF_D + 1],
  // Vereda y calle al frente (ver Ground en Environment).
  [-48, 48, HALF_D, HALF_D + 14.5],
];

const TREE_COUNT = 14;
const SHRUB_COUNT = 24;
const TREE_SPACING = 9;
const SHRUB_SPACING = 3.2;

/** PRNG mulberry32: reproducible sin dependencias. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isClear(x: number, z: number, margin = 0): boolean {
  return KEEP_CLEAR.every(
    ([x0, x1, z0, z1]) => x < x0 - margin || x > x1 + margin || z < z0 - margin || z > z1 + margin,
  );
}

function farFrom(points: { x: number; z: number }[], x: number, z: number, distance: number) {
  return points.every((p) => Math.hypot(p.x - x, p.z - z) >= distance);
}

/** Punto al azar en un anillo alrededor del edificio. */
function ringPoint(rand: () => number, rMin: number, rMax: number) {
  const angle = rand() * Math.PI * 2;
  // sqrt: densidad pareja en superficie, no amontonada en el centro.
  const r = Math.sqrt(rMin * rMin + rand() * (rMax * rMax - rMin * rMin));
  return { x: Math.cos(angle) * r, z: Math.sin(angle) * r };
}

export function buildVegetation(seed = 1240): { trees: Tree[]; shrubs: Shrub[] } {
  const rand = random(seed);
  const trees: Tree[] = [];

  // Se descartan 6 valores que antes usaban los árboles de vereda (quitados):
  // así el resto del paisaje queda exactamente donde estaba.
  for (let i = 0; i < 6; i++) rand();

  // Árboles dispersos en el terreno.
  for (let tries = 0; trees.length < TREE_COUNT && tries < 2000; tries++) {
    // Hasta 60 m: siempre a más de ~25 m de la cámara, sin árboles gigantes en primer plano.
    const { x, z } = ringPoint(rand, 19, 60);
    if (!isClear(x, z, 2.5) || !farFrom(trees, x, z, TREE_SPACING)) continue;
    const columnar = rand() < 0.3;
    trees.push({
      kind: columnar ? "columnar" : "round",
      x,
      z,
      height: columnar ? 7 + rand() * 3 : 5 + rand() * 3,
      crown: columnar ? 1.1 + rand() * 0.4 : 1.7 + rand() * 1,
      tone: Math.floor(rand() * 3),
    });
  }

  // Arbustos: más cerca del edificio (canteros) y algunos sueltos.
  const shrubs: Shrub[] = [];
  for (let tries = 0; shrubs.length < SHRUB_COUNT && tries < 4000; tries++) {
    const { x, z } = ringPoint(rand, 15, 55);
    if (!isClear(x, z, 1) || !farFrom(trees, x, z, 3) || !farFrom(shrubs, x, z, SHRUB_SPACING)) continue;
    shrubs.push({ x, z, radius: 0.6 + rand() * 0.7, tone: Math.floor(rand() * 3) });
  }

  return { trees, shrubs };
}
