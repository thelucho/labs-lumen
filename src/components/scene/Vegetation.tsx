"use client";

import { useLayoutEffect, useRef } from "react";
import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from "three";
import { palette3D } from "./materials";
import { buildVegetation, type Tree } from "./vegetationLayout";

const { trees, shrubs } = buildVegetation();
const round = trees.filter((t) => t.kind === "round");
const columnar = trees.filter((t) => t.kind === "columnar");

const foliageTones = [palette3D.foliage, palette3D.foliageLight, palette3D.foliageDark].map((c) => new Color(c));
const shrubTones = [palette3D.shrub, palette3D.foliage, palette3D.foliageLight].map((c) => new Color(c));

// Geometrías y materiales compartidos (low-poly, sombreado plano como las nubes).
const trunkGeometry = new CylinderGeometry(0.7, 1, 1, 6);
const roundGeometry = new IcosahedronGeometry(1, 1);
const columnarGeometry = new ConeGeometry(1, 1, 7);
const shrubGeometry = new IcosahedronGeometry(1, 0);
const foliageMaterial = new MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true });
const trunkMaterial = new MeshStandardMaterial({ color: palette3D.trunk, roughness: 1 });

const TRUNK_RADIUS = 0.16;

/** Copa: centro y escala según el tipo de árbol. */
function crownTransform(t: Tree): { y: number; scale: [number, number, number] } {
  if (t.kind === "columnar") {
    const h = t.height * 0.8;
    return { y: t.base + t.height - h / 2, scale: [t.crown, h, t.crown] };
  }
  return { y: t.base + t.height - t.crown * 1.05, scale: [t.crown, t.crown * 1.05, t.crown] };
}

function trunkHeight(t: Tree): number {
  return t.kind === "columnar" ? t.height * 0.3 : t.height - t.crown * 1.6;
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
  }, [placements]);
  return ref;
}

// Ubicaciones fijas: el paisaje depende solo de la semilla.
const spin = (i: number) => (i * 2.399) % (Math.PI * 2); // ángulo áureo: variación sin azar
const trunkPlacements: Placement[] = trees.map((t, i) => {
  const h = trunkHeight(t);
  return { position: [t.x, t.base + h / 2, t.z], scale: [TRUNK_RADIUS, h, TRUNK_RADIUS], spin: spin(i) };
});
const crownPlacements = (list: Tree[]): Placement[] =>
  list.map((t, i) => {
    const { y, scale } = crownTransform(t);
    return { position: [t.x, y, t.z], scale, spin: spin(i), color: foliageTones[t.tone] };
  });
const roundPlacements = crownPlacements(round);
const columnarPlacements = crownPlacements(columnar);
const shrubPlacements: Placement[] = shrubs.map((s, i) => ({
  position: [s.x, s.radius * 0.45, s.z],
  scale: [s.radius, s.radius * 0.6, s.radius],
  spin: spin(i),
  color: shrubTones[s.tone],
}));

/** Árboles y arbustos alrededor del edificio (SPEC §4.3). */
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
