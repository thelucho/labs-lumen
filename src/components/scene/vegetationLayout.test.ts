import { describe, expect, it } from "vitest";
import { buildVegetation, isClear } from "./vegetationLayout";

const { trees, shrubs } = buildVegetation();

describe("jardín del edificio", () => {
  it("cantidad moderada: 8 árboles y 18 arbustos", () => {
    expect(trees).toHaveLength(8);
    expect(shrubs).toHaveLength(18);
  });

  it("es determinístico (siempre el mismo paisaje)", () => {
    expect(buildVegetation()).toEqual(buildVegetation());
  });

  it("todo dentro del lote, fuera del edificio y los balcones", () => {
    for (const t of trees) expect(isClear(t.x, t.z), `${t.x},${t.z}`).toBe(true);
    for (const s of shrubs) expect(isClear(s.x, s.z), `${s.x},${s.z}`).toBe(true);
  });

  it("ningún par de árboles superpuesto", () => {
    for (let i = 0; i < trees.length; i++) {
      for (let j = i + 1; j < trees.length; j++) {
        const d = Math.hypot(trees[i].x - trees[j].x, trees[i].z - trees[j].z);
        expect(d).toBeGreaterThan(trees[i].crown + trees[j].crown);
      }
    }
  });
});
