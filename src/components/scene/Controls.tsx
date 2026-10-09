"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";
import { project } from "@/data/building";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useUIStore } from "@/lib/store";
import { DISTANCE, ELEVATION, FOV, TARGET } from "./camera";

/** Ángulo polar de la cámara inicial (desde la vertical). */
const POLAR = Math.atan2(DISTANCE, ELEVATION);
/** Margen vertical casi nulo: la rotación es esencialmente horizontal (SPEC §4.4). */
const POLAR_RANGE = (4 * Math.PI) / 180;

/** Ancho que tiene que entrar en pantalla: diagonal de la planta más los balcones. */
const FIT_WIDTH =
  Math.hypot(project.footprint.width, project.footprint.depth) + 4;

/**
 * Distancia de cámara según el aspecto: en pantallas angostas (mobile) se
 * aleja para que el edificio ocupe el ancho sin cortarse.
 */
function distanceFor(aspect: number): number {
  const halfH = Math.tan(((FOV / 2) * Math.PI) / 180);
  const fitWidth = FIT_WIDTH / 2 / (halfH * aspect);
  return Math.max(Math.hypot(DISTANCE, ELEVATION), fitWidth);
}

function ResponsiveDistance() {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { camera, controls } = get();
    const target = new Vector3(...TARGET);
    const offset = camera.position.clone().sub(target).setLength(distanceFor(aspect));
    camera.position.copy(target).add(offset);
    (controls as { update?: () => void } | null)?.update?.();
  }, [aspect, get]);

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
      <ResponsiveDistance />
    </>
  );
}
