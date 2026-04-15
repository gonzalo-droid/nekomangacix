'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  editorial: string;
}

interface CartContextType {
  items: CartItem[];
  /**
   * false en SSR y primera renderización del cliente (antes de sincronizar con localStorage);
   * true después de montar. Úsalo para no renderizar contadores/badges hasta que matchee.
   */
  isHydrated: boolean;
  addToCart: (productId: string, title: string, price: number, editorial: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'neko-manga-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Empezamos en [] en cliente y SSR — coinciden. Leemos localStorage tras montar
  // para evitar mismatch de hidratación (ver PR review).
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [items, isHydrated]);

  const addToCart = (productId: string, title: string, price: number, editorial: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === productId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { productId, title, price, quantity: 1, editorial }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
