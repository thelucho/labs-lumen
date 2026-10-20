"use client";

import { Moon, Sun, SunDim, SunHorizon, type Icon } from "@phosphor-icons/react";
import { DAY_END, DAY_MARKS, DAY_START, formatHour, type DayMarkId } from "@/lib/daylight";
import { useUIStore } from "@/lib/store";
import { introStyle } from "@/lib/ui";

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
      data-intro
      style={introStyle(1200, -28, 0)}
      className="px-2 pt-8 sm:px-3 lg:absolute lg:bottom-9 lg:left-9 lg:w-[23rem] lg:rounded-md lg:border lg:border-stone-200 lg:bg-white lg:px-6 lg:pt-4 lg:pb-1.5"
    >
      <div className="flex items-baseline justify-between">
        <label htmlFor="sun-hour" className="label-tech text-stone-600">
          Luz del día
        </label>
        <output htmlFor="sun-hour" className="font-mono text-sm tabular-nums">
          {formatHour(hour)} h
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
          "[&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-stone-400",
          "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:outline [&::-webkit-slider-thumb]:outline-1 [&::-webkit-slider-thumb]:outline-ink",
          "[&::-moz-range-track]:h-px [&::-moz-range-track]:bg-stone-400",
          "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:outline [&::-moz-range-thumb]:outline-1 [&::-moz-range-thumb]:outline-ink",
          "rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
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
                className="flex flex-col items-center gap-1 rounded-xs px-1 text-stone-600 transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
              >
                <MarkIcon size={16} weight="light" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{mark.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
