"use client";

import { project, tagline, units } from "@/data/building";
import { minAvailablePrice } from "@/lib/building";
import { formatDeliveryShort, formatPrice } from "@/lib/format";
import { useUIStore } from "@/lib/store";

const facts = [
  { label: "Unidades", value: String(units.length) },
  { label: "Desde", value: formatPrice(minAvailablePrice()) },
  { label: "Entrega", value: formatDeliveryShort(project.delivery) },
];

/**
 * Bloque editorial del hero. En mobile va debajo del edificio; en escritorio
 * a la izquierda, y se oculta mientras el panel de ficha está abierto.
 */
export function HeroIntro() {
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);

  return (
    <div
      className={[
        "px-4 pt-8 pb-14 sm:px-8",
        "md:pointer-events-none md:absolute md:top-1/2 md:left-8 md:w-[21rem] md:-translate-y-1/2 md:p-0",
        "md:transition-opacity md:duration-200 motion-reduce:transition-none",
        isPanelOpen ? "md:opacity-0" : "md:opacity-100",
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">{project.address}</p>
      <h1 className="mt-3 font-serif text-5xl leading-[0.95] lg:text-6xl">{project.name}</h1>
      <p className="mt-5 max-w-sm text-[15px] leading-relaxed">{tagline}</p>
      <dl className="mt-8 grid grid-cols-3 border-t border-stone">
        {facts.map((fact) => (
          <div key={fact.label} className="border-r border-stone pt-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">{fact.label}</dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
