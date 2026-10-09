import { describe, expect, it } from "vitest";
import { units } from "@/data/building";
import { buildingHeight } from "@/lib/building";
import { HALF_W } from "./dimensions";
import { buildBuildingLayout, type Box } from "./layout";

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

  describe("sin z-fighting visible (caras en el mismo plano que parpadean al girar)", () => {
    type Bounds = { min: number[]; max: number[] };
    const bounds = (b: Box): Bounds => ({
      min: b.p.map((c, i) => c - b.s[i] / 2),
      max: b.p.map((c, i) => c + b.s[i] / 2),
    });
    const EPS = 1e-4;
    const overlaps = (a: Bounds, b: Bounds, axis: number) =>
      Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]) > 1e-3;
    const faces = (b: Bounds, axis: number) => [b.min[axis], b.max[axis]];
    const sharePlane = (a: Bounds, b: Bounds, axis: number) =>
      [0, 1, 2].filter((k) => k !== axis).every((k) => overlaps(a, b, k)) &&
      faces(a, axis).some((fa) => faces(b, axis).some((fb) => Math.abs(fa - fb) < EPS));

    it("los interiores no comparten plano con ninguna pieza (se ven por dentro, BackSide)", () => {
      const parts = Object.entries(layout.parts).flatMap(([key, list]) =>
        list.map((b) => ({ key, b: bounds(b) })),
      );
      const conflicts = new Set<string>();
      for (const room of layout.rooms) {
        const r = bounds(room.box);
        for (const { key, b } of parts) {
          for (let axis = 0; axis < 3; axis++) {
            if (sharePlane(r, b, axis)) conflicts.add(`${room.id} / ${key} en ${"xyz"[axis]}`);
          }
        }
      }
      expect([...conflicts]).toEqual([]);
    });

    it("montantes y travesaños no quedan al ras de los paños de revestimiento", () => {
      const panels = layout.parts.cladding.map(bounds);
      const frames = layout.parts.frame.map(bounds);
      let conflicts = 0;
      for (const p of panels) {
        for (const f of frames) {
          // Solo el plano de fachada (normal en x o z).
          for (const axis of [0, 2]) {
            const thin = p.max[axis] - p.min[axis] < 0.2;
            if (!thin || !sharePlane(p, f, axis)) continue;
            const outer = [p.min[axis], p.max[axis]];
            if (outer.some((v) => Math.abs(v - f.min[axis]) < EPS || Math.abs(v - f.max[axis]) < EPS)) {
              conflicts++;
            }
          }
        }
      }
      expect(conflicts).toBe(0);
    });
  });
});
