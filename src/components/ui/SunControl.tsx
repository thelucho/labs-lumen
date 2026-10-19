"use client";

import { Moon, Sun, SunDim, SunHorizon, type Icon } from "@phosphor-icons/react";
import { DAY_END, DAY_MARKS, DAY_START, formatHour, type DayMarkId } from "@/lib/daylight";
import { useUIStore } from "@/lib/store";

const markIcons: Record<DayMarkId, Icon> = {
  morning: SunHorizon,
  noon: Sun,
  evening: SunDim,
  night: Moon,
};

/** Diámetro del control (clases del thumb): las referencias se alinean con su centro. */
const THUMB = 14;

/** Posición horizontal de una hora, alineada con el centro del control del slider. */
function trackPosition(hour: number): string {
  const p = (hour - DAY_START) / (DAY_END - DAY_START);
  return `calc(${p} * (100% - ${THUMB}px) + ${THUMB / 2}px)`;
}

/**
 * Hora del día: mueve el sol de forma continua (06:00 a 22:00) y con él luces,
 * sombras y cielo. Las cuatro referencias solo orientan y llevan a esa hora.
 */
export function SunControl() {
  const hour = useUIStore((s) => s.hour);
  const setHour = useUIStore((s) => s.setHour);

  return (
    <div
      data-keep-panel
      className="px-4 pt-6 sm:px-8 lg:absolute lg:bottom-8 lg:left-8 lg:w-[21rem] lg:rounded-xs lg:border lg:border-stone lg:bg-paper lg:px-4 lg:pt-3 lg:pb-1"
    >
      <div className="flex items-baseline justify-between">
        <label htmlFor="sun-hour" className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate">
          Luz del día
        </label>
        <output htmlFor="sun-hour" className="text-sm font-medium tabular-nums">
          {formatHour(hour)}
        </output>
      </div>
      <input
        id="sun-hour"
        type="range"
        min={DAY_START * 60}
        max={DAY_END * 60}
        step={1}
        value={Math.round(hour * 60)}
        aria-valuetext={`${formatHour(hour)} h`}
        onChange={(e) => setHour(Number(e.target.value) / 60)}
        className={[
          "mt-3 block h-5 w-full cursor-pointer appearance-none bg-transparent",
          "[&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-graphite/40",
          "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-paper [&::-webkit-slider-thumb]:bg-brass",
          "[&::-moz-range-track]:h-px [&::-moz-range-track]:bg-graphite/40",
          "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:bg-brass",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite",
        ].join(" ")}
      />
      <ul className="relative mt-1 h-10">
        {DAY_MARKS.map((mark) => {
          const MarkIcon = markIcons[mark.id];
          return (
            <li
              key={mark.id}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: trackPosition(mark.hour) }}
            >
              <button
                type="button"
                onClick={() => setHour(mark.hour)}
                aria-label={`${mark.label}, ${formatHour(mark.hour)} h`}
                className="flex flex-col items-center gap-1 rounded-xs px-1 text-slate transition-colors duration-150 hover:text-graphite focus-visible:outline-2 focus-visible:outline-graphite"
              >
                <MarkIcon size={16} weight="light" aria-hidden />
                <span className="text-[10px] font-medium uppercase tracking-[0.14em]">{mark.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
