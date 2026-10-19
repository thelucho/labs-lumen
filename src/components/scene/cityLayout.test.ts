import { describe, expect, it } from "vitest";
import { LOW_HEIGHT, LOW_RADIUS, buildCity, inFrontView } from "./cityLayout";
import { URBAN } from "./dimensions";
import type { Box } from "./layout";

const city = buildCity();
const { lot, sidewalk, street } = URBAN;

const covers = (b: Box, x: number, z: number) =>
  Math.abs(x - b.p[0]) <= b.s[0] / 2 && Math.abs(z - b.p[2]) <= b.s[2] / 2;

/** Superposición en planta de dos cajas (con tolerancia por bordes compartidos). */
const overlaps = (a: Box, b: Box) =>
  Math.abs(a.p[0] - b.p[0]) < (a.s[0] + b.s[0]) / 2 - 1e-6 &&
  Math.abs(a.p[2] - b.p[2]) < (a.s[2] + b.s[2]) / 2 - 1e-6;

describe("entorno urbano", () => {
  it("es determinístico", () => {
    expect(buildCity()).toEqual(buildCity());
  });

  it("hay calle al frente, a los dos costados y atrás del edificio", () => {
    const off = sidewalk + street / 2;
    const midZ = (lot.z[0] + lot.z[1]) / 2;
    const points: [number, number][] = [
      [0, lot.z[1] + off],
      [0, lot.z[0] - off],
      [lot.x[1] + off, midZ],
      [lot.x[0] - off, midZ],
    ];
    for (const [x, z] of points) {
      expect(city.asphalt.some((b) => covers(b, x, z)), `${x},${z}`).toBe(true);
    }
  });

  it("calzadas sin superposición entre sí ni con veredas (sin parpadeo)", () => {
    const near = (b: Box) => Math.hypot(b.p[0], b.p[2]) < 120;
    const roads = city.asphalt.filter((b) => Math.abs(b.p[0]) < 200 && Math.abs(b.p[2]) < 200);
    const walks = [...city.sidewalk, ...city.curb].filter(near);
    for (let i = 0; i < roads.length; i++) {
      for (let j = i + 1; j < roads.length; j++) expect(overlaps(roads[i], roads[j])).toBe(false);
      for (const w of walks) expect(overlaps(roads[i], w)).toBe(false);
    }
  });

  it("ninguna casa dentro del lote del edificio", () => {
    for (const h of city.houses) {
      const inside =
        h.p[0] > lot.x[0] && h.p[0] < lot.x[1] && h.p[2] > lot.z[0] && h.p[2] < lot.z[1];
      expect(inside).toBe(false);
    }
  });

  it("frente al edificio (su vereda, la calle y la vereda de enfrente) no hay árboles ni columnas", () => {
    for (const t of city.trees) expect(inFrontView(t.x, t.z), `${t.x},${t.z}`).toBe(false);
    for (const l of city.lamp) expect(inFrontView(l.p[0], l.p[2])).toBe(false);
  });

  it("no se estaciona frente al acceso ni al portón de cocheras", () => {
    const front = (x: number, z: number) => z > lot.z[1] && z < lot.z[1] + sidewalk + 2.5 && Math.abs(x) < 14;
    for (const c of city.cars) expect(front(c.p[0], c.p[2])).toBe(false);
  });

  it("anillo bajo alrededor del edificio: no tapa la PB desde la cámara lejana de mobile", () => {
    for (const h of city.houses) {
      if (Math.hypot(h.p[0], h.p[2]) < LOW_RADIUS) expect(h.s[1]).toBeLessThanOrEqual(LOW_HEIGHT.house);
    }
    for (const t of city.trees) {
      if (Math.hypot(t.x, t.z) < LOW_RADIUS) expect(t.height).toBeLessThanOrEqual(LOW_HEIGHT.tree + 1e-9);
    }
  });

  it("pocos autos estacionados (~20 % de los lugares que había: 309 → 65)", () => {
    const cars = city.carGlass.length; // un habitáculo por auto
    expect(cars).toBeGreaterThan(30);
    expect(cars).toBeLessThan(80);
  });

  it("casas bajas: hasta dos plantas", () => {
    for (const h of city.houses) expect(h.s[1]).toBeLessThanOrEqual(6.5);
  });
});
