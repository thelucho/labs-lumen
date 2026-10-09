import { describe, expect, it } from "vitest";
import { HALF_D, HALF_W } from "./dimensions";
import { buildVegetation, isClear } from "./vegetationLayout";

const { trees, shrubs } = buildVegetation();
const scattered = trees.filter((t) => t.base === 0);
const street = trees.filter((t) => t.base > 0);

describe("vegetación", () => {
  it("cantidad moderada: 17 árboles y 24 arbustos", () => {
    expect(scattered).toHaveLength(14);
    expect(street.length).toBeGreaterThanOrEqual(3);
    expect(street.length).toBeLessThanOrEqual(6);
    expect(shrubs).toHaveLength(24);
  });

  it("es determinística (siempre el mismo paisaje)", () => {
    expect(buildVegetation()).toEqual(buildVegetation());
  });

  it("nada dentro del edificio, los balcones, la vereda ni la calle", () => {
    for (const t of scattered) expect(isClear(t.x, t.z), `${t.x},${t.z}`).toBe(true);
    for (const s of shrubs) expect(isClear(s.x, s.z), `${s.x},${s.z}`).toBe(true);
  });

  it("los árboles de vereda no tapan la fachada", () => {
    for (const t of street) {
      expect(t.z).toBeGreaterThan(HALF_D);
      expect(Math.abs(t.x)).toBeGreaterThan(HALF_W + 4);
    }
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

describe("vegetación y cámara", () => {
  it("nada a más de 60 m del centro (lejos del primer plano de la cámara)", () => {
    for (const t of trees) expect(Math.hypot(t.x, t.z)).toBeLessThanOrEqual(60);
  });

  it("sin árboles de vereda al oeste (quedarían detrás del texto del hero)", () => {
    for (const t of street) expect(t.x).toBeGreaterThan(0);
  });
});
