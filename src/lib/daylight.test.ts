import { describe, expect, it } from "vitest";
import { INITIAL_AZIMUTH } from "@/components/scene/camera";
import {
  DAY_END,
  DAY_MARKS,
  DAY_START,
  DEFAULT_HOUR,
  daylightFactor,
  formatHour,
  sunAzimuth,
  sunElevation,
} from "./daylight";

describe("recorrido del sol", () => {
  it("por defecto el sol queda detrás de la cámara inicial, alto", () => {
    expect(sunAzimuth(DEFAULT_HOUR)).toBeCloseTo(INITIAL_AZIMUTH);
    expect(sunElevation(DEFAULT_HOUR)).toBeGreaterThan(40);
    expect(daylightFactor(DEFAULT_HOUR)).toBe(1);
  });

  it("sale por el este, pasa por el norte y se pone por el oeste", () => {
    expect(sunAzimuth(7)).toBeGreaterThan(60);
    expect(sunAzimuth(13)).toBeCloseTo(0);
    expect(sunAzimuth(19)).toBeLessThan(-60);
  });

  it("de noche no hay luz de sol", () => {
    expect(sunElevation(DAY_END)).toBeLessThan(0);
    expect(daylightFactor(21)).toBe(0);
  });

  it("las referencias caen dentro del rango del slider", () => {
    for (const mark of DAY_MARKS) {
      expect(mark.hour).toBeGreaterThanOrEqual(DAY_START);
      expect(mark.hour).toBeLessThanOrEqual(DAY_END);
    }
  });

  it("formatea la hora", () => {
    expect(formatHour(10 + 50 / 60)).toBe("10:50");
    expect(formatHour(6)).toBe("06:00");
  });
});
