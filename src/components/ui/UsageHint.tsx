"use client";

import { useUIStore } from "@/lib/store";

/** Indicación sutil de uso; se desvanece después del primer gesto. */
export function UsageHint() {
  const hasInteracted = useUIStore((s) => s.hasInteracted);
  return (
    <p
      aria-hidden={hasInteracted}
      className={[
        "pointer-events-none absolute bottom-4 left-4 text-[11px] font-medium uppercase tracking-[0.16em] text-slate md:left-1/2 md:-translate-x-1/2",
        "transition-opacity duration-500 motion-reduce:transition-none",
        hasInteracted ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <span className="md:hidden">Deslizá de costado para girar · Tocá una unidad</span>
      <span className="hidden md:inline">Arrastrá para girar · Click en una unidad para ver su ficha</span>
    </p>
  );
}
