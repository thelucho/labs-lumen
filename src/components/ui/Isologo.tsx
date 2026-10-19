import type { CSSProperties } from "react";

/**
 * Isologo de Lumen: la torre con sus pisos y una unidad encendida en `brass`
 * (el mismo dibujo que el favicon, src/app/icon.svg). Con `animated`, los
 * pisos se trazan de abajo hacia arriba y la ventana se enciende (globals.css).
 */
export function Isologo({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  const floors = [24, 19.5, 15, 10.5];
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden data-isologo={animated || undefined}>
      <rect x={9} y={5} width={14} height={23} fill="none" stroke="currentColor" strokeWidth={1.2} />
      {floors.map((y, i) => (
        <path
          key={y}
          d={`M9 ${y}h14`}
          stroke="currentColor"
          strokeWidth={0.8}
          pathLength={1}
          style={{ "--floor": i } as CSSProperties}
        />
      ))}
      <path d="M16 10.5v13.5" stroke="currentColor" strokeWidth={0.8} pathLength={1} style={{ "--floor": 4 } as CSSProperties} />
      <rect x={16.5} y={15.5} width={6} height={3.5} className="fill-brass" data-isologo-light />
    </svg>
  );
}
