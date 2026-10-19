import {
  commonSpaces,
  levels,
  pricing,
  showcases,
  units,
  type CommonSpace,
  type Showcase,
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

/** Ids seleccionables de un nivel: sus unidades, o PB/SUM. */
export function selectablesOf(level: Level): SelectableId[] {
  if (level.unitIds.length > 0) return level.unitIds;
  return level.commonSpaceId ? [level.commonSpaceId] : [];
}

/**
 * Elemento del piso de arriba (+1) o de abajo (−1), manteniendo el lado A/B
 * cuando existe; si no, el primero del nivel. `null` en los extremos.
 */
export function adjacentSelectable(id: SelectableId, direction: 1 | -1): SelectableId | null {
  const level = getLevelOf(id);
  if (!level) return null;
  const next = levels.find((l) => l.index === level.index + direction);
  if (!next) return null;
  const candidates = selectablesOf(next);
  const side = getUnit(id)?.side;
  const sameSide = candidates.find((c) => getUnit(c)?.side === side);
  return sameSide ?? candidates[0] ?? null;
}

/** Ficha (textos, fotos) de una unidad según su tipología, o de PB/SUM. */
export function getShowcase(id: SelectableId): Showcase | undefined {
  const unit = getUnit(id);
  if (unit) return showcases[unit.side];
  return isCommonSpaceId(id) ? showcases[id] : undefined;
}

/** Precio más bajo entre las unidades no vendidas ("Desde USD …"). */
export function minAvailablePrice(): number {
  return Math.min(...units.filter((u) => u.status !== "sold").map((u) => u.price));
}
