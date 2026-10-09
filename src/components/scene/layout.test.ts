import { describe, expect, it } from "vitest";
import { units } from "@/data/building";
import { buildingHeight } from "@/lib/building";
import { HALF_W } from "./dimensions";
import { buildBuildingLayout } from "./layout";

const layout = buildBuildingLayout();

describe("layout del edificio", () => {
  it("un volumen interior por unidad, más PB y SUM", () => {
    const ids = layout.rooms.map((r) => r.id).sort();
    expect(ids).toEqual([...units.map((u) => u.id), "pb", "sum"].sort());
  });

  it("los interiores de A quedan al este y los de B al oeste", () => {
    for (const room of layout.rooms) {
      if (room.id.endsWith("A")) expect(room.box.p[0]).toBeGreaterThan(0);
      if (room.id.endsWith("B")) expect(room.box.p[0]).toBeLessThan(0);
    }
  });

  it("losas de balcón solo sobre el lateral este, una por unidad con balcón", () => {
    const outside = layout.parts.concrete.filter((b) => b.p[0] - b.s[0] / 2 >= HALF_W - 1e-6);
    expect(outside).toHaveLength(units.filter((u) => u.balconyArea > 0).length);
  });

  it("nada sobresale por encima del SUM ni por debajo de la vereda", () => {
    const all = Object.values(layout.parts).flat();
    const top = Math.max(...all.map((b) => b.p[1] + b.s[1] / 2));
    const bottom = Math.min(...all.map((b) => b.p[1] - b.s[1] / 2));
    expect(bottom).toBeCloseTo(0);
    expect(top).toBeLessThan(buildingHeight() + 0.5);
  });
});
