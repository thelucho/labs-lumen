import { create } from "zustand";
import type { SelectableId } from "@/data/building";

interface UIState {
  /** Unidad, PB o SUM bajo el puntero (3D o selector). */
  hoveredId: SelectableId | null;
  /** Unidad seleccionada: queda encendida mientras el panel está abierto. */
  selectedId: SelectableId | null;
  isPanelOpen: boolean;
  isModalOpen: boolean;
  /** Primer hover, drag o selección: corta la auto-rotación para siempre. */
  hasInteracted: boolean;

  setHovered: (id: SelectableId | null) => void;
  /** Selecciona y abre el panel con la ficha. */
  select: (id: SelectableId) => void;
  closePanel: () => void;
  openModal: () => void;
  closeModal: () => void;
  markInteracted: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hoveredId: null,
  selectedId: null,
  isPanelOpen: false,
  isModalOpen: false,
  hasInteracted: false,

  setHovered: (id) => set(id ? { hoveredId: id, hasInteracted: true } : { hoveredId: null }),
  select: (id) => set({ selectedId: id, isPanelOpen: true, hasInteracted: true }),
  closePanel: () => set({ selectedId: null, isPanelOpen: false, isModalOpen: false }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  markInteracted: () => set({ hasInteracted: true }),
}));

/**
 * Única unidad encendida: la apuntada; si no se apunta nada, la seleccionada
 * (queda encendida aunque el mouse salga).
 */
export const selectLitId = (s: UIState): SelectableId | null => s.hoveredId ?? s.selectedId;

// Solo en desarrollo: acceso al store desde la consola y las pruebas automatizadas.
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __lumenStore?: typeof useUIStore }).__lumenStore = useUIStore;
}
