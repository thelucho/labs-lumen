import { describe, expect, it } from "vitest";
import { HALF_D } from "./dimensions";
import { buildVegetation, isClear } from "./vegetationLayout";

const { trees, shrubs } = buildVegetation();

describe("vegetación", () => {
  it("cantidad moderada: 14 árboles y 24 arbustos", () => {
    expect(trees).toHaveLength(14);
    expect(shrubs).toHaveLength(24);
  });

  it("es determinística (siempre el mismo paisaje)", () => {
    expect(buildVegetation()).toEqual(buildVegetation());
  });

  it("nada dentro del edificio, los balcones, la vereda ni la calle", () => {
    for (const t of trees) expect(isClear(t.x, t.z), `${t.x},${t.z}`).toBe(true);
    for (const s of shrubs) expect(isClear(s.x, s.z), `${s.x},${s.z}`).toBe(true);
  });

  it("sin árboles sobre la vereda", () => {
    const onSidewalk = trees.filter((t) => t.z > HALF_D && t.z < HALF_D + 4 && Math.abs(t.x) < 45);
    expect(onSidewalk).toEqual([]);
  });

  it("ningún par de árboles superpuesto", () => {
    for (let i = 0; i < trees.length; i++) {
      for (let j = i + 1; j < trees.length; j++) {
        const d = Math.hypot(trees[i].x - trees[j].x, trees[i].z - trees[j].z);
        expect(d).toBeGreaterThan(trees[i].crown + trees[j].crown);
      }
    }
  });

  it("nada a más de 60 m del centro (lejos del primer plano de la cámara)", () => {
    for (const t of trees) expect(Math.hypot(t.x, t.z)).toBeLessThanOrEqual(60);
  });
});
