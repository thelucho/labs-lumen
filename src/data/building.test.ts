import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commonSpaces, floorPlans, levels, showcases, units, type PlanRect } from "@/data/building";
import { buildingHeight, getShowcase, getUnit, hasBalcony, levelElevation, priceByRule, weightedArea } from "@/lib/building";
import { formatPrice, selectableLabel, unitShortLabel, unitTitle } from "@/lib/format";
import { selectLitId, useUIStore } from "@/lib/store";

describe("unidades", () => {
  it("hay 20 unidades con ids únicos: 16 departamentos y 4 oficinas", () => {
    expect(units).toHaveLength(20);
    expect(new Set(units.map((u) => u.id)).size).toBe(20);
    expect(units.filter((u) => u.side === "office")).toHaveLength(4);
  });

  it("pisos 1 a 8 tienen A y B; 9 a 12, una oficina", () => {
    for (let floor = 1; floor <= 12; floor++) {
      const sides = units.filter((u) => u.floor === floor).map((u) => u.side);
      expect(sides).toEqual(floor <= 8 ? ["A", "B"] : ["office"]);
    }
  });

  it("solo las A tienen balcón", () => {
    for (const unit of units) expect(hasBalcony(unit)).toBe(unit.side === "A");
  });

  it("superficies ponderadas de SPEC §5.5", () => {
    expect(weightedArea(getUnit("4A")!)).toBe(118);
    expect(weightedArea(getUnit("4B")!)).toBe(98);
    expect(weightedArea(getUnit("9")!)).toBe(286);
  });

  it("los precios de la tabla cumplen la regla de SPEC §5.5", () => {
    for (const unit of units) expect(unit.price, unit.id).toBe(priceByRule(unit));
  });

  it("estado comercial de SPEC §5.6", () => {
    const byStatus = (s: string) => units.filter((u) => u.status === s).map((u) => u.id).sort();
    expect(byStatus("sold")).toEqual(["2B", "3A", "5B", "7A"]);
    expect(byStatus("reserved")).toEqual(["10", "6A", "8B"]);
    expect(byStatus("available")).toHaveLength(13);
  });

  it("cocheras y bauleras cierran con el subsuelo (24 + 20)", () => {
    expect(units.reduce((n, u) => n + u.parkingSpaces, 0)).toBe(24);
    expect(units.filter((u) => u.hasStorage)).toHaveLength(20);
    expect(commonSpaces.pb.features.join(" ")).toContain("24 cocheras + 20 bauleras");
  });

  it("solo el último piso tiene vista abierta", () => {
    expect(getUnit("12")!.view).toMatch(/vista abierta/);
    expect(getUnit("8A")!.view).not.toMatch(/vista abierta/);
  });
});

describe("niveles", () => {
  it("PB + pisos 1–12 + SUM, con las alturas de SPEC §4.1", () => {
    expect(levels.map((l) => l.label)).toEqual(["PB", ...Array.from({ length: 12 }, (_, i) => String(i + 1)), "SUM"]);
    expect(levels.map((l) => l.height)).toEqual([4.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.4, 3.4, 3.4, 3.4, 3.5]);
    expect(levels.filter((l) => l.kind === "office").map((l) => l.index)).toEqual([9, 10, 11, 12]);
    expect(levelElevation(1)).toBeCloseTo(4.2);
    expect(levelElevation(9)).toBeCloseTo(28.2);
    expect(levelElevation(13)).toBeCloseTo(41.8);
    expect(buildingHeight()).toBeCloseTo(45.3);
  });

  it("cada unidad aparece en su nivel", () => {
    const listed = levels.flatMap((l) => l.unitIds);
    expect(listed.sort()).toEqual(units.map((u) => u.id).sort());
  });

  it("PB y SUM tienen ficha propia; el SUM va sobre el piso 12", () => {
    expect(levels[0].commonSpaceId).toBe("pb");
    expect(levels[levels.length - 1].commonSpaceId).toBe("sum");
    expect(commonSpaces.sum.levelIndex).toBe(13);
    expect(Object.keys(commonSpaces)).toEqual(["pb", "sum"]);
  });
});

describe("formato", () => {
  it("precio con separador de miles", () => {
    expect(formatPrice(359_000)).toBe("USD 359.000");
  });

  it("etiquetas de unidad", () => {
    expect(unitShortLabel(getUnit("4A")!)).toBe("4° A");
    expect(unitShortLabel(getUnit("9")!)).toBe("Oficina 9");
    expect(unitTitle(getUnit("4A")!)).toBe("Piso 4 · Unidad A");
    expect(unitTitle(getUnit("9")!)).toBe("Piso 9 · Oficina");
    expect(selectableLabel("sum")).toBe("SUM");
  });
});

describe("store", () => {
  it("una sola unidad encendida: hover manda, si no la seleccionada", () => {
    const { select, setHovered, closeDetail } = useUIStore.getState();
    select("4A");
    expect(selectLitId(useUIStore.getState())).toBe("4A");
    setHovered("5B");
    expect(selectLitId(useUIStore.getState())).toBe("5B");
    setHovered(null);
    expect(selectLitId(useUIStore.getState())).toBe("4A");
    closeDetail();
    expect(useUIStore.getState()).toMatchObject({ selectedId: null, isDetailOpen: false });
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
  it("mantiene el lado y pasa por oficinas, PB y SUM", async () => {
    const { adjacentSelectable } = await import("@/lib/building");
    expect(adjacentSelectable("4A", 1)).toBe("5A");
    expect(adjacentSelectable("4B", -1)).toBe("3B");
    expect(adjacentSelectable("1B", -1)).toBe("pb");
    expect(adjacentSelectable("pb", -1)).toBeNull();
    expect(adjacentSelectable("pb", 1)).toBe("1A");
    expect(adjacentSelectable("8B", 1)).toBe("9");
    expect(adjacentSelectable("9", -1)).toBe("8A");
    expect(adjacentSelectable("12", 1)).toBe("sum");
    expect(adjacentSelectable("sum", 1)).toBeNull();
  });
});

describe("contenido de la landing", () => {
  it("entrega corta y precio desde coherentes con los datos", async () => {
    const { formatDeliveryShort } = await import("@/lib/format");
    const { minAvailablePrice } = await import("@/lib/building");
    expect(formatDeliveryShort("diciembre 2027")).toBe("Dic. 2027");
    // 1B (277.000) está disponible: es el menor.
    expect(minAvailablePrice()).toBe(277_000);
  });

  it("el texto del proyecto usa las mismas cifras que los datos", async () => {
    const { about, project } = await import("@/data/building");
    const text = about.join(" ");
    const a = getUnit("4A")!;
    const office = getUnit("9")!;
    for (const fragment of [
      `${project.footprint.width} m de frente`,
      `${a.balconyArea} m²`,
      `${office.coveredArea} m²`,
      "doce pisos",
    ]) {
      expect(text).toContain(fragment);
    }
  });
});

describe("fichas fullscreen", () => {
  it("cada unidad, PB y SUM tiene ficha con portada dentro de la galería", () => {
    for (const id of [...units.map((u) => u.id), "pb", "sum"]) {
      const showcase = getShowcase(id);
      expect(showcase, id).toBeDefined();
      expect(showcase!.gallery).toContain(showcase!.cover);
    }
  });

  it("todas las fotos existen en public/ y tienen texto alternativo", () => {
    for (const showcase of Object.values(showcases)) {
      for (const photo of showcase.gallery) {
        expect(existsSync(join("public", photo.src)), photo.src).toBe(true);
        expect(photo.alt.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("planos tipo folleto", () => {
  const area = (rects: PlanRect[]) => rects.reduce((n, [, , w, d]) => n + w * d, 0);

  it("los ambientes suman la superficie cubierta y el balcón la suya", () => {
    for (const unit of [getUnit("4A")!, getUnit("4B")!, getUnit("9")!]) {
      const plan = floorPlans[unit.side];
      const rooms = plan.rooms.filter((r) => r.kind !== "balcony");
      const balcony = plan.rooms.filter((r) => r.kind === "balcony");
      expect(rooms.reduce((n, r) => n + area(r.rects), 0), unit.id).toBeCloseTo(unit.coveredArea, 1);
      expect(balcony.reduce((n, r) => n + area(r.rects), 0), unit.id).toBeCloseTo(unit.balconyArea, 1);
      expect(plan.width * plan.depth, unit.id).toBeCloseTo(unit.coveredArea, 1);
    }
  });

  it("los ambientes no se superponen y entran en la planta", () => {
    for (const plan of Object.values(floorPlans)) {
      const rects = plan.rooms.filter((r) => r.kind !== "balcony").flatMap((r) => r.rects);
      for (const [x, y, w, d] of rects) {
        expect(x >= 0 && y >= 0 && x + w <= plan.width + 1e-9 && y + d <= plan.depth + 1e-9).toBe(true);
      }
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const [ax, ay, aw, ad] = rects[i];
          const [bx, by, bw, bd] = rects[j];
          const overlap = ax < bx + bw - 1e-9 && bx < ax + aw - 1e-9 && ay < by + bd - 1e-9 && by < ay + ad - 1e-9;
          expect(overlap).toBe(false);
        }
      }
    }
  });

  it("cada plano de departamento tiene los dormitorios y baños de su tipología", () => {
    for (const unit of [getUnit("4A")!, getUnit("4B")!]) {
      const kinds = floorPlans[unit.side].rooms.map((r) => r.kind);
      expect(kinds.filter((k) => k === "bedroom"), unit.id).toHaveLength(unit.bedrooms);
      expect(kinds.filter((k) => k === "bath"), unit.id).toHaveLength(unit.bathrooms);
      expect(kinds.includes("toilet"), unit.id).toBe(unit.hasToilette);
    }
  });
});
