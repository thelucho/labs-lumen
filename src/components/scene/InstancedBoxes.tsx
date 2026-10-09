"use client";

import { useLayoutEffect, useRef } from "react";
import { Matrix4, Quaternion, Vector3, type InstancedMesh, type Material } from "three";
import type { Box } from "./layout";
import { unitBox } from "./materials";
import { invalidateShadows } from "./shadowCache";

interface Props {
  boxes: Box[];
  material: Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/** Todas las cajas de un mismo material en un único InstancedMesh. */
export function InstancedBoxes({ boxes, material, castShadow = true, receiveShadow = true }: Props) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const rotation = new Quaternion();
    const position = new Vector3();
    const scale = new Vector3();
    boxes.forEach((b, i) => {
      matrix.compose(position.set(...b.p), rotation, scale.set(...b.s));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidateShadows();
    return invalidateShadows;
  }, [boxes]);

  if (boxes.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[unitBox, material, boxes.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}
