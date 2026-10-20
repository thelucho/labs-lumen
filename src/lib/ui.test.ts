import { describe, expect, it } from "vitest";
import { freeBand } from "@/lib/ui";

describe("franja libre para el edificio en el hero", () => {
  it("escritorio: entre el bloque editorial y el selector", () => {
    const { left, right } = freeBand(1440);
    expect(left).toBeGreaterThanOrEqual(24 + 400);
    expect(right).toBeLessThanOrEqual(1440 - 24 - 160);
  });

  it("tablet y mobile (layout apilado): desde el borde hasta el selector", () => {
    for (const width of [360, 390, 768, 1023]) {
      const { left, right } = freeBand(width);
      expect(left).toBeLessThanOrEqual(32);
      expect(right).toBeLessThan(width - 160);
      expect(right - left).toBeGreaterThan(120);
    }
  });
});
