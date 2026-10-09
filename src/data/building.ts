/**
 * Única fuente de datos del proyecto (SPEC §5). El 3D y la UI se generan a
 * partir de este archivo: ningún componente debe repetir estos valores.
 */

export type UnitStatus = "available" | "reserved" | "sold";

/** A = lateral este (con balcón), B = lateral oeste, full = piso completo. */
export type UnitSide = "A" | "B" | "full";

export type LevelKind = "ground" | "typical" | "full" | "roof";

export type CommonSpaceId = "pb" | "sum";

/** Cualquier cosa que se puede apuntar/seleccionar: una unidad, PB o SUM. */
export type SelectableId = string;

export interface Project {
  name: string;
  address: string;
  developer: string;
  /** Texto para mostrar, p. ej. "diciembre 2027". */
  delivery: string;
  orientation: string;
  /** Planta tipo en metros: frente (este-oeste) × fondo (norte-sur). */
  footprint: { width: number; depth: number };
}

export interface Unit {
  id: string;
  floor: number;
  side: UnitSide;
  status: UnitStatus;
  /** Superficies en m². */
  coveredArea: number;
  balconyArea: number;
  rooms: number;
  bedrooms: number;
  ensuites: number;
  bathrooms: number;
  hasToilette: boolean;
  hasLaundry: boolean;
  kitchen: string;
  view: string;
  radiantFloor: boolean;
  heating: string;
  parkingSpaces: number;
  hasStorage: boolean;
  extras: string[];
  /** Precio en USD (tabla de SPEC §5.5). */
  price: number;
}

export interface Level {
  id: string;
  /** 0 = PB, 1–8 = pisos, 9 = SUM. */
  index: number;
  kind: LevelKind;
  /** Etiqueta corta para el selector: "PB", "4", "SUM". */
  label: string;
  /** Altura de piso a piso en metros. */
  height: number;
  unitIds: string[];
  /** Solo PB y SUM. */
  commonSpaceId?: CommonSpaceId;
}

export interface CommonSpace {
  id: CommonSpaceId;
  levelIndex: number;
  title: string;
  features: string[];
}

export const project: Project = {
  name: "Lumen Residencias",
  address: "Los Aromos 1240",
  developer: "Arce & Molina Desarrollos",
  delivery: "diciembre 2027",
  orientation: "Frente norte",
  footprint: { width: 22, depth: 14 },
};

/** SPEC §5.2 */
export const commonEquipment: string[] = [
  "Caldera dual individual (agua caliente + calefacción)",
  "Preinstalación de aire acondicionado split frío/calor en living y dormitorios",
  "Carpinterías de aluminio con DVH",
];

/** SPEC §5.5 — regla de precios (el test verifica la tabla contra esta regla). */
export const pricing = {
  /** Superficie ponderada = cubierta + este porcentaje del balcón. */
  balconyWeight: 0.5,
  baseFloor: 2,
  basePricePerM2: 2900,
  /** Aumento lineal por piso sobre el valor base. */
  stepPerFloor: 0.025,
  fullFloorPricePerM2: { 1: 3000, 8: 3500 } as Record<number, number>,
  roundTo: 1000,
};

/** SPEC §5.5 — tabla de precios en USD. */
const priceTable: Record<number, Partial<Record<UnitSide, number>>> = {
  1: { full: 666_000 },
  2: { A: 342_000, B: 284_000 },
  3: { A: 351_000, B: 291_000 },
  4: { A: 359_000, B: 298_000 },
  5: { A: 368_000, B: 306_000 },
  6: { A: 376_000, B: 313_000 },
  7: { A: 385_000, B: 320_000 },
  8: { full: 777_000 },
};

/** SPEC §5.6 */
const statusById: Record<string, UnitStatus> = {
  "2B": "sold",
  "3A": "sold",
  "5B": "sold",
  "6A": "reserved",
  "8": "reserved",
};

type Typology = Omit<Unit, "id" | "floor" | "status" | "price">;

/** SPEC §5.3 y §5.4 */
const typologies: Record<UnitSide, Typology> = {
  A: {
    side: "A",
    coveredArea: 112,
    balconyArea: 12,
    rooms: 4,
    bedrooms: 3,
    ensuites: 1,
    bathrooms: 2,
    hasToilette: true,
    hasLaundry: false,
    kitchen: "Integrada con isla",
    view: "Frente y lateral este",
    radiantFloor: true,
    heating: "Losa radiante (caldera dual)",
    parkingSpaces: 1,
    hasStorage: true,
    extras: [],
  },
  B: {
    side: "B",
    coveredArea: 98,
    balconyArea: 0,
    rooms: 3,
    bedrooms: 2,
    ensuites: 1,
    bathrooms: 2,
    hasToilette: false,
    hasLaundry: false,
    kitchen: "Semi-integrada",
    view: "Frente y lateral oeste",
    radiantFloor: false,
    heating: "Radiadores (caldera dual)",
    parkingSpaces: 1,
    hasStorage: true,
    extras: [],
  },
  full: {
    side: "full",
    coveredArea: 210,
    balconyArea: 24,
    rooms: 5,
    bedrooms: 4,
    ensuites: 2,
    bathrooms: 3,
    hasToilette: true,
    hasLaundry: true,
    kitchen: "Integrada con isla",
    view: "Frente, lateral este y lateral oeste",
    radiantFloor: true,
    heating: "Losa radiante (caldera dual)",
    parkingSpaces: 2,
    hasStorage: true,
    extras: ["Ascensor con acceso directo a palier privado"],
  },
};

const FLOORS = [1, 2, 3, 4, 5, 6, 7, 8];
const FULL_FLOORS = new Set([1, 8]);
const LAST_FLOOR = FLOORS[FLOORS.length - 1];

function unitId(floor: number, side: UnitSide): string {
  return side === "full" ? String(floor) : `${floor}${side}`;
}

function buildUnit(floor: number, side: UnitSide): Unit {
  const typology = typologies[side];
  const id = unitId(floor, side);
  const price = priceTable[floor]?.[side];
  if (price === undefined) throw new Error(`Falta precio para ${id}`);
  const view =
    side === "full" && floor === LAST_FLOOR
      ? `${typology.view}; vista abierta`
      : typology.view;
  return {
    ...typology,
    view,
    id,
    floor,
    status: statusById[id] ?? "available",
    price,
  };
}

export const units: Unit[] = FLOORS.flatMap((floor) =>
  FULL_FLOORS.has(floor)
    ? [buildUnit(floor, "full")]
    : [buildUnit(floor, "A"), buildUnit(floor, "B")],
);

/** Ordenados de abajo hacia arriba. Alturas de SPEC §4.1. */
export const levels: Level[] = [
  {
    id: "pb",
    index: 0,
    kind: "ground",
    label: "PB",
    height: 4.2,
    unitIds: [],
    commonSpaceId: "pb",
  },
  ...FLOORS.map<Level>((floor) => ({
    id: String(floor),
    index: floor,
    kind: FULL_FLOORS.has(floor) ? "full" : "typical",
    label: String(floor),
    height: 3,
    unitIds: units.filter((u) => u.floor === floor).map((u) => u.id),
  })),
  {
    id: "sum",
    index: 9,
    kind: "roof",
    label: "SUM",
    height: 3.5,
    unitIds: [],
    commonSpaceId: "sum",
  },
];

/** SPEC §5.7 y §5.8 */
export const commonSpaces: Record<CommonSpaceId, CommonSpace> = {
  pb: {
    id: "pb",
    levelIndex: 0,
    title: "Hall de acceso",
    features: [
      "Hall de acceso doble altura con recepción",
      "Seguridad 24 h y control de acceso con tarjeta",
      "2 ascensores (uno con acceso directo a pisos completos)",
      "Subsuelo: 16 cocheras + 14 bauleras",
      "Bicicletero y sala de residuos",
      "Acceso accesible (rampa) y portón automático a cocheras",
    ],
  },
  sum: {
    id: "sum",
    levelIndex: 9,
    title: "SUM y amenities",
    features: [
      "SUM cubierto de 120 m² con cocina y 2 parrillas",
      "2 baños (uno accesible) + vestuarios",
      "Terraza de 180 m² con pileta descubierta de 8 × 3,5 m",
      "Solárium con deck",
      "Gimnasio equipado (45 m²) y sauna seco",
      "Vista 360°",
    ],
  },
};
