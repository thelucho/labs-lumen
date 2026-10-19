"use client";

import { BufferAttribute, BufferGeometry, Color, CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { CAR, buildCity } from "./cityLayout";
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

/** Habitáculo más angosto que la carrocería (como un auto real): factor sobre Z según la altura. */
function taper(geometry: BufferGeometry) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.getY(i) - 0.95) / 0.2));
    pos.setZ(i, pos.getZ(i) * (1 - 0.12 * t * t * (3 - 2 * t)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Extrusión de un perfil lateral (XY) a lo ancho (Z), centrada. */
function extrude(shape: Shape, width: number, bevel: number): BufferGeometry {
  const depth = width - 2 * bevel;
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  });
  return g.translate(0, 0, -depth / 2);
}

/**
 * Auto de referencia de 4,4 m a lo largo de X, apoyado en y = 0: perfil con
 * capó, parabrisas inclinado, techo, luneta y baúl, pasaruedas y bordes
 * redondeados (bisel). Sin texturas: el color va por instancia.
 */
function carBodyGeometry(): BufferGeometry {
  const s = new Shape();
  const sill = 0.34;
  const arch = 0.4;
  s.moveTo(-2.1, sill);
  s.lineTo(-CAR.wheelBase - arch, sill);
  s.absarc(-CAR.wheelBase, sill, arch, Math.PI, 0, true);
  s.lineTo(CAR.wheelBase - arch, sill);
  s.absarc(CAR.wheelBase, sill, arch, Math.PI, 0, true);
  s.lineTo(2.1, sill);
  s.lineTo(2.14, 0.62); // paragolpes delantero
  s.lineTo(2.0, 0.84); // punta del capó
  s.lineTo(0.95, 0.94); // base del parabrisas
  s.lineTo(0.3, 1.36); // techo
  s.lineTo(-0.95, 1.38);
  s.lineTo(-1.62, 0.98); // base de la luneta
  s.lineTo(-2.08, 0.9); // baúl
  s.lineTo(-2.16, 0.62); // paragolpes trasero
  s.closePath();
  return taper(extrude(s, 1.7, 0.07));
}

/** Vidrios: parabrisas, laterales y luneta, apenas por fuera de la carrocería y por debajo del techo. */
function carGlassGeometry(): BufferGeometry {
  const s = new Shape();
  s.moveTo(0.95, 1.0);
  s.lineTo(0.996, 1.011);
  s.lineTo(0.394, 1.4);
  s.lineTo(-1.082, 1.4);
  s.lineTo(-1.663, 1.053);
  s.lineTo(-1.62, 1.0);
  s.closePath();
  return taper(extrude(s, 1.72, 0));
}

const carBody = carBodyGeometry();
const carGlassShape = carGlassGeometry();
const wheel = new CylinderGeometry(CAR.wheelRadius, CAR.wheelRadius, 0.22, 14).rotateX(Math.PI / 2);

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
      <InstancedBoxes boxes={city.cars} colors={carColors} material={cityMaterials.car} geometry={carBody} />
      <InstancedBoxes boxes={city.carGlass} material={cityMaterials.carGlass} geometry={carGlassShape} />
      <InstancedBoxes boxes={city.wheels} material={cityMaterials.metal} geometry={wheel} />
      <InstancedBoxes boxes={city.metal} material={cityMaterials.metal} />
      <InstancedBoxes boxes={city.lamp} material={cityMaterials.lamp} castShadow={false} />
      <InstancedBoxes boxes={city.bench} material={cityMaterials.bench} />
    </group>
  );
}
