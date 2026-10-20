"use client";

import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import type { Photo } from "@/data/building";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { EASE_OUT, FADE_IN } from "./reveal";

/**
 * Columnas (de 6) que ocupa cada foto en escritorio, para que las filas
 * queden completas: 4 fotos → 2 + 2; 5 → 2 + 3; 6 → 3 + 3; 2 → 2.
 */
function spanClass(index: number, count: number): string {
  const rest = count % 3;
  const wide = rest === 1 || (rest === 2 && index < 2);
  return wide ? "lg:col-span-3" : "lg:col-span-2";
}

/** Grilla de espacios. Cada foto abre el visor en esa posición. */
export function PhotoGallery({ photos, onOpen }: { photos: Photo[]; onOpen: (index: number) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-6 lg:gap-x-4">
      {photos.map((photo, i) => (
        <li data-reveal key={photo.src} className={`${spanClass(i, photos.length)} ${i === 0 && photos.length % 2 === 1 ? "col-span-2" : ""}`}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Ampliar: ${photo.caption}`}
            className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-stone-100">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-[600ms] ease-arch group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            </span>
            <span className="mt-3 flex items-baseline gap-3 text-sm">
              <span className="label-tech tabular-nums text-stone-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              {photo.caption}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Visor a pantalla completa dentro de la ficha. Flechas para recorrer; Esc lo
 * maneja la ficha (cierra primero el visor). El foco vuelve a la foto de origen.
 */
export function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const photo = photos[index];
  const count = photos.length;
  const go = (step: number) => onChange((index + step + count) % count);

  useEffect(() => {
    const returnTo = document.activeElement;
    closeButton.current?.focus();
    return () => {
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, []);

  // Entrada del visor: fundido del fondo.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const a = root.current?.animate(FADE_IN, { duration: 350, easing: EASE_OUT });
    return () => a?.cancel();
  }, [reducedMotion]);

  // Cada foto entra con un fundido y se asienta apenas.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const a = frame.current?.animate(
      [
        { opacity: 0, transform: "scale(0.985)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 550, easing: EASE_OUT },
    );
    return () => a?.cancel();
  }, [index, reducedMotion]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
    else return;
    e.preventDefault();
  }

  const navButton =
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-colors duration-200 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div
      role="group"
      aria-roledescription="visor de fotos"
      aria-label={`${photo.caption}, foto ${index + 1} de ${count}`}
      ref={root}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-20 flex flex-col bg-ink text-white"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <p className="text-sm">
          <span className="label-tech mr-3 tabular-nums text-white/60">
            {index + 1} / {count}
          </span>
          {photo.caption}
        </p>
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Cerrar visor" className={navButton}>
          <X size={20} weight="light" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-2 px-2 sm:gap-4 sm:px-6">
        <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={navButton}>
          <ArrowLeft size={20} weight="light" aria-hidden />
        </button>
        <div ref={frame} className="relative h-full flex-1">
          <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" />
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className={navButton}>
          <ArrowRight size={20} weight="light" aria-hidden />
        </button>
      </div>
      <p className="label-tech px-4 py-4 text-center text-white/60 sm:px-8">
        Foto: {photo.credit} · Unsplash · Imagen ilustrativa
      </p>
    </div>
  );
}
