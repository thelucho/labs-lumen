"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import {
  Color,
  Matrix4,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type InstancedMesh,
  type Material,
  type Object3D,
} from "three";
import type { Box } from "./layout";
import { unitBox } from "./materials";
import { SHADOW_EVERY, riseFront, riseStep, startRise } from "./rise";
import { invalidateShadows } from "./shadowCache";

const WHITE = new Color("#ffffff");
const UP = new Vector3(0, 1, 0);

interface Props {
  boxes: Box[];
  material: Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** Color por instancia (multiplica el del material). */
  colors?: Color[];
  /** Geometría unitaria centrada (por defecto, el cubo compartido). */
  geometry?: BufferGeometry;
  /** Pieza del edificio: entra con la animación de construcción (rise.ts). */
  rise?: boolean;
}

const matrix = new Matrix4();
const rotation = new Quaternion();
const position = new Vector3();
const scale = new Vector3();

/** Matriz de una caja recortada a la altura `front` (sin recorte: Infinity; oculta: altura 0). */
function setBox(mesh: InstancedMesh, i: number, b: Box, front: number) {
  rotation.setFromAxisAngle(UP, b.r ?? 0);
  const bottom = b.p[1] - b.s[1] / 2;
  const top = Math.min(b.p[1] + b.s[1] / 2, front);
  const height = Math.max(0, top - bottom);
  if (height === b.s[1]) {
    matrix.compose(position.set(...b.p), rotation, scale.set(...b.s));
  } else {
    // Escala casi nula (no 0: evita matrices singulares en las normales).
    const h = Math.max(height, 1e-4);
    matrix.compose(position.set(b.p[0], bottom + h / 2, b.p[2]), rotation, scale.set(b.s[0], h, b.s[2]));
    if (height === 0) matrix.makeScale(0, 0, 0);
  }
  mesh.setMatrixAt(i, matrix);
}

/** Visible de verdad: el objeto y todos sus padres (las etapas se muestran al compilar). */
function isShown(object: Object3D | null): boolean {
  for (let o = object; o; o = o.parent) if (!o.visible) return false;
  return true;
}

/** Todas las cajas de un mismo material en un único InstancedMesh. */
export function InstancedBoxes({
  boxes,
  material,
  castShadow = true,
  receiveShadow = true,
  colors,
  geometry = unitBox,
  rise = false,
}: Props) {
  const ref = useRef<InstancedMesh>(null);
  const settled = useRef(!rise);
  const shadowStep = useRef(-2);
  const lastFront = useRef<number | null>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    boxes.forEach((b, i) => {
      setBox(mesh, i, b, Infinity);
      // Siempre con color por instancia (blanco si no hay): todas las mallas
      // instanciadas comparten variante de shader y se compila menos al cargar.
      mesh.setColorAt(i, colors?.[i] ?? WHITE);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Esfera envolvente con el edificio completo: no se recorta durante la animación.
    mesh.computeBoundingSphere();
    invalidateShadows();
    return invalidateShadows;
  }, [boxes, colors]);

  // Construcción: recorta cada caja a la altura del frente de obra mientras dura.
  useFrame((state) => {
    const mesh = ref.current;
    if (settled.current || !mesh) return;
    const now = performance.now();
    if (isShown(mesh)) startRise(now);
    const front = riseFront(now);
    // Mientras espera (oculto) o si no se movió, no hay nada que recalcular ni subir a la GPU.
    if (front === lastFront.current) return;
    lastFront.current = front;
    boxes.forEach((b, i) => setBox(mesh, i, b, front));
    mesh.instanceMatrix.needsUpdate = true;
    // El mapa de sombras está congelado: mientras sube, se recalcula cada pocos
    // pisos y al terminar (no por cuadro: es la parte cara del render).
    const step = front === Infinity ? Infinity : Math.floor(riseStep(now) / SHADOW_EVERY);
    if (step !== shadowStep.current) {
      shadowStep.current = step;
      state.gl.shadowMap.needsUpdate = true;
    }
    if (front === Infinity) settled.current = true;
  });

  if (boxes.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, boxes.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}
