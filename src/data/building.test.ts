import { describe, expect, it } from "vitest";
import { commonSpaces, levels, units } from "@/data/building";
import { buildingHeight, getUnit, hasBalcony, levelElevation, priceByRule, weightedArea } from "@/lib/building";
import { formatPrice, selectableLabel, unitShortLabel, unitTitle } from "@/lib/format";
import { selectLitId, useUIStore } from "@/lib/store";

describe("unidades", () => {
  it("hay 14 unidades con ids únicos", () => {
    expect(units).toHaveLength(14);
    expect(new Set(units.map((u) => u.id)).size).toBe(14);
  });

  it("pisos 1 y 8 son piso completo; 2 a 7 tienen A y B", () => {
    for (let floor = 1; floor <= 8; floor++) {
      const sides = units.filter((u) => u.floor === floor).map((u) => u.side);
      expect(sides).toEqual(floor === 1 || floor === 8 ? ["full"] : ["A", "B"]);
    }
  });

  it("todas las A y los pisos completos tienen balcón; las B no", () => {
    for (const unit of units) expect(hasBalcony(unit)).toBe(unit.side !== "B");
  });

  it("superficies ponderadas de SPEC §5.5", () => {
    expect(weightedArea(getUnit("4A")!)).toBe(118);
    expect(weightedArea(getUnit("4B")!)).toBe(98);
    expect(weightedArea(getUnit("1")!)).toBe(222);
  });

  it("los precios de la tabla cumplen la regla de SPEC §5.5", () => {
    for (const unit of units) expect(unit.price, unit.id).toBe(priceByRule(unit));
  });

  it("estado comercial de SPEC §5.6", () => {
    const byStatus = (s: string) => units.filter((u) => u.status === s).map((u) => u.id).sort();
    expect(byStatus("sold")).toEqual(["2B", "3A", "5B"]);
    expect(byStatus("reserved")).toEqual(["6A", "8"]);
    expect(byStatus("available")).toHaveLength(9);
  });

  it("cocheras y bauleras cierran con el subsuelo (16 + 14)", () => {
    expect(units.reduce((n, u) => n + u.parkingSpaces, 0)).toBe(16);
    expect(units.filter((u) => u.hasStorage)).toHaveLength(14);
  });

  it("solo el piso 8 tiene vista abierta", () => {
    expect(getUnit("8")!.view).toMatch(/vista abierta/);
    expect(getUnit("1")!.view).not.toMatch(/vista abierta/);
  });
});

describe("niveles", () => {
  it("PB + pisos 1–8 + SUM, con las alturas de SPEC §4.1", () => {
    expect(levels.map((l) => l.label)).toEqual(["PB", "1", "2", "3", "4", "5", "6", "7", "8", "SUM"]);
    expect(levels.map((l) => l.height)).toEqual([4.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.5]);
    expect(levelElevation(1)).toBeCloseTo(4.2);
    expect(levelElevation(9)).toBeCloseTo(28.2);
    expect(buildingHeight()).toBeCloseTo(31.7);
  });

  it("cada unidad aparece en su nivel", () => {
    const listed = levels.flatMap((l) => l.unitIds);
    expect(listed.sort()).toEqual(units.map((u) => u.id).sort());
  });

  it("PB y SUM tienen ficha propia", () => {
    expect(levels[0].commonSpaceId).toBe("pb");
    expect(levels[9].commonSpaceId).toBe("sum");
    expect(Object.keys(commonSpaces)).toEqual(["pb", "sum"]);
  });
});

describe("formato", () => {
  it("precio con separador de miles", () => {
    expect(formatPrice(359_000)).toBe("USD 359.000");
  });

  it("etiquetas de unidad", () => {
    expect(unitShortLabel(getUnit("4A")!)).toBe("4° A");
    expect(unitShortLabel(getUnit("1")!)).toBe("Piso 1 completo");
    expect(unitTitle(getUnit("4A")!)).toBe("Piso 4 · Unidad A");
    expect(selectableLabel("sum")).toBe("SUM");
  });
});

describe("store", () => {
  it("una sola unidad encendida: hover manda, si no la seleccionada", () => {
    const { select, setHovered, closePanel } = useUIStore.getState();
    select("4A");
    expect(selectLitId(useUIStore.getState())).toBe("4A");
    setHovered("5B");
    expect(selectLitId(useUIStore.getState())).toBe("5B");
    setHovered(null);
    expect(selectLitId(useUIStore.getState())).toBe("4A");
    closePanel();
    expect(useUIStore.getState()).toMatchObject({ selectedId: null, isPanelOpen: false });
  });

  it("el primer hover corta la auto-rotación y no se revierte", () => {
    useUIStore.setState({ hasInteracted: false, hoveredId: null });
    const { setHovered } = useUIStore.getState();
    setHovered(null);
    expect(useUIStore.getState().hasInteracted).toBe(false);
    setHovered("pb");
    setHovered(null);
    expect(useUIStore.getState().hasInteracted).toBe(true);
  });
});

describe("navegación entre pisos", () => {
  it("mantiene el lado y pasa por pisos completos, PB y SUM", async () => {
    const { adjacentSelectable } = await import("@/lib/building");
    expect(adjacentSelectable("4A", 1)).toBe("5A");
    expect(adjacentSelectable("4B", -1)).toBe("3B");
    expect(adjacentSelectable("2B", -1)).toBe("1");
    expect(adjacentSelectable("1", -1)).toBe("pb");
    expect(adjacentSelectable("pb", -1)).toBeNull();
    expect(adjacentSelectable("1", 1)).toBe("2A");
    expect(adjacentSelectable("7B", 1)).toBe("8");
    expect(adjacentSelectable("8", 1)).toBe("sum");
    expect(adjacentSelectable("sum", 1)).toBeNull();
  });
});
