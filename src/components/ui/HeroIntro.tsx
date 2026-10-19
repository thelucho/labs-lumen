"use client";

import { project, tagline, units } from "@/data/building";
import { minAvailablePrice } from "@/lib/building";
import { formatDeliveryShort, formatPrice } from "@/lib/format";
import { selectIsDark, useUIStore } from "@/lib/store";

const facts = [
  { label: "Unidades", value: String(units.length) },
  { label: "Desde", value: formatPrice(minAvailablePrice()) },
  { label: "Entrega", value: formatDeliveryShort(project.delivery) },
];

/**
 * Bloque editorial del hero. Debajo del edificio hasta lg; desde lg
 * a la izquierda, y se oculta mientras el panel de ficha está abierto.
 */
export function HeroIntro() {
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);
  // Desde lg el texto va sobre el 3D: con la escena oscura (luz del día) pasa a claro.
  const isDark = useUIStore(selectIsDark);

  return (
    <div
      data-dark={isDark || undefined}
      className={[
        "group px-4 pt-8 pb-14 sm:px-8",
        "lg:pointer-events-none lg:absolute lg:top-1/2 lg:left-8 lg:w-[21rem] lg:-translate-y-1/2 lg:p-0",
        "lg:transition-[opacity,color] lg:duration-200 motion-reduce:transition-none lg:data-dark:text-paper",
        isPanelOpen ? "lg:opacity-0" : "lg:opacity-100",
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate lg:group-data-dark:text-stone">
        {project.address}
      </p>
      <h1 className="mt-3 font-serif text-5xl leading-[0.95] lg:text-6xl">{project.name}</h1>
      <p className="mt-5 max-w-sm text-[15px] leading-relaxed">{tagline}</p>
      <dl className="mt-8 grid grid-cols-3 border-t border-stone">
        {facts.map((fact) => (
          <div key={fact.label} className="border-r border-stone pt-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate lg:group-data-dark:text-stone">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
