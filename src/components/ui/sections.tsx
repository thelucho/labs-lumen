import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRight,
  Barbell,
  Buildings,
  ChatsCircle,
  CookingPot,
  Fire,
  Key,
  Signature,
  Sun,
  SwimmingPool,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  about,
  amenities,
  commonSpaces,
  contact,
  levels,
  location,
  project,
  purchaseSteps,
  showcases,
  units,
  type AmenityId,
  type PurchaseStepId,
} from "@/data/building";
import { ArrowLink, PillLink } from "./ArrowLink";
import { CountUp } from "./CountUp";
import { LocationPlan } from "./LocationPlan";
import { SelectButton } from "./SelectButton";
import { Sticker } from "./Sticker";

const pad = (n: number) => String(n).padStart(2, "0");

/** Label de sección: número + línea de 48 px + texto, en mono (DESIGN §8). */
function SectionLabel({ index, children, className = "" }: { index: number; children: ReactNode; className?: string }) {
  return (
    <p className={`label-tech flex items-center gap-3 ${className}`}>
      <span className="tabular-nums">{pad(index)}</span>
      <span aria-hidden className="h-px w-12 bg-current" />
      {children}
    </p>
  );
}

/**
 * Sección con encabezado asimétrico: label a la izquierda (columnas 1–4) y
 * título en dos tonos a la derecha (5–12).
 */
function Section({
  id,
  index,
  eyebrow,
  title,
  muted,
  children,
  className = "",
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: string;
  muted: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`section-y ${className}`}>
      <div className="container-arch">
        <header className="grid gap-6 lg:grid-cols-12">
          <SectionLabel index={index} className="self-start text-stone-600 lg:col-span-4 lg:pt-4">
            {eyebrow}
          </SectionLabel>
          <h2 id={`${id}-title`} data-reveal className="display-wide text-display-lg lg:col-span-8">
            {title} <span className="text-stone-400">{muted}</span>
          </h2>
        </header>
        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </section>
  );
}

const floors = levels.filter((l) => l.unitIds.length > 0).length;
const homes = units.filter((u) => u.side !== "office").length;
const offices = units.length - homes;
const available = units.filter((u) => u.status === "available").length;
const [deliveryMonth, deliveryYear] = project.delivery.split(" ");

export function ProjectSection() {
  const stats = [
    { label: "Pisos\nde altura", value: floors, count: true, note: "+ PB y SUM en la azotea" },
    { label: "Unidades\nen total", value: units.length, count: true, note: `${homes} departamentos y ${offices} oficinas` },
    { label: "Unidades\ndisponibles", value: available, count: true, note: "El resto, vendidas o reservadas" },
    {
      label: "Entrega\nestimada",
      value: Number(deliveryYear),
      count: false,
      note: deliveryMonth.charAt(0).toUpperCase() + deliveryMonth.slice(1),
    },
  ];
  return (
    <Section
      id="proyecto"
      index={1}
      eyebrow="El proyecto"
      title={`${floors} pisos`}
      muted={`con ${project.footprint.width} m de frente`}
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <div data-reveal className="hidden lg:col-span-4 lg:block">
          <Sticker href="#inicio" label="Elegí tu unidad" />
        </div>
        <div className="lg:col-span-8">
          <div data-reveal className="max-w-[65ch] space-y-5 text-body-lg text-stone-800">
            {about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-14 grid border-y border-stone-200 sm:grid-cols-2">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                data-reveal
                className={[
                  "flex min-h-56 flex-col justify-between gap-8 py-6 sm:px-6",
                  i < 3 ? "border-b border-stone-200" : "",
                  i === 2 ? "sm:border-b-0" : "",
                  i % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0",
                ].join(" ")}
              >
                <dt className="flex items-start justify-between gap-4 text-sm leading-snug whitespace-pre-line text-stone-600">
                  {stat.label}
                  <ArrowUpRight size={24} weight="light" aria-hidden className="text-ink" />
                </dt>
                <dd className="text-right">
                  <span className="block font-display text-stat font-normal">
                    {stat.count ? <CountUp value={stat.value} pad={2} /> : stat.value}
                  </span>
                  <span className="mt-2 block text-sm text-stone-600">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
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

/** Bento: la foto de la azotea manda; alrededor, una tarjeta por amenity. */
export function AmenitiesSection() {
  const photo = showcases.sum.cover;
  return (
    <Section id="amenities" index={2} eyebrow="Amenities" title="Azotea con pileta," muted="SUM y gimnasio">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
        <SelectButton
          id="sum"
          label={`Ver la ficha: ${commonSpaces.sum.title}`}
          className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-stone-100 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:min-h-[30rem]"
        >
          <span data-reveal="cover" className="absolute inset-0 block overflow-hidden rounded-md">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-[600ms] ease-arch group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          </span>
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(17_17_16/0.65)_0%,rgb(17_17_16/0)_55%)]" />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-white sm:p-8">
            <span>
              <span className="label-tech block text-white/80">Piso 13 · {commonSpaces.sum.title}</span>
              <span className="mt-3 block max-w-md font-display text-heading font-medium">{showcases.sum.lead}</span>
            </span>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-200 ease-arch group-hover:rotate-45">
              <ArrowUpRight size={20} weight="light" aria-hidden />
            </span>
          </span>
        </SelectButton>
        <ul className="contents">
          {amenities.map((amenity, i) => {
            const AmenityIcon = amenityIcons[amenity.id];
            return (
              <li
                key={amenity.id}
                data-reveal
                className={`flex min-h-52 flex-col justify-between gap-10 rounded-md bg-stone-50 p-6 sm:p-7 ${
                  i < 2 ? "lg:col-span-5" : "lg:col-span-4"
                } ${i === amenities.length - 1 ? "sm:col-span-2 lg:col-span-4" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white">
                    <AmenityIcon size={20} weight="light" aria-hidden />
                  </span>
                  <span className="label-tech tabular-nums text-stone-600">{pad(i + 1)}</span>
                </div>
                <div>
                  <p className="font-display text-2xl font-medium tracking-[-0.02em]">{amenity.name}</p>
                  <p className="mt-2 text-sm text-stone-600">{amenity.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

export function LocationSection() {
  return (
    <Section id="ubicacion" index={3} eyebrow="Ubicación" title={project.address} muted={location.neighborhood}>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="max-w-[65ch] text-body-lg text-stone-800">
            {location.summary}
          </p>
          <ul data-reveal className="mt-10 border-t border-stone-200">
            {location.points.map((point) => (
              <li key={point.label} className="flex items-baseline justify-between gap-4 border-b border-stone-200 py-4">
                <span>{point.label}</span>
                <span className="label-tech whitespace-nowrap text-stone-600">{point.distance}</span>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="rounded-lg bg-stone-50 p-4 sm:p-8 lg:col-span-7">
          <LocationPlan />
        </div>
      </div>
    </Section>
  );
}

const stepIcons: Record<PurchaseStepId, Icon> = {
  consult: ChatsCircle,
  visit: Buildings,
  reserve: Signature,
  handover: Key,
};

/** Lista de proceso (DESIGN §8): pills anchas con ícono y número en círculo. */
export function PurchaseSection() {
  return (
    <Section
      id="compra"
      index={4}
      eyebrow="Cómo comprar"
      title={`De la consulta a la llave`}
      muted={`en ${purchaseSteps.length} pasos`}
      className="bg-stone-50"
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <ol className="flex flex-col gap-3 lg:col-span-8 lg:col-start-5">
          {purchaseSteps.map((step, i) => {
            const StepIcon = stepIcons[step.id];
            return (
              <li
                key={step.id}
                data-reveal
                className="flex items-center gap-4 rounded-md border border-stone-200 bg-white py-4 pr-4 pl-4 sm:rounded-full sm:pl-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-stone-200">
                  <StepIcon size={20} weight="light" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-body-lg">{step.title}</span>
                  <span className="block text-sm text-stone-600">{step.detail}</span>
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-white tabular-nums">
                  {pad(i + 1)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

const [brandFirst] = project.name.split(" ");

export function SiteFooter() {
  const rows = [
    { label: "Showroom", value: contact.showroom },
    { label: "Horario", value: contact.hours },
    { label: "Teléfono", value: contact.phone },
    { label: "WhatsApp", value: contact.whatsapp },
    { label: "Email", value: contact.email },
  ];
  return (
    <footer id="contacto" aria-labelledby="contacto-title" className="overflow-hidden bg-ink text-white">
      <div className="container-arch pt-[clamp(80px,12vw,160px)]">
        <SectionLabel index={5} className="text-white/60">
          Contacto
        </SectionLabel>
        <div className="mt-16 flex flex-col items-center text-center">
          <h2 id="contacto-title" data-reveal className="display-wide text-display-xl">
            Visitá el showroom
            <br />
            <span className="text-stone-400">en {project.address}</span>
          </h2>
          <p data-reveal className="mt-6 max-w-[48ch] text-body-lg text-white/80">
            Obra, terminaciones y unidades disponibles, {contact.hours.charAt(0).toLowerCase() + contact.hours.slice(1)}. O elegí
            tu unidad en el edificio 3D.
          </p>
          <PillLink href="#inicio" variant="light" className="mt-10">
            Ver el edificio en 3D
          </PillLink>
        </div>
        <dl className="mt-24 grid gap-x-6 gap-y-8 border-t border-white/20 pt-10 sm:grid-cols-2 lg:grid-cols-5">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="label-tech text-white/60">{row.label}</dt>
              <dd className="mt-2 text-sm tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/20 py-6 text-sm text-white/60 sm:flex-row sm:items-center">
          <p>
            Demo — información ilustrativa. {project.name}, {project.developer}, precios, superficies y disponibilidad son
            ficticios.
          </p>
          <ArrowLink href="#inicio" tone="white" className="shrink-0">
            Volver arriba
          </ArrowLink>
        </div>
      </div>
      {/* Wordmark gigante recortado por el borde inferior. */}
      <div aria-hidden className="container-arch h-[13vw] overflow-hidden select-none">
        <p className="display-wide text-center text-[20vw] leading-[0.8] tracking-[-0.05em] text-white">
          {brandFirst}
        </p>
      </div>
    </footer>
  );
}
