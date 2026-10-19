"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/lib/store";

// Mientras carga no se muestra nada: el loader de la página cubre el hero.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

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
  // La ficha fullscreen tapa el edificio: tampoco hace falta dibujarlo.
  const isDetailOpen = useUIStore((s) => s.isDetailOpen);

  return (
    <div ref={container} className="absolute inset-0" data-scene data-scene-fade>
      <SceneCanvas active={visible && !isDetailOpen} />
    </div>
  );
}
