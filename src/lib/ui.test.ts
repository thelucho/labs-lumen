import { describe, expect, it } from "vitest";
import { PANEL_WIDTH, freeBand } from "@/lib/ui";

describe("franja libre para el edificio en el hero", () => {
  it("escritorio: entre el bloque editorial y el selector", () => {
    const { left, right } = freeBand(1440, false);
    expect(left).toBeGreaterThanOrEqual(32 + 336);
    expect(right).toBeLessThanOrEqual(1440 - 32 - 160);
  });

  it("con el panel abierto el texto se oculta y la franja termina antes del panel", () => {
    const { left, right } = freeBand(1440, true);
    expect(left).toBe(32);
    expect(right).toBeLessThanOrEqual(1440 - PANEL_WIDTH - 32 - 160);
  });

  it("tablet y mobile (layout apilado): desde el borde hasta el selector", () => {
    for (const width of [360, 390, 768, 1023]) {
      const { left, right } = freeBand(width, false);
      expect(left).toBeLessThanOrEqual(32);
      expect(right).toBeLessThan(width - 160);
      expect(right - left).toBeGreaterThan(120);
    }
  });
});
