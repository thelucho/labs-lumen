"use client";

import {
  ArrowDown,
  ArrowUp,
  Bathtub,
  Bed,
  Eye,
  Ruler,
  SunHorizon,
  Thermometer,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { commonEquipment, project, type SelectableId, type Unit } from "@/data/building";
import { adjacentSelectable, getCommonSpace, getUnit, totalArea } from "@/lib/building";
import {
  formatArea,
  formatBathrooms,
  formatBedrooms,
  formatPrice,
  selectableLabel,
  selectableTitle,
  statusLabels,
} from "@/lib/format";
import { useUIStore } from "@/lib/store";
import { UnitPlan } from "./UnitPlan";

const ICON = { size: 16, weight: "light" as const, "aria-hidden": true };

const statusTone = { available: "text-sage", reserved: "text-clay", sold: "text-slate" } as const;

function Row({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-stone py-2.5 text-sm">
      <dt className="flex items-center gap-2 text-slate">
        {icon}
        {label}
      </dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-slate">
      {children}
    </h3>
  );
}

function UnitDetails({ unit }: { unit: Unit }) {
  const sold = unit.status === "sold";
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <p className={`font-serif text-4xl tabular-nums ${sold ? "text-slate" : ""}`}>
          {sold ? "Vendida" : formatPrice(unit.price)}
        </p>
        {!sold && (
          <p
            className={`rounded-xs border border-current px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] ${statusTone[unit.status]}`}
          >
            {statusLabels[unit.status]}
          </p>
        )}
      </div>

      <dl className="mt-6 border-t border-stone">
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
        {unit.hasLaundry && <Row label="Lavadero" value="Independiente" />}
        <Row label="Cocina" value={unit.kitchen} />
        <Row icon={<Eye {...ICON} />} label="Vista" value={unit.view} />
        <Row icon={<Thermometer {...ICON} />} label="Calefacción" value={unit.heating} />
        <Row label="Cocheras" value={unit.parkingSpaces} />
        <Row label="Baulera" value={unit.hasStorage ? "Sí" : "No"} />
      </dl>
      {unit.extras.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {unit.extras.map((extra) => (
            <li key={extra}>{extra}</li>
          ))}
        </ul>
      )}

      <SectionLabel>Planta</SectionLabel>
      <UnitPlan unit={unit} />

      <SectionLabel>Equipamiento de todas las unidades</SectionLabel>
      <ul className="space-y-1.5 text-sm text-slate">
        {commonEquipment.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

function CommonSpaceDetails({ id }: { id: SelectableId }) {
  const space = getCommonSpace(id);
  if (!space) return null;
  return (
    <>
      <ul className="border-t border-stone">
        {space.features.map((feature) => (
          <li key={feature} className="border-b border-stone py-2.5 text-sm tabular-nums">
            {feature}
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Ficha de unidad, PB o SUM (SPEC §6.1): panel lateral en escritorio, bottom
 * sheet en mobile. Se cierra con la X, Esc o click fuera.
 */
export function UnitPanel() {
  const isOpen = useUIStore((s) => s.isPanelOpen);
  const selectedId = useUIStore((s) => s.selectedId);
  const select = useUIStore((s) => s.select);
  const closePanel = useUIStore((s) => s.closePanel);
  const openModal = useUIStore((s) => s.openModal);

  // Mantiene el contenido visible durante la animación de cierre.
  const [shownId, setShownId] = useState(selectedId);
  if (selectedId && selectedId !== shownId) setShownId(selectedId);

  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Foco: al abrir va al título; al cerrar vuelve a donde estaba.
  useEffect(() => {
    if (isOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !panel.current?.contains(active)) {
        returnFocus.current = active;
      }
      heading.current?.focus({ preventScroll: true });
    } else if (returnFocus.current) {
      if (returnFocus.current.isConnected) returnFocus.current.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [isOpen]);

  // Esc y click fuera (el canvas y el selector manejan sus propios clicks).
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !useUIStore.getState().isModalOpen) closePanel();
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Element | null;
      if (!target || panel.current?.contains(target)) return;
      if (target.closest("[data-keep-panel]")) return;
      closePanel();
    }
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, closePanel]);

  const unit = shownId ? getUnit(shownId) : undefined;
  const below = shownId ? adjacentSelectable(shownId, -1) : null;
  const above = shownId ? adjacentSelectable(shownId, 1) : null;
  const cta = unit ? (unit.status !== "sold" ? "Solicitar información" : null) : shownId === "sum" ? "Consultar por amenities" : null;

  return (
    <aside
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="unit-panel-title"
      inert={!isOpen}
      className={[
        "fixed inset-x-0 bottom-0 z-30 flex max-h-[85svh] flex-col rounded-t-md border-t border-stone bg-paper",
        "md:inset-x-auto md:top-0 md:right-0 md:h-full md:max-h-none md:w-[420px] md:rounded-none md:border-t-0 md:border-l",
        "transition-transform duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full",
      ].join(" ")}
    >
      {shownId && (
        <>
          <header className="flex items-start justify-between gap-4 border-b border-stone px-6 py-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate">{project.name}</p>
              <h2
                id="unit-panel-title"
                ref={heading}
                tabIndex={-1}
                className="mt-1 font-serif text-3xl leading-tight outline-none"
              >
                {selectableTitle(shownId)}
              </h2>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Cerrar ficha"
              className="-mr-2 rounded-xs p-2 text-slate hover:text-graphite focus-visible:outline-2 focus-visible:outline-graphite"
            >
              <X size={20} weight="light" aria-hidden />
            </button>
          </header>

          <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
            {unit ? <UnitDetails unit={unit} /> : <CommonSpaceDetails id={shownId} />}
          </div>

          <footer className="border-t border-stone px-6 py-4">
            {cta && (
              <button
                type="button"
                onClick={openModal}
                className="mb-4 w-full rounded-xs bg-brass px-4 py-3 text-sm font-medium text-graphite transition-colors hover:bg-graphite hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite"
              >
                {cta}
              </button>
            )}
            <nav aria-label="Pisos" className="flex justify-between gap-4 text-xs">
              <button
                type="button"
                disabled={!below}
                onClick={() => below && select(below)}
                className="flex items-center gap-1.5 rounded-xs py-1 text-slate hover:text-graphite disabled:invisible focus-visible:outline-2 focus-visible:outline-graphite"
              >
                <ArrowDown size={14} weight="light" aria-hidden />
                Piso anterior{below ? ` · ${selectableLabel(below)}` : ""}
              </button>
              <button
                type="button"
                disabled={!above}
                onClick={() => above && select(above)}
                className="flex items-center gap-1.5 rounded-xs py-1 text-slate hover:text-graphite disabled:invisible focus-visible:outline-2 focus-visible:outline-graphite"
              >
                Piso siguiente{above ? ` · ${selectableLabel(above)}` : ""}
                <ArrowUp size={14} weight="light" aria-hidden />
              </button>
            </nav>
          </footer>
        </>
      )}
    </aside>
  );
}
