import { HALF_D, HALF_W, URBAN } from "./dimensions";
import { random } from "./random";

/**
 * Jardín de la manzana del edificio: árboles y arbustos en los laterales y el
 * contrafrente. Puro y determinístico (semilla fija): siempre el mismo
 * paisaje, testeable. El arbolado de veredas y patios vecinos está en cityLayout.
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
  /** Altura de apoyo (canteros); por defecto, el suelo. */
  y?: number;
}

/** Lote del edificio, con un margen contra la línea municipal. */
const LOT_MARGIN = 1.5;
export const GARDEN = {
  x0: URBAN.lot.x[0] + LOT_MARGIN,
  x1: URBAN.lot.x[1] - LOT_MARGIN,
  z0: URBAN.lot.z[0] + LOT_MARGIN,
  z1: URBAN.lot.z[1] - LOT_MARGIN,
};

/** Edificio con balcones al este y un margen (más amplio al este: que se lean los balcones). */
export const BUILDING_CLEAR: [number, number, number, number] = [-HALF_W - 3, HALF_W + 7, -HALF_D - 3, HALF_D + 1];

const TREE_COUNT = 8;
const SHRUB_COUNT = 18;
const TREE_SPACING = 7.5;
const SHRUB_SPACING = 3.2;

/** Dentro del jardín y fuera del edificio (con margen). */
export function isClear(x: number, z: number, margin = 0): boolean {
  const [x0, x1, z0, z1] = BUILDING_CLEAR;
  const inGarden =
    x > GARDEN.x0 + margin && x < GARDEN.x1 - margin && z > GARDEN.z0 + margin && z < GARDEN.z1 - margin;
  const onBuilding = x > x0 - margin && x < x1 + margin && z > z0 - margin && z < z1 + margin;
  return inGarden && !onBuilding;
}

function farFrom(points: { x: number; z: number }[], x: number, z: number, distance: number) {
  return points.every((p) => Math.hypot(p.x - x, p.z - z) >= distance);
}

function gardenPoint(rand: () => number) {
  return { x: GARDEN.x0 + rand() * (GARDEN.x1 - GARDEN.x0), z: GARDEN.z0 + rand() * (GARDEN.z1 - GARDEN.z0) };
}

export function buildVegetation(seed = 1240): { trees: Tree[]; shrubs: Shrub[] } {
  const rand = random(seed);
  const trees: Tree[] = [];
  for (let tries = 0; trees.length < TREE_COUNT && tries < 4000; tries++) {
    const { x, z } = gardenPoint(rand);
    if (!isClear(x, z, 2.5) || !farFrom(trees, x, z, TREE_SPACING)) continue;
    const columnar = rand() < 0.3;
    trees.push({
      kind: columnar ? "columnar" : "round",
      x,
      z,
      height: columnar ? 7 + rand() * 3 : 5.5 + rand() * 3,
      crown: columnar ? 1.1 + rand() * 0.4 : 1.8 + rand() * 1,
      tone: Math.floor(rand() * 3),
    });
  }

  const shrubs: Shrub[] = [];
  for (let tries = 0; shrubs.length < SHRUB_COUNT && tries < 6000; tries++) {
    const { x, z } = gardenPoint(rand);
    if (!isClear(x, z, 0.8) || !farFrom(trees, x, z, 3) || !farFrom(shrubs, x, z, SHRUB_SPACING)) continue;
    shrubs.push({ x, z, radius: 0.6 + rand() * 0.7, tone: Math.floor(rand() * 3) });
  }

  return { trees, shrubs };
}
