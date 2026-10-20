"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { scrollToId } from "@/lib/scroll";

const SIZE = 136;
const C = SIZE / 2;
const SCALLOPS = 18;

/** Borde festoneado: un arco hacia afuera entre cada par de puntos del círculo. */
function scallopPath(r: number, bulge: number): string {
  const step = (Math.PI * 2) / SCALLOPS;
  const point = (a: number) => `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
  let d = `M ${point(0)}`;
  for (let i = 1; i <= SCALLOPS; i++) d += ` A ${bulge} ${bulge} 0 0 1 ${point(i * step)}`;
  return `${d} Z`;
}

/**
 * Sticker circular giratorio (DESIGN §8): festoneado, en el acento, con el
 * texto en un `textPath` circular. Gira lento (20 s por vuelta), se detiene en
 * hover y queda quieto con prefers-reduced-motion. Uno solo por página.
 */
export function Sticker({ href, label }: { href: `#${string}`; label: string }) {
  const text = `${label} · ${label} · `;
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(href.slice(1));
      }}
      aria-label={label}
      className="group relative block size-[136px] shrink-0 rounded-full text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
        className="size-full animate-[spin_20s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        <defs>
          <path id="sticker-circle" d={`M ${C} ${C} m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0`} />
        </defs>
        <path d={scallopPath(57, 10)} className="fill-accent" />
        <text className="fill-current font-mono text-[10.5px] uppercase" letterSpacing="1.6">
          <textPath href="#sticker-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="flex size-11 items-center justify-center rounded-full bg-ink text-white transition-transform duration-200 ease-arch group-hover:rotate-45">
          <ArrowUpRight size={20} weight="light" />
        </span>
      </span>
    </a>
  );
}
