import { create } from "zustand";
import type { SelectableId } from "@/data/building";
import { DEFAULT_HOUR, clampHour, daylightFactor } from "@/lib/daylight";

interface UIState {
  /** Unidad, PB o SUM bajo el puntero (3D o selector). */
  hoveredId: SelectableId | null;
  /** Unidad seleccionada: queda encendida mientras la ficha está abierta. */
  selectedId: SelectableId | null;
  /** Ficha fullscreen de la unidad, PB o SUM. */
  isDetailOpen: boolean;
  isModalOpen: boolean;
  /** Primer hover, drag o selección: corta la auto-rotación para siempre. */
  hasInteracted: boolean;
  /** Hora del día que define la posición del sol (slider del hero). */
  hour: number;

  setHovered: (id: SelectableId | null) => void;
  /** Selecciona y abre la ficha fullscreen. */
  select: (id: SelectableId) => void;
  closeDetail: () => void;
  openModal: () => void;
  closeModal: () => void;
  markInteracted: () => void;
  setHour: (hour: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hoveredId: null,
  selectedId: null,
  isDetailOpen: false,
  isModalOpen: false,
  hasInteracted: false,
  hour: DEFAULT_HOUR,

  setHovered: (id) => set(id ? { hoveredId: id, hasInteracted: true } : { hoveredId: null }),
  select: (id) => set({ selectedId: id, isDetailOpen: true, hasInteracted: true }),
  // El hover también se limpia: el puntero quedó sobre la ficha, no sobre el edificio.
  closeDetail: () => set({ selectedId: null, hoveredId: null, isDetailOpen: false, isModalOpen: false }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  markInteracted: () => set({ hasInteracted: true }),
  setHour: (hour) => set({ hour: clampHour(hour) }),
}));

/**
 * Única unidad encendida: la apuntada; si no se apunta nada, la seleccionada
 * (queda encendida aunque el mouse salga).
 */
export const selectLitId = (s: UIState): SelectableId | null => s.hoveredId ?? s.selectedId;

/** Escena oscura: el texto que va sobre el 3D pasa a claro para seguir leyéndose. */
export const selectIsDark = (s: UIState): boolean => daylightFactor(s.hour) < 0.2;

// Solo en desarrollo: acceso al store desde la consola y las pruebas automatizadas.
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __lumenStore?: typeof useUIStore }).__lumenStore = useUIStore;
}
