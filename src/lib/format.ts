import type { SelectableId, Unit, UnitStatus } from "@/data/building";
import { getCommonSpace, getUnit } from "@/lib/building";

const numberFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** 359000 → "USD 359.000" */
export function formatPrice(value: number): string {
  return `USD ${formatNumber(value)}`;
}

/** 112 → "112 m²" */
export function formatArea(value: number): string {
  return `${formatNumber(value)} m²`;
}

/** Etiqueta corta (tooltip, selector): "4° A", "Piso 1 completo". */
export function unitShortLabel(unit: Unit): string {
  return unit.side === "full"
    ? `Piso ${unit.floor} completo`
    : `${unit.floor}° ${unit.side}`;
}

/** Encabezado de ficha: "Piso 4 · Unidad A", "Piso 1 · Piso completo". */
export function unitTitle(unit: Unit): string {
  return unit.side === "full"
    ? `Piso ${unit.floor} · Piso completo`
    : `Piso ${unit.floor} · Unidad ${unit.side}`;
}

const commonSpaceShortLabels = { pb: "Planta baja", sum: "SUM" } as const;

/** Etiqueta corta de cualquier elemento seleccionable. */
export function selectableLabel(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return unitShortLabel(unit);
  const space = getCommonSpace(id);
  if (space) return commonSpaceShortLabels[space.id];
  return id;
}

export const statusLabels: Record<UnitStatus, string> = {
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
};

/** "2 + toilette" */
export function formatBathrooms(unit: Unit): string {
  return unit.hasToilette ? `${unit.bathrooms} + toilette` : String(unit.bathrooms);
}
