"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { levels, type SelectableId } from "@/data/building";
import { getUnit, selectablesOf } from "@/lib/building";
import { selectableTitle, statusLabels } from "@/lib/format";
import { useUIStore } from "@/lib/store";
import { introStyle } from "@/lib/ui";

/** Filas de arriba hacia abajo: SUM, 12 … 1, PB. */
const rows = [...levels].reverse().map((level) => ({ level, ids: selectablesOf(level) }));

function chipLabel(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return unit.side === "office" ? "Oficina" : unit.side;
  return id === "pb" ? "Hall" : "Amenities";
}

function accessibleLabel(id: SelectableId): string {
  const unit = getUnit(id);
  return unit ? `${selectableTitle(id)}, ${statusLabels[unit.status].toLowerCase()}` : selectableTitle(id);
}

/** Demora de la primera fila (PB) y paso entre filas, en ms: acompaña la subida del edificio. */
const ROW_START = 1000;
const ROW_STEP = 40;

/** Estado por forma, no por color (un solo acento): lleno, contorno, gris. */
const dotClass = {
  available: "bg-ink",
  reserved: "border border-ink",
  sold: "bg-stone-400",
} as const;

/**
 * Selector vertical de pisos: alternativa accesible al 3D y navegación
 * principal en mobile. Hover y foco encienden la unidad en el edificio.
 */
export function FloorSelector() {
  const hoveredId = useUIStore((s) => s.hoveredId);
  const selectedId = useUIStore((s) => s.selectedId);
  const setHovered = useUIStore((s) => s.setHovered);
  const select = useUIStore((s) => s.select);

  const [focusId, setFocusId] = useState<SelectableId>(rows[0].ids[0]);
  const buttons = useRef(new Map<SelectableId, HTMLButtonElement>());
  // El elemento con tabIndex 0 sigue a la selección si viene del 3D.
  const tabStopId = selectedId ?? focusId;

  function move(id: SelectableId) {
    setFocusId(id);
    buttons.current.get(id)?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, row: number, col: number) {
    let r = row;
    let c = col;
    if (e.key === "ArrowUp") r -= 1;
    else if (e.key === "ArrowDown") r += 1;
    else if (e.key === "ArrowLeft") c -= 1;
    else if (e.key === "ArrowRight") c += 1;
    else if (e.key === "Home") r = 0;
    else if (e.key === "End") r = rows.length - 1;
    else return;
    e.preventDefault();
    r = Math.max(0, Math.min(rows.length - 1, r));
    const ids = rows[r].ids;
    c = Math.max(0, Math.min(ids.length - 1, c));
    move(ids[c]);
  }

  function release(id: SelectableId) {
    if (useUIStore.getState().hoveredId === id) setHovered(null);
  }

  return (
    <nav
      data-intro
      style={introStyle(900, 28, 0)}
      aria-label="Selector de pisos"
      className="absolute top-[calc(50%+1.75rem)] right-3 -translate-y-1/2 rounded-md border border-stone-200 bg-white p-3 sm:right-6 sm:px-4"
    >
      <p className="label-tech mb-3 text-stone-600">Pisos</p>
      <ul className="flex flex-col gap-1">
        {rows.map(({ level, ids }, r) => (
          // Las filas aparecen de abajo hacia arriba, como el edificio.
          <li key={level.id} data-intro style={introStyle(ROW_START + (rows.length - 1 - r) * ROW_STEP, 0, 8)} className="flex items-center gap-2">
            <span className="w-8 text-right font-mono text-[11px] tabular-nums text-stone-600">
              {level.label}
            </span>
            <span className="flex gap-1">
              {ids.map((id, c) => {
                const unit = getUnit(id);
                const selected = id === selectedId;
                const lit = id === hoveredId;
                return (
                  <button
                    key={id}
                    ref={(el) => {
                      if (el) buttons.current.set(id, el);
                      else buttons.current.delete(id);
                    }}
                    type="button"
                    tabIndex={id === tabStopId ? 0 : -1}
                    aria-label={accessibleLabel(id)}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => select(id)}
                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                    onFocus={() => {
                      setFocusId(id);
                      setHovered(id);
                    }}
                    onBlur={() => release(id)}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => release(id)}
                    className={[
                      "flex h-6 min-w-9 items-center justify-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                      selected
                        ? "border-ink bg-ink text-white"
                        : lit
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-stone-200 bg-white text-ink hover:border-ink",
                      unit?.status === "sold" && !selected && !lit ? "text-stone-600 line-through" : "",
                    ].join(" ")}
                  >
                    {unit && (
                      <span aria-hidden className={`size-1.5 rounded-full ${selected ? "border-white bg-white" : dotClass[unit.status]}`} />
                    )}
                    {chipLabel(id)}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-1 border-t border-stone-200 pt-3 text-[11px] text-stone-600">
        {(Object.keys(dotClass) as (keyof typeof dotClass)[]).map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden className={`size-1.5 rounded-full ${dotClass[status]}`} />
            {statusLabels[status]}
          </li>
        ))}
      </ul>
    </nav>
  );
}
