import type { Icon } from "@phosphor-icons/react";
import { Barbell, CookingPot, Fire, Sun, SwimmingPool } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import {
  about,
  amenities,
  contact,
  levels,
  location,
  project,
  units,
  type AmenityId,
} from "@/data/building";
import { formatDeliveryShort } from "@/lib/format";
import { LocationPlan } from "./LocationPlan";

function Section({
  id,
  index,
  eyebrow,
  title,
  children,
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-stone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-8 md:grid-cols-12 md:py-28">
        <header className="md:col-span-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate">
            <span className="tabular-nums">{String(index).padStart(2, "0")}</span> · {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            {title}
          </h2>
        </header>
        <div className="md:col-span-8 md:pt-8">{children}</div>
      </div>
    </section>
  );
}

const floors = levels.filter((l) => l.unitIds.length > 0).length;
const homes = units.filter((u) => u.side !== "office").length;
const offices = units.length - homes;

export function ProjectSection() {
  const stats = [
    { label: "Pisos", value: String(floors), note: "+ PB y SUM" },
    { label: "Unidades", value: String(units.length), note: `${homes} deptos. de 3 y 4 amb. y ${offices} oficinas` },
    { label: "Entrega", value: formatDeliveryShort(project.delivery), note: "estimada" },
    { label: "Orientación", value: project.orientation.replace("Frente ", "").replace(/^\w/, (c) => c.toUpperCase()), note: "frente; balcones al este" },
  ];
  return (
    <Section
      id="proyecto"
      index={1}
      eyebrow="El proyecto"
      title={`${floors} pisos con ${project.footprint.width} m de frente`}
    >
      <div className="max-w-2xl space-y-4 text-[17px] leading-relaxed">
        {about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <dl className="mt-12 grid grid-cols-2 border-t border-stone sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-b border-stone py-5 pr-4 sm:border-b-0">
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">{stat.label}</dt>
            <dd className="mt-2 font-serif text-4xl leading-none tabular-nums">{stat.value}</dd>
            <dd className="mt-2 text-xs text-slate">{stat.note}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

const amenityIcons: Record<AmenityId, Icon> = {
  pool: SwimmingPool,
  solarium: Sun,
  sum: CookingPot,
  gym: Barbell,
  sauna: Fire,
};

export function AmenitiesSection() {
  return (
    <Section id="amenities" index={2} eyebrow="Amenities" title="Azotea: terraza, pileta y SUM">
      <ul className="border-t border-stone">
        {amenities.map((amenity) => {
          const AmenityIcon = amenityIcons[amenity.id];
          return (
            <li
              key={amenity.id}
              className="grid grid-cols-[2rem_1fr] items-baseline gap-x-4 border-b border-stone py-5 sm:grid-cols-[2rem_14rem_1fr]"
            >
              <AmenityIcon size={22} weight="light" aria-hidden className="translate-y-1 text-brass" />
              <p className="font-serif text-2xl leading-tight">{amenity.name}</p>
              <p className="col-start-2 mt-1 text-sm text-slate sm:col-start-3 sm:mt-0">{amenity.detail}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function LocationSection() {
  return (
    <Section id="ubicacion" index={3} eyebrow="Ubicación" title={project.address}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">{location.neighborhood}</p>
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed">{location.summary}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_16rem]">
        <LocationPlan />
        <ul className="border-t border-stone text-sm">
          {location.points.map((point) => (
            <li key={point.label} className="flex items-baseline justify-between gap-4 border-b border-stone py-3">
              <span>{point.label}</span>
              <span className="whitespace-nowrap text-slate tabular-nums">{point.distance}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function SiteFooter() {
  const rows = [
    { label: "Showroom", value: contact.showroom },
    { label: "Horario", value: contact.hours },
    { label: "Teléfono", value: contact.phone },
    { label: "WhatsApp", value: contact.whatsapp },
    { label: "Email", value: contact.email },
  ];
  return (
    <footer id="contacto" aria-labelledby="contacto-title" className="border-t border-stone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-8 md:grid-cols-12 md:py-28">
        <header className="md:col-span-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate">
            <span className="tabular-nums">04</span> · Contacto
          </p>
          <h2 id="contacto-title" className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            {project.developer}
          </h2>
        </header>
        <div className="md:col-span-8 md:pt-8">
          <dl className="border-t border-stone text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-stone py-3">
                <dt className="text-slate">{row.label}</dt>
                <dd className="text-right tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-12 border-l-2 border-brass py-1 pl-3 text-sm">
            Demo — información ilustrativa. {project.name}, {project.developer}, precios, superficies y
            disponibilidad son ficticios.
          </p>
        </div>
      </div>
    </footer>
  );
}
