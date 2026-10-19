"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ComponentRef } from "react";
import { Fog, MathUtils, Vector3, type PerspectiveCamera } from "three";
import { project } from "@/data/building";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useUIStore } from "@/lib/store";
import { freeBand } from "@/lib/ui";
import { DISTANCE, ELEVATION, FOV, MAX_DISTANCE, TARGET, fogRange } from "./camera";

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;

/** Ángulo polar de la cámara inicial (desde la vertical). */
const POLAR = Math.atan2(DISTANCE, ELEVATION);
/** Margen vertical casi nulo: la rotación es esencialmente horizontal (SPEC §4.4). */
const POLAR_RANGE = (4 * Math.PI) / 180;

/** Ancho que tiene que entrar en pantalla: diagonal de la planta más los balcones. */
const FIT_WIDTH = Math.hypot(project.footprint.width, project.footprint.depth) + 4;

/** Distancia de cámara para que el edificio entre en `fraction` del ancho. */
function distanceFor(aspect: number, fraction: number): number {
  const halfH = Math.tan(((FOV / 2) * Math.PI) / 180);
  const fitWidth = FIT_WIDTH / 2 / (halfH * aspect * fraction);
  return Math.min(MAX_DISTANCE, Math.max(Math.hypot(DISTANCE, ELEVATION), fitWidth));
}

/**
 * Encuadre según pantalla: el edificio entra en la franja libre entre el texto
 * del hero y el selector. Usa setViewOffset: desplaza la imagen sin mover el
 * centro de rotación.
 */
function Framing() {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const get = useThree((s) => s.get);
  const reducedMotion = usePrefersReducedMotion();

  const band = freeBand(width);
  const fraction = (band.right - band.left) / width;
  const targetShift = width / 2 - (band.left + band.right) / 2;
  const shift = useRef(0);

  useEffect(() => {
    const { camera, controls, scene } = get();
    const target = new Vector3(...TARGET);
    const distance = distanceFor(width / height, fraction);
    const offset = camera.position.clone().sub(target).setLength(distance);
    camera.position.copy(target).add(offset);
    if (scene.fog instanceof Fog) [scene.fog.near, scene.fog.far] = fogRange(distance);
    (controls as OrbitControlsImpl | null)?.update();
  }, [width, height, fraction, get]);

  useFrame((_, delta) => {
    const camera = get().camera as PerspectiveCamera;
    const next = reducedMotion ? targetShift : MathUtils.damp(shift.current, targetShift, 9, delta);
    const value = Math.abs(next - targetShift) < 0.25 ? targetShift : next;
    const unchanged = value === shift.current && (camera.view?.enabled ?? false) === (value !== 0);
    if (unchanged && (value === 0 || camera.view?.fullWidth === width)) return;
    shift.current = value;
    if (value === 0) camera.clearViewOffset();
    else camera.setViewOffset(width, height, value, 0, width, height);
  });

  return null;
}

/** Rotación horizontal con damping, sin pan ni zoom; auto-rotación lenta hasta el primer gesto. */
export function Controls() {
  const reducedMotion = usePrefersReducedMotion();
  const hasInteracted = useUIStore((s) => s.hasInteracted);
  const markInteracted = useUIStore((s) => s.markInteracted);

  return (
    <>
      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={POLAR - POLAR_RANGE}
        maxPolarAngle={POLAR + POLAR_RANGE}
        autoRotate={!reducedMotion && !hasInteracted}
        autoRotateSpeed={0.35}
        onStart={markInteracted}
      />
      <Framing />
    </>
  );
}
