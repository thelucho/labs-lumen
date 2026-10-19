"use client";

import {
  ArrowLeft,
  Bathtub,
  Bed,
  CaretDown,
  CaretUp,
  Eye,
  Ruler,
  SunHorizon,
  Thermometer,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  commonEquipment,
  photoNotice,
  project,
  type Figure,
  type SelectableId,
  type Showcase,
  type Unit,
} from "@/data/building";
import { adjacentSelectable, getCommonSpace, getShowcase, getUnit, totalArea } from "@/lib/building";
import {
  formatArea,
  formatBathrooms,
  formatBedrooms,
  formatPrice,
  selectableEyebrow,
  selectableHeadline,
  selectableLabel,
  statusLabels,
  unitFigures,
} from "@/lib/format";
import { useUIStore } from "@/lib/store";
import { BuildingStack } from "./BuildingStack";
import { Lightbox, PhotoGallery } from "./PhotoGallery";
import { UnitPlan } from "./UnitPlan";

const ICON = { size: 16, weight: "light" as const, "aria-hidden": true };

const statusTone = { available: "text-sage", reserved: "text-clay", sold: "text-slate" } as const;

const container = "mx-auto w-full max-w-6xl px-4 sm:px-8";

const primaryButton =
  "inline-flex items-center justify-center rounded-xs bg-brass px-6 py-3 text-sm font-medium text-graphite transition-colors hover:bg-graphite hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite";

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate">{children}</p>;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{title}</h3>
    </div>
  );
}

function Row({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-stone py-3 text-sm">
      <dt className="flex items-center gap-2 text-slate">
        {icon}
        {label}
      </dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}

function Figures({ figures }: { figures: Figure[] }) {
  return (
    <dl
      className={`grid grid-cols-2 border-t border-stone sm:grid-cols-3 ${
        figures.length > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5"
      }`}
    >
      {figures.map((figure) => (
        <div key={figure.label} className="border-b border-stone py-5 pr-4 lg:border-b-0 lg:border-r lg:pl-5 lg:first:pl-0 lg:last:border-r-0">
          <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate">{figure.label}</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums sm:text-4xl">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function UnitSpecs({ unit }: { unit: Unit }) {
  return (
    <dl className="grid border-t border-stone sm:grid-cols-2 sm:gap-x-10">
      <Row icon={<Ruler {...ICON} />} label="Superficie cubierta" value={formatArea(unit.coveredArea)} />
      <Row
        icon={<SunHorizon {...ICON} />}
        label="Balcón"
        value={unit.balconyArea > 0 ? `${formatArea(unit.balconyArea)} · lateral este` : "Sin balcón"}
      />
      <Row label="Superficie total" value={formatArea(totalArea(unit))} />
      <Row label="Ambientes" value={unit.rooms} />
      <Row icon={<Bed {...ICON} />} label="Dormitorios" value={formatBedrooms(unit)} />
      <Row icon={<Bathtub {...ICON} />} label="Baños" value={formatBathrooms(unit)} />
      <Row label="Cocina" value={unit.kitchen} />
      {unit.hasLaundry && <Row label="Lavadero" value="Independiente" />}
      <Row icon={<Eye {...ICON} />} label="Vista" value={unit.view} />
      <Row icon={<Thermometer {...ICON} />} label="Calefacción" value={unit.heating} />
      <Row label="Cocheras" value={unit.parkingSpaces} />
      <Row label="Baulera" value={unit.hasStorage ? "Sí" : "No"} />
      {unit.extras.map((extra) => (
        <Row key={extra} label="Extra" value={extra} />
      ))}
    </dl>
  );
}

/** Encabezado: ubicación, título, presentación y, en las unidades, precio y estado. */
function Intro({ id, showcase, cta, onCta }: { id: SelectableId; showcase: Showcase; cta: string | null; onCta: () => void }) {
  const unit = getUnit(id);
  const sold = unit?.status === "sold";
  return (
    <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:pt-16">
      <div className="lg:col-span-7">
        <Eyebrow>{selectableEyebrow(id)}</Eyebrow>
        <h2 id="unit-detail-title" tabIndex={-1} className="mt-3 font-serif text-6xl leading-[0.95] outline-none sm:text-7xl lg:text-8xl">
          {selectableHeadline(id)}
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{showcase.lead}</p>
      </div>
      <div className="flex flex-col justify-end lg:col-span-5 lg:items-end lg:text-right">
        {unit && (
          <>
            <p
              className={`self-start rounded-xs border border-current px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] lg:self-end ${statusTone[unit.status]}`}
            >
              {statusLabels[unit.status]}
            </p>
            <p className={`mt-4 font-serif text-5xl tabular-nums sm:text-6xl ${sold ? "text-slate" : ""}`}>
              {sold ? "Vendida" : formatPrice(unit.price)}
            </p>
            <p className="mt-2 text-sm text-slate">
              {sold ? "Podés ver la ficha como referencia." : `Entrega estimada: ${project.delivery}`}
            </p>
          </>
        )}
        {cta && (
          <button type="button" onClick={onCta} className={`${primaryButton} mt-6 self-start lg:self-end`}>
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

/** Piso anterior / siguiente al pie de la ficha, con estado y precio. */
function AdjacentLink({ id, direction }: { id: SelectableId | null; direction: "down" | "up" }) {
  const select = useUIStore((s) => s.select);
  if (!id) return <span />;
  const unit = getUnit(id);
  const detail = unit
    ? unit.status === "sold"
      ? statusLabels.sold
      : `${statusLabels[unit.status]} · ${formatPrice(unit.price)}`
    : getCommonSpace(id)?.title;
  const Icon = direction === "down" ? CaretDown : CaretUp;
  return (
    <button
      type="button"
      onClick={() => select(id)}
      className={`group flex flex-col gap-1 rounded-xs border border-stone px-5 py-4 transition-colors hover:border-brass focus-visible:outline-2 focus-visible:outline-graphite ${
        direction === "up" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
        {direction === "down" && <Icon size={12} weight="light" aria-hidden />}
        {direction === "down" ? "Piso anterior" : "Piso siguiente"}
        {direction === "up" && <Icon size={12} weight="light" aria-hidden />}
      </span>
      <span className="font-serif text-2xl">{selectableLabel(id)}</span>
      <span className="text-xs tabular-nums text-slate">{detail}</span>
    </button>
  );
}

function DetailContent({ id, onOpenPhoto }: { id: SelectableId; onOpenPhoto: (index: number) => void }) {
  const openModal = useUIStore((s) => s.openModal);
  const showcase = getShowcase(id);
  if (!showcase) return null;
  const unit = getUnit(id);
  const space = getCommonSpace(id);
  const cta = unit ? (unit.status !== "sold" ? "Solicitar información" : null) : id === "sum" ? "Consultar por amenities" : null;
  const figures = unit ? unitFigures(unit) : (showcase.figures ?? []);
  const coverIndex = Math.max(0, showcase.gallery.indexOf(showcase.cover));
  const credits = [...new Set(showcase.gallery.map((p) => p.credit))].join(", ");
  const below = adjacentSelectable(id, -1);
  const above = adjacentSelectable(id, 1);

  return (
    <>
      <div className={container}>
        <Intro id={id} showcase={showcase} cta={cta} onCta={openModal} />

        {/* Portada */}
        <figure className="mt-12">
          <button
            type="button"
            onClick={() => onOpenPhoto(coverIndex)}
            aria-label={`Ampliar: ${showcase.cover.caption}`}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xs bg-stone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite sm:aspect-[16/9] lg:aspect-[21/9]"
          >
            <Image
              src={showcase.cover.src}
              alt={showcase.cover.alt}
              fill
              preload
              sizes="(min-width: 1152px) 1088px, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          </button>
          <figcaption className="mt-3 flex justify-between gap-4 text-xs text-slate">
            <span>{showcase.cover.caption}</span>
            <span>Imagen ilustrativa</span>
          </figcaption>
        </figure>

        {figures.length > 0 && (
          <div className="mt-12">
            <Figures figures={figures} />
          </div>
        )}

        {/* Descripción y ficha técnica */}
        <section className="mt-20 grid gap-12 lg:grid-cols-12" aria-labelledby="detail-about">
          <div className="lg:col-span-5">
            <Eyebrow>{unit ? "La unidad" : "El espacio"}</Eyebrow>
            <h3 id="detail-about" className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
              {unit ? unit.view : space?.title}
            </h3>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
              {showcase.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <Eyebrow>{unit ? "Ficha técnica" : "Qué incluye"}</Eyebrow>
            <div className="mt-4">
              {unit ? (
                <UnitSpecs unit={unit} />
              ) : (
                <ul className="border-t border-stone">
                  {space?.features.map((feature) => (
                    <li key={feature} className="border-b border-stone py-3 text-sm tabular-nums">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Galería */}
        <section className="mt-24" aria-labelledby="detail-gallery">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Galería</Eyebrow>
              <h3 id="detail-gallery" className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
                Espacios
              </h3>
            </div>
            <p className="text-xs tabular-nums text-slate">{showcase.gallery.length} imágenes</p>
          </div>
          <PhotoGallery photos={showcase.gallery} onOpen={onOpenPhoto} />
        </section>

        {/* Planta y ubicación */}
        <section className="mt-24 grid gap-12 lg:grid-cols-12" aria-label="Planta y ubicación">
          {unit && (
            <div className="lg:col-span-7">
              <SectionTitle eyebrow="Planta" title="Frente al norte" />
              <div className="max-w-md">
                <UnitPlan unit={unit} />
              </div>
            </div>
          )}
          <div className={unit ? "lg:col-span-5" : "lg:col-span-6"}>
            <SectionTitle eyebrow="Ubicación" title="En el edificio" />
            <BuildingStack activeId={id} />
            {unit && (
              <>
                <div className="mt-10">
                  <Eyebrow>Equipamiento de todas las unidades</Eyebrow>
                </div>
                <ul className="mt-3 border-t border-stone text-sm">
                  {commonEquipment.map((item) => (
                    <li key={item} className="border-b border-stone py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Cierre: consulta y pisos vecinos */}
      <section className="mt-24 border-t border-stone bg-stone/30 py-14" aria-label="Consulta y otros pisos">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:items-end`}>
          <div className="lg:col-span-6">
            <Eyebrow>{project.name}</Eyebrow>
            <p className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              {cta ? `Consultá por ${unit ? `el ${selectableLabel(id)}` : "las amenities"}` : selectableHeadline(id)}
            </p>
            {cta && (
              <button type="button" onClick={openModal} className={`${primaryButton} mt-6`}>
                {cta}
              </button>
            )}
          </div>
          <nav aria-label="Otros pisos" className="grid grid-cols-2 gap-3 lg:col-span-6">
            <AdjacentLink id={below} direction="down" />
            <AdjacentLink id={above} direction="up" />
          </nav>
        </div>
        <p className={`${container} mt-12 text-[11px] text-slate`}>
          {photoNotice} Autores: {credits}.
        </p>
      </section>
    </>
  );
}

/**
 * Ficha fullscreen de una unidad, PB o SUM (SPEC §6.1): una mini landing por
 * unidad. `<dialog>` nativo: el resto queda inerte, Esc cierra (primero el
 * visor de fotos, si está abierto) y el foco vuelve a donde estaba.
 */
export function UnitDetail() {
  const isOpen = useUIStore((s) => s.isDetailOpen);
  const selectedId = useUIStore((s) => s.selectedId);
  const closeDetail = useUIStore((s) => s.closeDetail);
  const dialog = useRef<HTMLDialogElement>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  // Mantiene el contenido mientras se cierra.
  const [shownId, setShownId] = useState(selectedId);
  if (selectedId && selectedId !== shownId) {
    setShownId(selectedId);
    setPhotoIndex(null);
  }

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // Cada unidad arranca arriba, con el foco en el título.
  useEffect(() => {
    const d = dialog.current;
    if (!d?.open || !shownId) return;
    d.scrollTo({ top: 0 });
    d.querySelector<HTMLElement>("#unit-detail-title")?.focus({ preventScroll: true });
  }, [shownId, isOpen]);

  const showcase = shownId ? getShowcase(shownId) : undefined;
  const below = shownId ? adjacentSelectable(shownId, -1) : null;
  const above = shownId ? adjacentSelectable(shownId, 1) : null;
  const select = useUIStore((s) => s.select);

  const barButton =
    "flex items-center gap-1.5 rounded-xs px-2 py-1.5 text-slate transition-colors hover:text-graphite disabled:invisible focus-visible:outline-2 focus-visible:outline-graphite";

  return (
    <dialog
      ref={dialog}
      aria-labelledby="unit-detail-title"
      data-lenis-prevent
      onClose={closeDetail}
      onCancel={(e) => {
        // Esc con el visor abierto cierra solo el visor.
        if (photoIndex !== null) {
          e.preventDefault();
          setPhotoIndex(null);
        }
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-paper p-0 text-graphite opacity-100 transition-opacity duration-200 backdrop:bg-paper starting:open:opacity-0 motion-reduce:transition-none"
    >
      {shownId && showcase && (
        <>
          <header className="sticky top-0 z-10 border-b border-stone bg-paper">
            <div className={`${container} flex h-14 items-center justify-between gap-4 text-sm`}>
              <button type="button" onClick={closeDetail} className={`${barButton} -ml-2 text-graphite`}>
                <ArrowLeft size={16} weight="light" aria-hidden />
                Volver al edificio
              </button>
              <p className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-slate md:block">
                {project.name} · {selectableLabel(shownId)}
              </p>
              <nav aria-label="Pisos" className="-mr-2 flex items-center gap-1 text-xs">
                <button type="button" disabled={!below} onClick={() => below && select(below)} className={barButton}>
                  <CaretDown size={14} weight="light" aria-hidden />
                  <span className="sr-only sm:not-sr-only">{below ? selectableLabel(below) : ""}</span>
                  <span className="sr-only">Piso anterior</span>
                </button>
                <button type="button" disabled={!above} onClick={() => above && select(above)} className={barButton}>
                  <span className="sr-only sm:not-sr-only">{above ? selectableLabel(above) : ""}</span>
                  <span className="sr-only">Piso siguiente</span>
                  <CaretUp size={14} weight="light" aria-hidden />
                </button>
              </nav>
            </div>
          </header>

          <article key={shownId}>
            <DetailContent id={shownId} onOpenPhoto={setPhotoIndex} />
          </article>

          {photoIndex !== null && (
            <Lightbox
              photos={showcase.gallery}
              index={photoIndex}
              onChange={setPhotoIndex}
              onClose={() => setPhotoIndex(null)}
            />
          )}
        </>
      )}
    </dialog>
  );
}
