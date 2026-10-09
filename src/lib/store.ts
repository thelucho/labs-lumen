import { create } from "zustand";
import type { SelectableId } from "@/data/building";

interface UIState {
  /** Unidad, PB o SUM bajo el puntero (3D o selector). */
  hoveredId: SelectableId | null;
  /** Unidad seleccionada: queda encendida mientras el panel está abierto. */
  selectedId: SelectableId | null;
  isPanelOpen: boolean;
  isModalOpen: boolean;

  setHovered: (id: SelectableId | null) => void;
  /** Selecciona y abre el panel con la ficha. */
  select: (id: SelectableId) => void;
  closePanel: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hoveredId: null,
  selectedId: null,
  isPanelOpen: false,
  isModalOpen: false,

  setHovered: (id) => set({ hoveredId: id }),
  select: (id) => set({ selectedId: id, isPanelOpen: true }),
  closePanel: () => set({ selectedId: null, isPanelOpen: false, isModalOpen: false }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));

/**
 * Única unidad encendida: la apuntada; si no se apunta nada, la seleccionada
 * (queda encendida aunque el mouse salga).
 */
export const selectLitId = (s: UIState): SelectableId | null => s.hoveredId ?? s.selectedId;
