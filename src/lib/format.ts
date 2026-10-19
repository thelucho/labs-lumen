import type { Figure, SelectableId, Unit, UnitStatus } from "@/data/building";
import { getCommonSpace, getUnit, planArea, totalArea } from "@/lib/building";

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

/** Etiqueta corta (tooltip, selector): "4° A", "Oficina 9". */
export function unitShortLabel(unit: Unit): string {
  return unit.side === "office"
    ? `Oficina ${unit.floor}`
    : `${unit.floor}° ${unit.side}`;
}

/** Encabezado de ficha: "Piso 4 · Unidad A", "Piso 9 · Oficina". */
export function unitTitle(unit: Unit): string {
  return unit.side === "office"
    ? `Piso ${unit.floor} · Oficina`
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

const commonSpaceTitles = { pb: "Planta baja · Hall", sum: "Azotea · SUM y amenities" } as const;

/** Encabezado de ficha para unidades, PB y SUM. */
export function selectableTitle(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return unitTitle(unit);
  const space = getCommonSpace(id);
  if (space) return commonSpaceTitles[space.id];
  return id;
}

/** "3 (1 en suite)" */
export function formatBedrooms(unit: Unit): string {
  return `${unit.bedrooms} (${unit.ensuites} en suite)`;
}

const sideLocations = { A: "Lateral este", B: "Lateral oeste", office: "Planta libre" } as const;
const commonSpaceLocations = { pb: "Planta baja", sum: "Azotea" } as const;

/** Línea sobre el título de la ficha: "Piso 4 · Lateral este", "Planta baja". */
export function selectableEyebrow(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return `Piso ${unit.floor} · ${sideLocations[unit.side]}`;
  const space = getCommonSpace(id);
  if (space) return commonSpaceLocations[space.id];
  return "";
}

/** Título grande de la ficha: "4° A", "Oficina 9", "Hall de acceso". */
export function selectableHeadline(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return unitShortLabel(unit);
  return getCommonSpace(id)?.title ?? id;
}

/** Cifras destacadas de una unidad, en el orden de la ficha. */
export function unitFigures(unit: Unit): Figure[] {
  if (unit.side === "office") {
    return [
      { label: "Superficie", value: formatArea(unit.coveredArea) },
      { label: "Planta libre", value: formatArea(planArea(unit, "open")) },
      { label: "Sala de reuniones", value: formatArea(planArea(unit, "meeting")) },
      { label: "Sanitarios", value: String(unit.bathrooms) },
      { label: "Cocheras", value: String(unit.parkingSpaces) },
    ];
  }
  return [
    { label: "Superficie total", value: formatArea(totalArea(unit)) },
    { label: "Cubierta", value: formatArea(unit.coveredArea) },
    { label: "Balcón", value: unit.balconyArea > 0 ? formatArea(unit.balconyArea) : "—" },
    { label: "Ambientes", value: String(unit.rooms) },
    { label: "Dormitorios", value: String(unit.bedrooms) },
    { label: "Baños", value: formatBathrooms(unit) },
  ];
}

/** "diciembre 2027" → "Dic. 2027" */
export function formatDeliveryShort(delivery: string): string {
  const [month, year] = delivery.split(" ");
  return `${month.charAt(0).toUpperCase()}${month.slice(1, 3)}. ${year}`;
}
