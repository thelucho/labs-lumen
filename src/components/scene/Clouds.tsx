"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import {
  IcosahedronGeometry,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
} from "three";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { skyPoint } from "./camera";
import { palette3D } from "./materials";

/** Forma base de una nube: bollos [x, y, z, radio] en unidades de la nube. */
const PUFFS: [number, number, number, number][] = [
  [0, 0, 0, 1],
  [1.1, -0.15, 0.2, 0.8],
  [-1.15, -0.2, -0.1, 0.75],
  [0.45, 0.45, -0.25, 0.7],
  [-0.5, 0.35, 0.3, 0.6],
  [2, -0.35, 0, 0.5],
];

/** Nubes: [azimut, distancia en planta, altura, escala, giro]. Tres en el encuadre inicial. */
const CLOUDS: [number, number, number, number, number][] = [
  [219, 300, 66, 7.5, 0.3],
  [196, 340, 74, 9, 1.2],
  [240, 280, 42, 5.5, 2.1],
  [115, 280, 66, 7, 0.8],
  [330, 300, 70, 6.5, 2.6],
];

/** Radianes por segundo: una vuelta completa en ~25 minutos. */
const DRIFT = 0.004;

const geometry = new IcosahedronGeometry(1, 1);
const material = new MeshStandardMaterial({
  color: palette3D.cloud,
  emissive: palette3D.cloud,
  emissiveIntensity: 0.45,
  roughness: 1,
  flatShading: true,
  fog: false,
});

export function Clouds() {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const yaw = new Quaternion();
    const up = new Vector3(0, 1, 0);
    let i = 0;
    for (const [azimuth, distance, height, size, turn] of CLOUDS) {
      const [x, , z] = skyPoint(azimuth, 0, distance);
      yaw.setFromAxisAngle(up, turn);
      for (const [px, py, pz, r] of PUFFS) {
        const offset = new Vector3(px, py * 0.8, pz).applyQuaternion(yaw).multiplyScalar(size);
        position.set(x + offset.x, height + offset.y, z + offset.z);
        scale.set(r * size, r * size * 0.7, r * size);
        matrix.compose(position, yaw, scale);
        m.setMatrixAt(i++, matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    group.current.rotation.y += delta * DRIFT;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, material, CLOUDS.length * PUFFS.length]} />
    </group>
  );
}
