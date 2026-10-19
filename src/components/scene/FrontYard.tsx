"use client";

import { Color, IcosahedronGeometry } from "three";
import { buildFrontYard } from "./frontYardLayout";
import { InstancedBoxes } from "./InstancedBoxes";
import { cityMaterials, materials, palette3D } from "./materials";
import { StreetNumber } from "./StreetNumber";

/** El jardín depende solo de la semilla: se calcula una vez por carga. */
export const frontYard = buildFrontYard();

const flowerTones = palette3D.flowers.map((c) => new Color(c));
const flowerColors = frontYard.flowers.map((f) => flowerTones[f.tone]);
const flowerGeometry = new IcosahedronGeometry(1, 0);

/** Jardín de acceso: solados, canteros con flores, balizas y tótem. */
export function FrontYard() {
  return (
    <group>
      <InstancedBoxes boxes={frontYard.paving} material={cityMaterials.paving} castShadow={false} />
      <InstancedBoxes boxes={frontYard.driveway} material={cityMaterials.curb} castShadow={false} />
      <InstancedBoxes boxes={frontYard.concrete} material={materials.concrete} />
      <InstancedBoxes boxes={frontYard.soil} material={cityMaterials.soil} castShadow={false} />
      <InstancedBoxes
        boxes={frontYard.flowers}
        colors={flowerColors}
        geometry={flowerGeometry}
        material={cityMaterials.flower}
        castShadow={false}
      />
      <InstancedBoxes boxes={frontYard.bollards} material={cityMaterials.metal} />
      <InstancedBoxes boxes={frontYard.bollardLights} material={cityMaterials.lamp} castShadow={false} />
      {frontYard.totemText.map((t) => (
        <StreetNumber key={t.text} text={t.text} position={t.p} size={t.size} />
      ))}
    </group>
  );
}
