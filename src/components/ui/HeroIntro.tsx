import { project, tagline, units } from "@/data/building";
import { minAvailablePrice } from "@/lib/building";
import { formatDeliveryShort, formatPrice } from "@/lib/format";
import { introStyle } from "@/lib/ui";

const facts = [
  { label: "Unidades", value: String(units.length) },
  { label: "Desde", value: formatPrice(minAvailablePrice()) },
  { label: "Entrega", value: formatDeliveryShort(project.delivery) },
];

/**
 * Bloque editorial del hero. Debajo del edificio hasta lg; desde lg a la
 * izquierda, sobre el 3D, en una caja `paper` como el selector y el slider:
 * se lee igual sobre el barrio, de día o de noche.
 */
export function HeroIntro() {
  return (
    <div
      data-intro
      style={introStyle(1000, -28, 0)}
      className={[
        "px-4 pt-8 pb-14 sm:px-8",
        "lg:absolute lg:top-[45%] lg:left-8 lg:w-[23rem] lg:-translate-y-1/2 lg:rounded-xs lg:border lg:border-stone lg:bg-paper lg:px-5 lg:py-6",
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">{project.address}</p>
      <h1 className="mt-3 font-serif text-5xl leading-[0.95] lg:text-[3.25rem]">{project.name}</h1>
      <p className="mt-5 max-w-sm text-[15px] leading-relaxed">{tagline}</p>
      <dl className="mt-8 grid grid-cols-3 border-t border-stone">
        {facts.map((fact) => (
          <div key={fact.label} className="border-r border-stone pt-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">{fact.label}</dt>
            <dd className="mt-1 text-sm font-medium whitespace-nowrap tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
