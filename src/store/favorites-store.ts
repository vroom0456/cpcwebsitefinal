import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (photoId: string) => void;
  isFavorite: (photoId: string) => boolean;
  clearFavorites: () => void;
}

/**
 * Favorites live entirely in the visitor's browser (localStorage) — the
 * public site never sends this back to the server, so there's nothing to
 * moderate or attribute to a person.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (photoId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(photoId)
            ? state.favoriteIds.filter((id) => id !== photoId)
            : [...state.favoriteIds, photoId],
        })),
      isFavorite: (photoId) => get().favoriteIds.includes(photoId),
      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    { name: "cpc-favorites" }
  )
);
