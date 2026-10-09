"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { INITIAL_AZIMUTH, skyPoint } from "./camera";
import { palette3D } from "./materials";

/**
 * Disco del sol. Licencia de encuadre (SPEC §4.3): la luz viene del noreste,
 * pero el disco se ubica a la derecha del edificio, bajo sobre el horizonte,
 * para que se vea en la vista inicial.
 */
const OFFSET_RIGHT = 17;
const ELEVATION = 5;
const DISTANCE = 420;
const POSITION = skyPoint(INITIAL_AZIMUTH + 180 - OFFSET_RIGHT, ELEVATION, DISTANCE);
const RADIUS = 7;

function useHaloTexture() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255, 244, 222, 0.9)");
      g.addColorStop(0.25, "rgba(255, 240, 214, 0.35)");
      g.addColorStop(1, "rgba(255, 240, 214, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function Sun() {
  const halo = useHaloTexture();
  return (
    <group position={POSITION}>
      <mesh>
        <sphereGeometry args={[RADIUS, 32, 16]} />
        <meshBasicMaterial color={palette3D.sunDisc} fog={false} toneMapped={false} />
      </mesh>
      <sprite scale={[RADIUS * 9, RADIUS * 9, 1]}>
        <spriteMaterial
          map={halo}
          transparent
          depthWrite={false}
          fog={false}
          toneMapped={false}
          opacity={0.7}
        />
      </sprite>
    </group>
  );
}
