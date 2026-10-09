"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { buildingHeight } from "@/lib/building";
import { Building } from "./Building";
import { palette3D } from "./materials";

const TARGET: [number, number, number] = [0, buildingHeight() * 0.46, 0];
const DISTANCE = 84;
const ELEVATION = 16;

/** Azimut 0 = mirando el frente norte desde el norte; 90 = lateral este. */
const INITIAL_AZIMUTH = 35;

/** Solo en desarrollo: `?cam=front|east|back|west` para capturas de control. */
const DEBUG_VIEWS: Record<string, number> = { front: 0, east: 90, back: 180, west: 270 };

function readAzimuth(): number {
  if (process.env.NODE_ENV === "production") return INITIAL_AZIMUTH;
  const view = new URLSearchParams(window.location.search).get("cam") ?? "";
  return DEBUG_VIEWS[view] ?? INITIAL_AZIMUTH;
}

function cameraPosition(azimuthDeg: number): [number, number, number] {
  const a = (azimuthDeg * Math.PI) / 180;
  return [
    TARGET[0] + Math.sin(a) * DISTANCE,
    TARGET[1] + ELEVATION,
    TARGET[2] + Math.cos(a) * DISTANCE,
  ];
}

export default function SceneCanvas() {
  const [position] = useState(() => cameraPosition(readAzimuth()));

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ fov: 30, near: 1, far: 400, position }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[palette3D.sky]} />

      {/* Iluminación provisoria: la Fase 3 la reemplaza por el sol y el cielo. */}
      <hemisphereLight args={[palette3D.sky, palette3D.ground, 1.4]} />
      <directionalLight
        position={[30, 48, 34]}
        intensity={2.2}
        color={palette3D.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={140}
      />

      <Building />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={palette3D.ground} roughness={1} />
      </mesh>

      {/* Solo para inspección: los límites de SPEC §4.4 llegan en la Fase 4. */}
      <OrbitControls target={TARGET} enablePan={false} makeDefault />
    </Canvas>
  );
}
