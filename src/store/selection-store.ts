import { create } from "zustand";

interface SelectionState {
  selectedIds: Set<string>;
  toggle: (photoId: string) => void;
  selectAll: (photoIds: string[]) => void;
  clear: () => void;
  isSelected: (photoId: string) => boolean;
}

/**
 * Selection is scoped to whatever gallery is mounted — deliberately not
 * persisted, so it resets when the visitor leaves the page.
 */
export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set(),
  toggle: (photoId) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.has(photoId) ? next.delete(photoId) : next.add(photoId);
      return { selectedIds: next };
    }),
  selectAll: (photoIds) => set({ selectedIds: new Set(photoIds) }),
  clear: () => set({ selectedIds: new Set() }),
  isSelected: (photoId) => get().selectedIds.has(photoId),
}));
