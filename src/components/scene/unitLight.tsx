"use client";

import { createRef } from "react";
import type { PointLight } from "three";
import { palette3D } from "./materials";

export const UNIT_LIGHT = { intensity: 90, distance: 10, decay: 2 };

/** Referencia compartida: Rooms la mueve a la unidad activa y le anima la intensidad. */
export const unitLightRef = createRef<PointLight>();

/**
 * Única luz puntual de las unidades (SPEC §4.4). Se monta desde el primer
 * cuadro, apagada: en three.js la cantidad de luces es parte del shader, y
 * sumarla más tarde recompilaría todos los materiales de golpe.
 */
export function UnitLight() {
  return (
    <pointLight
      ref={unitLightRef}
      intensity={0}
      distance={UNIT_LIGHT.distance}
      decay={UNIT_LIGHT.decay}
      color={palette3D.unitLight}
    />
  );
}
