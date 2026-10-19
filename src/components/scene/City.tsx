"use client";

import { BufferAttribute, BufferGeometry, Color } from "three";
import { buildCity } from "./cityLayout";
import { InstancedBoxes } from "./InstancedBoxes";
import { cityMaterials, palette3D } from "./materials";

/** El entorno depende solo de la semilla: se calcula una vez por carga. */
export const city = buildCity();

const houseTones = palette3D.houses.map((c) => new Color(c));
const carTones = palette3D.cars.map((c) => new Color(c));
const houseColors = city.houses.map((h) => houseTones[h.tone]);
const carColors = city.cars.map((c) => carTones[c.tone]);

/**
 * Techo a dos aguas unitario (−0.5…0.5), cumbrera a lo largo de X: con caras
 * planas, como las cajas.
 */
function gableGeometry(): BufferGeometry {
  const a: [number, number, number] = [-0.5, -0.5, -0.5];
  const b: [number, number, number] = [0.5, -0.5, -0.5];
  const c: [number, number, number] = [0.5, -0.5, 0.5];
  const d: [number, number, number] = [-0.5, -0.5, 0.5];
  const e: [number, number, number] = [-0.5, 0.5, 0];
  const f: [number, number, number] = [0.5, 0.5, 0];
  const triangles = [
    [a, e, f], [a, f, b], // faldón sur
    [d, c, f], [d, f, e], // faldón norte
    [a, d, e], // hastial oeste
    [b, f, c], // hastial este
    [a, b, c], [a, c, d], // base
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(triangles.flat(2)), 3));
  geometry.computeVertexNormals();
  return geometry;
}

const gable = gableGeometry();

/** Suelo urbano: calzadas, veredas con cordón y pintura vial. Recibe sombras, no proyecta. */
export function CityGround() {
  return (
    <group>
      <InstancedBoxes boxes={city.asphalt} material={cityMaterials.asphalt} castShadow={false} />
      <InstancedBoxes boxes={city.sidewalk} material={cityMaterials.sidewalk} castShadow={false} />
      <InstancedBoxes boxes={city.curb} material={cityMaterials.curb} castShadow={false} />
      <InstancedBoxes boxes={city.marking} material={cityMaterials.marking} castShadow={false} />
    </group>
  );
}

/** Manzanas vecinas de casas bajas, autos y mobiliario urbano. */
export function CityBlocks() {
  return (
    <group>
      <InstancedBoxes boxes={city.houses} colors={houseColors} material={cityMaterials.house} />
      <InstancedBoxes boxes={city.roofFlat} material={cityMaterials.roofFlat} />
      <InstancedBoxes boxes={city.roofTile} material={cityMaterials.roofTile} geometry={gable} />
      <InstancedBoxes boxes={city.windowDark} material={cityMaterials.windowDark} castShadow={false} />
      <InstancedBoxes boxes={city.windowLit} material={cityMaterials.windowLit} castShadow={false} />
      <InstancedBoxes boxes={city.cars} colors={carColors} material={cityMaterials.car} />
      <InstancedBoxes boxes={city.carGlass} material={cityMaterials.carGlass} />
      <InstancedBoxes boxes={city.metal} material={cityMaterials.metal} />
      <InstancedBoxes boxes={city.lamp} material={cityMaterials.lamp} castShadow={false} />
      <InstancedBoxes boxes={city.bench} material={cityMaterials.bench} />
    </group>
  );
}
