import {
  commonSpaces,
  levels,
  pricing,
  units,
  type CommonSpace,
  type CommonSpaceId,
  type Level,
  type SelectableId,
  type Unit,
} from "@/data/building";

const unitsById = new Map(units.map((u) => [u.id, u]));
const levelsById = new Map(levels.map((l) => [l.id, l]));

export function getUnit(id: SelectableId): Unit | undefined {
  return unitsById.get(id);
}

export function getLevel(id: string): Level | undefined {
  return levelsById.get(id);
}

export function isCommonSpaceId(id: SelectableId): id is CommonSpaceId {
  return id in commonSpaces;
}

export function getCommonSpace(id: SelectableId): CommonSpace | undefined {
  return isCommonSpaceId(id) ? commonSpaces[id] : undefined;
}

/** Nivel al que pertenece una unidad, PB o SUM. */
export function getLevelOf(id: SelectableId): Level | undefined {
  const unit = getUnit(id);
  if (unit) return levels.find((l) => l.index === unit.floor);
  const space = getCommonSpace(id);
  if (space) return levels.find((l) => l.index === space.levelIndex);
  return undefined;
}

/** Cota del piso terminado del nivel, en metros sobre la vereda. */
export function levelElevation(index: number): number {
  return levels
    .filter((l) => l.index < index)
    .reduce((sum, l) => sum + l.height, 0);
}

export function buildingHeight(): number {
  return levels.reduce((sum, l) => sum + l.height, 0);
}

export function hasBalcony(unit: Unit): boolean {
  return unit.balconyArea > 0;
}

export function totalArea(unit: Unit): number {
  return unit.coveredArea + unit.balconyArea;
}

/** Superficie ponderada = cubierta + 50 % del balcón (SPEC §5.5). */
export function weightedArea(unit: Unit): number {
  return unit.coveredArea + unit.balconyArea * pricing.balconyWeight;
}

/** Valor del m² según la regla de SPEC §5.5 (lineal desde el piso base). */
export function pricePerM2ByRule(unit: Unit): number {
  const fixed = pricing.fullFloorPricePerM2[unit.floor];
  if (unit.side === "full" && fixed !== undefined) return fixed;
  const floorsAboveBase = unit.floor - pricing.baseFloor;
  return pricing.basePricePerM2 * (1 + pricing.stepPerFloor * floorsAboveBase);
}

export function priceByRule(unit: Unit): number {
  const raw = weightedArea(unit) * pricePerM2ByRule(unit);
  return Math.round(raw / pricing.roundTo) * pricing.roundTo;
}
