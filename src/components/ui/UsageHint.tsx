"use client";

import { selectIsDark, useUIStore } from "@/lib/store";
import { introStyle } from "@/lib/ui";

/** Indicación sutil de uso; se desvanece después del primer gesto. */
export function UsageHint() {
  const hasInteracted = useUIStore((s) => s.hasInteracted);
  const isDark = useUIStore(selectIsDark);
  return (
    <p
      data-intro
      style={introStyle(1700, 0, 8)}
      aria-hidden={hasInteracted}
      className={[
        // En el layout apilado no llega a la columna del selector.
        "pointer-events-none absolute bottom-4 left-4 max-w-[calc(100%-14rem)] text-[11px] font-medium uppercase tracking-[0.16em] lg:left-1/2 lg:max-w-none lg:-translate-x-1/2",
        "transition-opacity duration-500 motion-reduce:transition-none",
        hasInteracted ? "opacity-0" : "opacity-100",
        isDark ? "text-stone" : "text-slate",
      ].join(" ")}
    >
      <span className="pointer-fine:hidden">Deslizá de costado para girar · Tocá una unidad</span>
      <span className="hidden pointer-fine:inline">Arrastrá para girar · Click en una unidad para ver su ficha</span>
    </p>
  );
}
