"use client";

import dynamic from "next/dynamic";
import { ScenePlaceholder } from "./ScenePlaceholder";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => <ScenePlaceholder />,
});

export function Scene() {
  return (
    <div className="absolute inset-0" data-keep-panel>
      <SceneCanvas />
    </div>
  );
}
