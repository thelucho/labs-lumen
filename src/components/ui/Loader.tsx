"use client";

import { useEffect, useState } from "react";
import { project } from "@/data/building";
import { isRevealed, useLoadProgress } from "@/lib/intro";
import { Isologo } from "./Isologo";

/** Tiempo de la salida del loader (fundido en globals.css) antes de sacarlo del DOM. */
const EXIT_MS = 1700;

/** "Lumen Residencias" → "Lumen" + "Residencias": titular en dos tonos. */
const [nameFirst, ...nameRest] = project.name.split(" ");

/**
 * Loader de la página: isologo, nombre del proyecto en dos tonos y el avance
 * real de la escena 3D, como una ficha técnica (porcentaje en mono y línea de
 * 1 px). Cubre el hero mientras compila; se va con un fundido cuando la escena
 * está lista (html[data-intro="go"]). Se renderiza en el servidor: se ve desde
 * el primer pintado.
 */
export function Loader() {
  const progress = useLoadProgress();
  const [gone, setGone] = useState(false);
  const revealed = progress >= 1 && isRevealed();
  const percent = String(Math.round(progress * 100)).padStart(3, "0");

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
      className="fixed inset-0 z-50 flex flex-col bg-paper text-ink"
    >
      {/* El contenido sale primero; después se disuelve el fondo (globals.css). */}
      <div data-loader-content className="container-arch flex flex-1 flex-col">
        <div className="flex items-center justify-between pt-6 text-stone-600" aria-hidden>
          <span className="label-tech">{project.developer}</span>
          <span className="label-tech hidden sm:inline">{project.address}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Isologo animated className="size-14" />
          <p className="display-wide mt-8 text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.04em]">
            {nameFirst} <span className="text-stone-400">{nameRest.join(" ")}</span>
          </p>
          <p className="label-tech mt-6 text-stone-600">Edificio en 3D · Entrega {project.delivery}</p>
        </div>

        <div className="pb-6" aria-hidden>
          <div className="flex items-baseline justify-between text-stone-600">
            <span className="label-tech">Cargando el edificio</span>
            <span className="label-tech tabular-nums text-ink">{percent} %</span>
          </div>
          <div className="mt-3 h-px w-full bg-stone-200">
            <div
              className="h-px origin-left bg-ink transition-transform duration-500 ease-arch motion-reduce:transition-none"
              style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
            />
          </div>
        </div>
      </div>
      <span className="sr-only">{revealed ? "Escena lista" : "Cargando el edificio en 3D"}</span>
    </div>
  );
}
