"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScenePlaceholder } from "./ScenePlaceholder";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => <ScenePlaceholder />,
});

export function Scene() {
  const container = useRef<HTMLDivElement>(null);
  // Fuera de pantalla el render loop se pausa (SPEC §7: 60 fps, sin gastar GPU de más).
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "64px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="absolute inset-0" data-keep-panel data-scene>
      <SceneCanvas active={visible} />
    </div>
  );
}
