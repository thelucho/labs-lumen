"use client";

import { useLayoutEffect, useRef } from "react";
import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type InstancedMesh,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { city } from "./City";
import { frontYard } from "./FrontYard";
import { palette3D } from "./materials";
import { invalidateShadows } from "./shadowCache";
import { buildVegetation, type Tree } from "./vegetationLayout";

const garden = buildVegetation();
const trees = [...garden.trees, ...frontYard.trees, ...city.trees];
const shrubs = [...garden.shrubs, ...frontYard.shrubs, ...city.shrubs];
const round = trees.filter((t) => t.kind === "round");
const columnar = trees.filter((t) => t.kind === "columnar");

const foliageTones = [palette3D.foliage, palette3D.foliageLight, palette3D.foliageDark].map((c) => new Color(c));
const shrubTones = [palette3D.shrub, palette3D.foliage, palette3D.foliageLight].map((c) => new Color(c));

type Lobe = [number, number, number, number];

/** Hash estable de una posición: el mismo vértice repetido se desplaza igual (sin grietas). */
function hash(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Copa de varios lóbulos con la superficie algo irregular y oclusión pintada
 * en los vértices (más oscura abajo y adentro). Se normaliza a `ySpan` de alto
 * y radio 1, para usar las mismas escalas que antes.
 */
function crownGeometry(lobes: Lobe[], detail: number, ySpan: number): BufferGeometry {
  const parts = lobes.map(([x, y, z, r]) => {
    const g = new IcosahedronGeometry(r, detail);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const k = 1 + (hash(vx + x, vy + y, vz + z) - 0.5) * 0.28;
      pos.setXYZ(i, vx * k + x, vy * k + y, vz * k + z);
    }
    return g;
  });
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  merged.computeBoundingBox();
  const bb = merged.boundingBox!;
  const sx = 2 / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  const sy = ySpan / (bb.max.y - bb.min.y);
  const cy = (bb.max.y + bb.min.y) / 2;
  merged.translate(0, -cy, 0);
  merged.scale(sx, sy, sx);

  const pos = merged.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, pos.getY(i) / ySpan + 0.5));
    const shade = 0.55 + 0.45 * t * t * (3 - 2 * t);
    colors.set([shade, shade, shade], i * 3);
  }
  merged.setAttribute("color", new BufferAttribute(colors, 3));
  merged.computeVertexNormals();
  return merged;
}

// Geometrías y materiales compartidos.
const trunkGeometry = new CylinderGeometry(0.6, 1, 1, 7);
const roundGeometry = crownGeometry(
  [
    [0, 0, 0, 0.85],
    [0.55, -0.18, 0.2, 0.6],
    [-0.5, -0.12, -0.25, 0.62],
    [0.1, 0.38, -0.32, 0.55],
    [-0.15, 0.1, 0.55, 0.5],
  ],
  1,
  2,
);
const columnarGeometry = crownGeometry(
  [
    [0, -0.4, 0, 0.55],
    [0.08, 0, -0.05, 0.5],
    [-0.05, 0.38, 0.04, 0.38],
    [0, 0.68, 0, 0.22],
  ],
  1,
  1,
);
const shrubGeometry = crownGeometry(
  [
    [0, 0, 0, 0.8],
    [0.5, -0.1, 0.3, 0.55],
    [-0.45, -0.15, -0.2, 0.5],
  ],
  0,
  2,
);
// Sin flatShading: las geometrías ya traen normales planas (no indexadas), y así no suman variante de shader.
const foliageMaterial = new MeshStandardMaterial({ color: "#ffffff", roughness: 1, vertexColors: true });
const WHITE = new Color("#ffffff");
const trunkMaterial = new MeshStandardMaterial({ color: palette3D.trunk, roughness: 1 });

const TRUNK_RADIUS = 0.16;

/** Copa: centro y escala según el tipo de árbol. */
function crownTransform(t: Tree): { y: number; scale: [number, number, number] } {
  if (t.kind === "columnar") {
    const h = t.height * 0.8;
    return { y: t.height - h / 2, scale: [t.crown, h, t.crown] };
  }
  return { y: t.height - t.crown * 1.05, scale: [t.crown, t.crown * 1.05, t.crown] };
}

function trunkHeight(t: Tree): number {
  return t.kind === "columnar" ? t.height * 0.3 : t.height - t.crown * 1.4;
}

type Placement = { position: [number, number, number]; scale: [number, number, number]; spin: number; color?: Color };

function useInstances(placements: Placement[]) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const euler = new Euler();
    placements.forEach((p, i) => {
      rotation.setFromEuler(euler.set(0, p.spin, 0));
      matrix.compose(position.set(...p.position), rotation, scale.set(...p.scale));
      mesh.setMatrixAt(i, matrix);
      if (p.color) mesh.setColorAt(i, p.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidateShadows();
    return invalidateShadows;
  }, [placements]);
  return ref;
}

// Ubicaciones fijas: el paisaje depende solo de la semilla.
const spin = (i: number) => (i * 2.399) % (Math.PI * 2); // ángulo áureo: variación sin azar
const trunkPlacements: Placement[] = trees.map((t, i) => {
  const h = trunkHeight(t);
  // Blanco por instancia: comparte variante de shader con las cajas instanciadas.
  return { position: [t.x, h / 2, t.z], scale: [TRUNK_RADIUS, h, TRUNK_RADIUS], spin: spin(i), color: WHITE };
});
const crownPlacements = (list: Tree[]): Placement[] =>
  list.map((t, i) => {
    const { y, scale } = crownTransform(t);
    return { position: [t.x, y, t.z], scale, spin: spin(i), color: foliageTones[t.tone] };
  });
const roundPlacements = crownPlacements(round);
const columnarPlacements = crownPlacements(columnar);
const shrubPlacements: Placement[] = shrubs.map((s, i) => ({
  position: [s.x, (s.y ?? 0) + s.radius * 0.45, s.z],
  scale: [s.radius, s.radius * 0.6, s.radius],
  spin: spin(i),
  color: shrubTones[s.tone],
}));

/** Jardín del edificio, arbolado de veredas y árboles de los patios vecinos. */
export function Vegetation() {
  const trunks = useInstances(trunkPlacements);
  const roundCrowns = useInstances(roundPlacements);
  const columnarCrowns = useInstances(columnarPlacements);
  const bushes = useInstances(shrubPlacements);

  return (
    <group>
      <instancedMesh ref={trunks} args={[trunkGeometry, trunkMaterial, trunkPlacements.length]} castShadow />
      <instancedMesh ref={roundCrowns} args={[roundGeometry, foliageMaterial, roundPlacements.length]} castShadow />
      <instancedMesh
        ref={columnarCrowns}
        args={[columnarGeometry, foliageMaterial, columnarPlacements.length]}
        castShadow
      />
      <instancedMesh ref={bushes} args={[shrubGeometry, foliageMaterial, shrubPlacements.length]} castShadow />
    </group>
  );
}
