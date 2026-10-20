"use client";

import { ArrowRight, List, X } from "@phosphor-icons/react";
import { useRef, type MouseEvent } from "react";
import { project } from "@/data/building";
import { scrollToId } from "@/lib/scroll";
import { introStyle } from "@/lib/ui";
import { Isologo } from "./Isologo";

/** Secciones de la landing, en orden (los ids están en sections.tsx). */
export const NAV_SECTIONS = [
  { id: "proyecto", label: "Proyecto" },
  { id: "amenities", label: "Amenities" },
  { id: "ubicacion", label: "Ubicación" },
  { id: "compra", label: "Cómo comprar" },
] as const;

/** Pill sobre la escena 3D: se lee igual sobre el cielo de día y de noche. */
const overScene = "border border-white/70 bg-white/75 text-ink backdrop-blur-md";

function go(e: MouseEvent<HTMLAnchorElement>, id: string, after?: () => void) {
  e.preventDefault();
  after?.();
  // Con el menú abierto el html no scrollea: se espera a que se cierre.
  requestAnimationFrame(() => scrollToId(id));
}

/**
 * Navegación sobre el hero (DESIGN §8): logo en círculo con el nombre, links
 * en pills y la consulta como botón primario. En mobile, botón circular que
 * abre un overlay negro a pantalla completa con los links grandes.
 */
export function SiteNav() {
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();

  return (
    <header
      data-intro
      style={introStyle(800, 0, -12)}
      className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-3 sm:p-5"
    >
      <a
        href="#inicio"
        onClick={(e) => go(e, "inicio")}
        className={`${overScene} flex items-center gap-2.5 rounded-full py-1 pr-4 pl-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-ink text-white">
          <Isologo className="size-6" />
        </span>
        <span className="font-display text-sm font-semibold tracking-[-0.01em]">{project.name}</span>
      </a>

      <nav aria-label="Secciones" className="hidden lg:block">
        <ul className="flex gap-1.5">
          {NAV_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => go(e, s.id)}
                className={`${overScene} block rounded-full px-4 py-2 text-sm transition-colors duration-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <a
          href="#contacto"
          onClick={(e) => go(e, "contacto")}
          className="group hidden items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-white transition-colors duration-200 hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:inline-flex"
        >
          Consultar
          <ArrowRight size={16} weight="light" aria-hidden className="transition-transform duration-200 ease-arch group-hover:translate-x-1" />
        </a>
        <button
          type="button"
          onClick={() => menu.current?.showModal()}
          aria-label="Abrir menú"
          aria-haspopup="dialog"
          className={`${overScene} flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden`}
        >
          <List size={20} weight="light" aria-hidden />
        </button>
      </div>

      <dialog
        ref={menu}
        aria-label="Menú"
        data-lenis-prevent
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-white backdrop:bg-ink lg:hidden"
      >
        <div className="flex min-h-full flex-col p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 py-1 pl-1">
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-ink">
                <Isologo className="size-6" />
              </span>
              <span className="font-display text-sm font-semibold">{project.name}</span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar menú"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={20} weight="light" aria-hidden />
            </button>
          </div>
          <ol className="mt-16 flex flex-col">
            {[...NAV_SECTIONS, { id: "contacto", label: "Contacto" }].map((s, i) => (
              <li key={s.id} className="border-b border-white/20">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id, close)}
                  className="flex items-baseline gap-4 py-4 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="label-tech tabular-nums text-white/60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-display-lg font-medium">{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="label-tech mt-auto pt-10 text-white/60">
            {project.address} · Entrega {project.delivery}
          </p>
        </div>
      </dialog>
    </header>
  );
}
