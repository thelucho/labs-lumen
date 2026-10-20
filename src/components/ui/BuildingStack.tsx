import { levels, type SelectableId } from "@/data/building";
import { getUnit, selectablesOf } from "@/lib/building";
import { selectableLabel } from "@/lib/format";

/** De arriba hacia abajo: SUM, 8 … 1, PB. */
const rows = [...levels].reverse();

/**
 * Corte esquemático del edificio con la unidad resaltada. Cada piso tipo se
 * divide en B (oeste, a la izquierda) y A (este, a la derecha), como en la planta.
 */
export function BuildingStack({ activeId }: { activeId: SelectableId }) {
  return (
    <figure>
      <ul aria-label={`Ubicación en el edificio: ${selectableLabel(activeId)}`} className="flex flex-col gap-1">
        {rows.map((level) => {
          // B antes que A: oeste a la izquierda.
          const ids = [...selectablesOf(level)].sort((a, b) =>
            (getUnit(b)?.side ?? "").localeCompare(getUnit(a)?.side ?? ""),
          );
          return (
            <li key={level.id} className="flex items-center gap-3">
              <span className="w-8 text-right font-mono text-[11px] tabular-nums text-stone-600">{level.label}</span>
              <span className={`flex h-4 flex-1 gap-1 ${level.kind === "roof" ? "px-[18%]" : ""}`}>
                {ids.map((id) => (
                  <span
                    key={id}
                    aria-hidden
                    className={[
                      "flex-1 rounded-full border",
                      id === activeId ? "border-accent bg-accent" : "border-stone-200 bg-white",
                    ].join(" ")}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="label-tech mt-3 flex justify-between pl-11 text-stone-600">
        <span>Oeste</span>
        <span>Este</span>
      </figcaption>
    </figure>
  );
}
