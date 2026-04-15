'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: string[];
  /** false en SSR y antes de sincronizar con localStorage; true después. Evita mismatch. */
  isHydrated: boolean;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'neko-manga-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setFavorites(JSON.parse(saved) as string[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, isHydrated]);

  const addToFavorites = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(productId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isHydrated,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
