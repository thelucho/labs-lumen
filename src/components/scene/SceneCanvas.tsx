"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { NeutralToneMapping } from "three";
import { Building } from "./Building";
import { FOV, TARGET, cameraPosition, readAzimuth } from "./camera";
import { SceneEnvironment } from "./Environment";

export default function SceneCanvas() {
  const [position] = useState(() => cameraPosition(readAzimuth()));

  return (
    <Canvas
      dpr={[1, 2]}
      shadows="soft"
      camera={{ fov: FOV, near: 1, far: 1500, position }}
      gl={{ antialias: true, toneMapping: NeutralToneMapping }}
    >
      <SceneEnvironment />
      <Building />

      {/* Solo para inspección: los límites de SPEC §4.4 llegan en la Fase 4. */}
      <OrbitControls target={TARGET} enablePan={false} makeDefault />
    </Canvas>
  );
}
