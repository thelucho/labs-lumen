"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { palette3D } from "./materials";

interface Props {
  text: string;
  position: [number, number, number];
  size: [number, number];
}

const WIDTH = 512;

/**
 * Número de calle dibujado en un canvas con Manrope (la fuente ya cargada por
 * next/font): sin archivos de fuente externos para three.
 */
export function StreetNumber({ text, position, size }: Props) {
  const height = Math.round((WIDTH * size[1]) / size[0]);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = height;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [height]);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-manrope").trim() ||
        "sans-serif";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = palette3D.frame;
      ctx.font = `600 ${Math.round(canvas.height * 0.62)}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = `${Math.round(canvas.height * 0.12)}px`;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      texture.needsUpdate = true;
    });
    return () => {
      cancelled = true;
    };
  }, [texture, text]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
