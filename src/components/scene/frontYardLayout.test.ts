import { describe, expect, it } from "vitest";
import { FRONT_SETBACK, GROUND, HALF_D, HALF_W, URBAN } from "./dimensions";
import { buildFrontYard } from "./frontYardLayout";
import type { Box } from "./layout";

const yard = buildFrontYard();
const inLot = (b: Box) =>
  b.p[0] - b.s[0] / 2 >= URBAN.lot.x[0] &&
  b.p[0] + b.s[0] / 2 <= URBAN.lot.x[1] &&
  b.p[2] - b.s[2] / 2 >= HALF_D - 1e-9 &&
  b.p[2] + b.s[2] / 2 <= URBAN.lot.z[1] + 1e-9;

describe("jardín de acceso", () => {
  it("el edificio queda retirado de la vereda", () => {
    expect(FRONT_SETBACK).toBeGreaterThanOrEqual(5);
  });

  it("es determinístico", () => {
    expect(buildFrontYard()).toEqual(buildFrontYard());
  });

  it("todo dentro del retiro de frente del lote", () => {
    for (const b of [...yard.paving, ...yard.driveway, ...yard.concrete, ...yard.soil, ...yard.bollards]) {
      expect(inLot(b), JSON.stringify(b.p)).toBe(true);
    }
  });

  it("el camino llega de la vereda a la puerta y la entrada vehicular al portón", () => {
    const [d0, d1] = GROUND.entrance.door;
    const door = (d0 + d1) / 2;
    const reachesDoor = yard.paving.some((b) => Math.abs(b.p[0] - door) < b.s[0] / 2 && b.p[2] - b.s[2] / 2 <= HALF_D + 1e-9);
    const reachesStreet = yard.paving.some((b) => Math.abs(b.p[0] - door) < b.s[0] / 2 && b.p[2] + b.s[2] / 2 >= URBAN.lot.z[1] - 1e-9);
    expect(reachesDoor && reachesStreet).toBe(true);
    const garage = (GROUND.garageX + HALF_W) / 2;
    expect(yard.driveway.some((b) => Math.abs(b.p[0] - garage) < b.s[0] / 2)).toBe(true);
  });

  it("los canteros no cruzan el camino ni la entrada vehicular", () => {
    for (const p of yard.planters) {
      for (const b of [...yard.paving, ...yard.driveway]) {
        const overlapX = p.x0 < b.p[0] + b.s[0] / 2 && p.x1 > b.p[0] - b.s[0] / 2;
        const overlapZ = p.z0 < b.p[2] + b.s[2] / 2 && p.z1 > b.p[2] - b.s[2] / 2;
        expect(overlapX && overlapZ).toBe(false);
      }
    }
  });

  it("hay flores en los canteros", () => {
    expect(yard.flowers.length).toBeGreaterThan(100);
  });
});
