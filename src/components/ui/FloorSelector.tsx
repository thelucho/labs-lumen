"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { levels, type SelectableId } from "@/data/building";
import { getUnit, selectablesOf } from "@/lib/building";
import { selectableTitle, statusLabels } from "@/lib/format";
import { useUIStore } from "@/lib/store";

/** Filas de arriba hacia abajo: SUM, 8 … 1, PB. */
const rows = [...levels].reverse().map((level) => ({ level, ids: selectablesOf(level) }));

function chipLabel(id: SelectableId): string {
  const unit = getUnit(id);
  if (unit) return unit.side === "full" ? "Completo" : unit.side;
  return id === "pb" ? "Hall" : "Amenities";
}

function accessibleLabel(id: SelectableId): string {
  const unit = getUnit(id);
  return unit ? `${selectableTitle(id)}, ${statusLabels[unit.status].toLowerCase()}` : selectableTitle(id);
}

const dotClass = { available: "bg-sage", reserved: "bg-clay", sold: "bg-slate" } as const;

/**
 * Selector vertical de pisos: alternativa accesible al 3D y navegación
 * principal en mobile. Hover y foco encienden la unidad en el edificio.
 */
export function FloorSelector() {
  const hoveredId = useUIStore((s) => s.hoveredId);
  const selectedId = useUIStore((s) => s.selectedId);
  const setHovered = useUIStore((s) => s.setHovered);
  const select = useUIStore((s) => s.select);
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);

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
      aria-label="Selector de pisos"
      data-keep-panel
      className={[
        "absolute top-1/2 right-3 -translate-y-1/2 rounded-xs border border-stone bg-paper px-3 py-3 transition-[right] duration-200 ease-out motion-reduce:transition-none sm:right-8",
        // En escritorio se corre a la izquierda del panel abierto (420 px).
        isPanelOpen ? "md:right-[calc(420px+2rem)]" : "",
      ].join(" ")}
    >
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate">Pisos</p>
      <ul className="flex flex-col gap-1">
        {rows.map(({ level, ids }, r) => (
          <li key={level.id} className="flex items-center gap-2">
            <span className="w-9 text-right text-xs font-medium tabular-nums text-slate">
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
                      "flex h-7 min-w-8 items-center justify-center gap-1.5 rounded-xs border px-2 text-xs font-medium transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite",
                      selected
                        ? "border-brass bg-brass text-graphite"
                        : lit
                          ? "border-brass bg-paper text-graphite"
                          : "border-stone bg-paper text-graphite hover:border-brass",
                      unit?.status === "sold" && !selected ? "text-slate line-through" : "",
                    ].join(" ")}
                  >
                    {unit && (
                      <span /* unslop-ignore: punto de estado de 6 px, no un botón píldora */ aria-hidden className={`size-1.5 rounded-full ${dotClass[unit.status]}`} />
                    )}
                    {chipLabel(id)}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-1 text-[11px] text-slate">
        {(Object.keys(dotClass) as (keyof typeof dotClass)[]).map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span /* unslop-ignore: punto de estado de 6 px, no un botón píldora */ aria-hidden className={`size-1.5 rounded-full ${dotClass[status]}`} />
            {statusLabels[status]}
          </li>
        ))}
      </ul>
    </nav>
  );
}
