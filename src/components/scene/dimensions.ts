import { project, units, type Unit, type UnitSide } from "@/data/building";

/**
 * Medidas de diseño del modelo 3D (metros). Lo que es dato del proyecto
 * (planta, alturas, superficies) sale de `building.ts`; acá solo hay
 * decisiones de dibujo.
 *
 * Ejes: +X = este, +Z = norte (frente), +Y = arriba. Planta centrada en el origen.
 */

export const HALF_W = project.footprint.width / 2;
export const HALF_D = project.footprint.depth / 2;

export const SLAB = 0.3;
export const SLAB_OVERHANG = 0.15;
export const PLINTH = 0.15;
export const CORNER = 0.4;

/** Ancho objetivo de cada módulo de carpintería. */
export const BAY = 2.1;
export const MULLION = 0.05;
export const MULLION_DEPTH = 0.12;
export const GLASS = 0.03;
export const PANEL = 0.08;
/** Altura del montante horizontal sobre el piso terminado. */
export const TRANSOM = 2.3;

export const RAILING = 1.05;
export const RAIL = 0.05;

/** Retiro de los interiores respecto de la fachada. */
export const ROOM_INSET = 0.14;
/**
 * Separación vertical de los interiores respecto de losas y techos. Sin ella el
 * piso del interior (que se dibuja por dentro, BackSide) queda en el mismo
 * plano que la losa y parpadea al girar la cámara (z-fighting).
 */
export const ROOM_GAP = 0.03;

const typical = (side: UnitSide) => units.find((u) => u.side === side)!;

/** Tabique A/B: la planta se reparte en proporción a las superficies cubiertas. */
export const DIVIDER_X =
  -HALF_W +
  project.footprint.width *
    (typical("B").coveredArea / (typical("A").coveredArea + typical("B").coveredArea));

export function unitSpanX(side: UnitSide): [number, number] {
  if (side === "A") return [DIVIDER_X, HALF_W];
  if (side === "B") return [-HALF_W, DIVIDER_X];
  return [-HALF_W, HALF_W];
}

/** Largo del balcón sobre el lateral este; la profundidad sale de la superficie. */
const BALCONY_LENGTH: Record<UnitSide, number> = { A: 10, B: 0, full: project.footprint.depth };

export function balconyGeometry(unit: Unit): { length: number; depth: number } {
  const length = BALCONY_LENGTH[unit.side];
  return { length, depth: unit.balconyArea / length };
}

/** Azotea: SUM retirado al oeste, terraza y pileta al este. */
export const ROOF = {
  sum: { x: [-10, 2], z: [-6, 4], height: 3, roof: 0.25, eave: 0.4 },
  pool: { x: [5.5, 9], z: [-3, 5], coping: 0.3, depth: 0.3 },
  deck: { x: [2.8, 10.6], z: [-3.9, 6.6], thickness: 0.08 },
  machineRoom: { x: [6.5, 10.2], z: [-6.6, -4.4], height: 2.4 },
} as const;

/**
 * Trazado urbano: el edificio ocupa una manzana chica con jardín, rodeada de
 * calles; alrededor, manzanas de casas bajas en una grilla regular.
 */
export const URBAN = {
  sidewalk: 4,
  street: 9,
  curb: 0.2,
  /** Altura de vereda sobre la calzada. */
  curbHeight: 0.15,
  /**
   * Lote del edificio. El edificio queda retirado de la línea municipal
   * (FRONT_SETBACK) con un jardín de acceso al frente, y algo más de fondo atrás.
   */
  lot: { x: [-26, 26], z: [-21, HALF_D + 6] },
  /** Radio hasta donde se generan manzanas (más allá, la niebla ya tapa todo). */
  radius: 290,
} as const;

/** Retiro de frente: jardín de acceso entre la vereda y el hall. */
export const FRONT_SETBACK = URBAN.lot.z[1] - HALF_D;

/**
 * PB: acceso con marquesina, pórtico de hormigón y puerta pivotante grande;
 * portón de cocheras sobre el frente norte.
 */
export const GROUND = {
  canopy: { x: [-7.5, -1.5], y: 3, thickness: 0.45, depth: 2.2 },
  /** Paños vidriados del acceso, pórtico (profundidad) y puerta pivotante. */
  entrance: { x: [-7, -2], depth: 0.6, door: [-5.4, -3.6], doorHeight: 2.9 },
  garageX: 6.2,
  garageHeight: 2.8,
  doorHead: 2.6,
} as const;

/** Marco de hormigón saliente alrededor de las unidades A del frente (pisos tipo). */
export const FRONT_FRAME = { depth: 0.9, thickness: 0.45 } as const;

/** Núcleo de escalera y ascensores: sobresale en el contrafrente, bajo la sala de máquinas. */
export const CORE = { x: [5.6, 10.2], z: -HALF_D - 1.4 } as const;
