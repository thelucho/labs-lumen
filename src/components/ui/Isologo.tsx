import type { CSSProperties } from "react";

/** Pisos de la torre, de abajo hacia arriba (y en el viewBox de 32). */
const FLOORS = ["M10 23h12", "M10 19h12", "M10 15h12", "M10 11h12", "M17 7.5h5"];

/**
 * Isologo de Lumen: una torre escalonada de dos volúmenes, con sus pisos y una
 * unidad encendida en el acento (el mismo dibujo que el favicon,
 * src/app/icon.svg). Hereda el color del texto. Con `animated`, los pisos se
 * trazan de abajo hacia arriba y la ventana se enciende (globals.css).
 */
export function Isologo({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden data-isologo={animated || undefined}>
      <path d="M6.5 27h19" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <path d="M10 27V9.5h7V4.5h5V27" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" fill="none" />
      {FLOORS.map((d, i) => (
        <path key={d} d={d} data-floor stroke="currentColor" strokeWidth={0.7} pathLength={1} style={{ "--floor": i } as CSSProperties} />
      ))}
      <rect x={17.6} y={15.9} width={3.7} height={2.5} className="fill-accent" data-isologo-light />
    </svg>
  );
}
