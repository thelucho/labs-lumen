"use client";

import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import type { MouseEvent, ReactNode } from "react";
import { scrollToId } from "@/lib/scroll";

/** Anclas internos con el scroll suave de la página. */
function handleAnchor(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  scrollToId(href.slice(1));
}

/**
 * Botón en pill con → (DESIGN §8 Botones). `primary`: fondo ink; `light`:
 * blanco sólido con texto ink (sobre fotos o fondos oscuros). La flecha se
 * desplaza en hover.
 */
export function PillLink({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "light" | "accent";
}) {
  const tone =
    variant === "light"
      ? "bg-white text-ink hover:bg-stone-100 focus-visible:outline-white"
      : variant === "accent"
        ? "bg-accent text-accent-ink hover:bg-white focus-visible:outline-white"
        : "bg-ink text-white hover:bg-ink-soft focus-visible:outline-ink";
  return (
    <a
      href={href}
      onClick={(e) => handleAnchor(e, href)}
      className={`group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${tone} ${className}`}
    >
      {children}
      <ArrowRight size={18} weight="light" aria-hidden className="transition-transform duration-200 ease-arch group-hover:translate-x-1" />
    </a>
  );
}

/**
 * Link de texto con ↗ (DESIGN §8): subrayado de 1 px que crece de izquierda a
 * derecha y flecha que se desplaza en su dirección. Los anclas internos usan
 * el scroll suave de la página.
 */
export function ArrowLink({
  href,
  children,
  className = "",
  tone = "ink",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "ink" | "white";
}) {
  const color = tone === "white" ? "text-white focus-visible:outline-white" : "text-ink focus-visible:outline-ink";
  return (
    <a
      href={href}
      onClick={(e) => handleAnchor(e, href)}
      className={`group inline-flex items-center gap-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 ${color} ${className}`}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-arch group-hover:scale-x-100"
        />
      </span>
      <ArrowUpRight
        size={16}
        weight="light"
        aria-hidden
        className="transition-transform duration-200 ease-arch group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
