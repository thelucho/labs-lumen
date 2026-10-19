"use client";

import { useEffect, useState } from "react";
import { project } from "@/data/building";
import { isRevealed, useLoadProgress } from "@/lib/intro";
import { Isologo } from "./Isologo";

/** Tiempo de la salida del loader (fundido en globals.css) antes de sacarlo del DOM. */
const EXIT_MS = 900;

/**
 * Loader de la página: isologo, nombre del proyecto y el avance real de la
 * escena 3D. Cubre el hero mientras compila; se va con un fundido cuando la
 * escena está lista (html[data-intro="go"]). Se renderiza en el servidor: se
 * ve desde el primer pintado.
 */
export function Loader() {
  const progress = useLoadProgress();
  const [gone, setGone] = useState(false);
  const revealed = progress >= 1 && isRevealed();

  useEffect(() => {
    if (!revealed) return;
    const timer = window.setTimeout(() => setGone(true), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [revealed]);

  if (gone) return null;
  return (
    <div
      data-loader
      role="status"
      aria-live="polite"
      aria-busy={!revealed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper px-6 text-graphite"
    >
      <Isologo animated className="size-16 text-graphite" />
      <p className="mt-6 font-serif text-5xl leading-none sm:text-6xl">{project.name}</p>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate">{project.address}</p>
      <div className="mt-8 h-px w-40 bg-stone" aria-hidden>
        <div
          className="h-px origin-left bg-brass transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${Math.max(0.04, progress)})` }}
        />
      </div>
      <span className="sr-only">{revealed ? "Escena lista" : "Cargando el edificio en 3D"}</span>
    </div>
  );
}
