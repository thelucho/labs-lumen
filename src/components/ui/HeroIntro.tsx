import { location, project, tagline, units } from "@/data/building";
import { minAvailablePrice } from "@/lib/building";
import { formatDeliveryShort, formatPrice } from "@/lib/format";
import { introStyle } from "@/lib/ui";
import { ArrowLink } from "./ArrowLink";

const facts = [
  { label: "Unidades", value: String(units.length) },
  { label: "Desde", value: formatPrice(minAvailablePrice()) },
  { label: "Entrega", value: formatDeliveryShort(project.delivery) },
];

const [nameFirst, ...nameRest] = project.name.split(" ");

/**
 * Bloque editorial del hero. Debajo de la tarjeta del edificio hasta lg; desde
 * lg, a la izquierda y dentro de la tarjeta, en una caja blanca: se lee igual
 * sobre el barrio, de día o de noche.
 */
export function HeroIntro() {
  return (
    <div
      data-intro
      style={introStyle(1000, -28, 0)}
      className={[
        "px-2 pt-10 pb-12 sm:px-3",
        "lg:absolute lg:top-[calc(50%-3rem)] lg:left-9 lg:w-[25rem] lg:-translate-y-1/2 lg:rounded-md lg:border lg:border-stone-200 lg:bg-white lg:p-6",
      ].join(" ")}
    >
      <p className="label-tech text-stone-600">
        {project.address} · {location.neighborhood}
      </p>
      <h1 className="display-wide mt-4 text-[2.75rem] leading-[0.9] tracking-[-0.04em] sm:text-6xl lg:text-[2.5rem]">
        {nameFirst}{" "}
        {/* Cinta en el acento (texto ink encima, como pide el sistema). */}
        <span className="mt-1 inline-block bg-accent px-1.5 pt-1 text-accent-ink">{nameRest.join(" ")}</span>
      </h1>
      <p className="mt-5 max-w-[65ch] text-[15px] leading-relaxed text-stone-800">{tagline}</p>
      <dl className="mt-7 grid grid-cols-[0.8fr_1.35fr_1fr] border-t border-stone-200">
        {facts.map((fact) => (
          <div key={fact.label} className="border-r border-stone-200 pt-3 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4">
            <dt className="label-tech text-stone-600">{fact.label}</dt>
            <dd className="mt-1.5 font-display text-[15px] font-medium whitespace-nowrap tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <ArrowLink href="#proyecto" className="mt-6">
        Conocé el proyecto
      </ArrowLink>
    </div>
  );
}
