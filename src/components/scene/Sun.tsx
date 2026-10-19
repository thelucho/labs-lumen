"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  SRGBColorSpace,
  type Group,
  type MeshBasicMaterial,
  type SpriteMaterial,
} from "three";
import { skyPoint } from "./camera";
import { daylightNow } from "./Daylight";
import { palette3D } from "./materials";

/**
 * Disco del sol, alineado con la luz (SPEC §4.3): sigue la hora del slider.
 * Por defecto queda detrás de la cámara; se ve al girar o al mover la hora.
 */
const DISTANCE = 420;
const RADIUS = 7;
const HALO_OPACITY = 0.7;

const discDay = new Color(palette3D.sunDisc);
const discLow = new Color(palette3D.sunLow);

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
  const group = useRef<Group>(null);
  const disc = useRef<MeshBasicMaterial>(null);
  const glow = useRef<SpriteMaterial>(null);

  useFrame(() => {
    if (!group.current || !disc.current || !glow.current) return;
    const { azimuth, elevation, day, high } = daylightNow;
    // Bajo el horizonte no se dibuja (el suelo no llega a taparlo).
    group.current.visible = elevation > -RADIUS / 10;
    group.current.position.set(...skyPoint(azimuth, elevation, DISTANCE));
    disc.current.color.copy(discLow).lerp(discDay, high);
    glow.current.opacity = HALO_OPACITY * day;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[RADIUS, 32, 16]} />
        <meshBasicMaterial ref={disc} color={palette3D.sunDisc} fog={false} toneMapped={false} />
      </mesh>
      <sprite scale={[RADIUS * 9, RADIUS * 9, 1]}>
        <spriteMaterial
          ref={glow}
          map={halo}
          transparent
          depthWrite={false}
          fog={false}
          toneMapped={false}
          opacity={HALO_OPACITY}
        />
      </sprite>
    </group>
  );
}
