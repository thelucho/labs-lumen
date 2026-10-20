"use client";

import { useUIStore } from "@/lib/store";
import { introStyle } from "@/lib/ui";

/**
 * Indicación sutil de uso; se desvanece después del primer gesto. Va en una
 * pill translúcida como la navegación (se lee igual sobre el barrio, de día o
 * de noche) y centrada en la franja libre entre los paneles, la misma que usa
 * el encuadre del edificio (src/lib/ui.ts): no pisa ni la luz del día ni el
 * selector.
 */
export function UsageHint() {
  const hasInteracted = useUIStore((s) => s.hasInteracted);
  return (
    <div
      aria-hidden={hasInteracted}
      className={[
        "pointer-events-none absolute right-[11.5rem] bottom-3 left-3 flex sm:right-[12.5rem]",
        "lg:right-[12.5rem] lg:bottom-6 lg:left-[28rem] lg:justify-center",
        "transition-opacity duration-500 motion-reduce:transition-none",
        hasInteracted ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <p
        data-intro
        style={introStyle(1700, 0, 8)}
        className="label-tech rounded-sm border border-white/70 bg-white/75 px-3 py-2 text-ink backdrop-blur-md lg:rounded-full lg:px-4 lg:text-center"
      >
        <span className="pointer-fine:hidden">Deslizá de costado para girar · Tocá una unidad</span>
        <span className="hidden pointer-fine:inline">Arrastrá para girar · Click en una unidad para ver su ficha</span>
      </p>
    </div>
  );
}
