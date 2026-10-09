"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { NeutralToneMapping } from "three";
import { Building } from "./Building";
import { FOV, cameraPosition, readAzimuth } from "./camera";
import { Controls } from "./Controls";
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
      <Controls />
    </Canvas>
  );
}
