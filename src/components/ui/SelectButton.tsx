"use client";

import type { ReactNode } from "react";
import type { SelectableId } from "@/data/building";
import { useUIStore } from "@/lib/store";

/** Botón que abre la ficha fullscreen de una unidad, PB o SUM desde la landing. */
export function SelectButton({ id, className, children, label }: { id: SelectableId; className?: string; children: ReactNode; label?: string }) {
  const select = useUIStore((s) => s.select);
  return (
    <button type="button" onClick={() => select(id)} aria-label={label} className={className}>
      {children}
    </button>
  );
}
