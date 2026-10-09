"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { NeutralToneMapping } from "three";
import { useUIStore } from "@/lib/store";
import { Building } from "./Building";
import { FOV, cameraPosition, readAzimuth } from "./camera";
import { Controls } from "./Controls";
import { SceneEnvironment } from "./Environment";

export default function SceneCanvas() {
  const [position] = useState(() => cameraPosition(readAzimuth()));
  const closePanel = useUIStore((s) => s.closePanel);

  return (
    <Canvas
      dpr={[1, 2]}
      shadows="soft"
      camera={{ fov: FOV, near: 1, far: 1500, position }}
      gl={{ antialias: true, toneMapping: NeutralToneMapping }}
      onPointerMissed={closePanel}
    >
      <SceneEnvironment />
      <Building />
      <Controls />
    </Canvas>
  );
}
