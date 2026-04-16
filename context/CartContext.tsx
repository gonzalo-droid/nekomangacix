'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StockStatus } from '@/lib/products';

/** Depósito por defecto (S/) por unidad de preventa si el producto no define preorderDeposit propio */
export const DEFAULT_PREORDER_DEPOSIT = 10;

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  editorial: string;
  /** Se añaden para diferenciar pago completo vs reserva. Opcionales para compatibilidad con items viejos en localStorage. */
  stockStatus?: StockStatus;
  preorderDeposit?: number;
  /** Slug para enlazar al detalle sin lookup extra */
  slug?: string;
}

interface AddToCartOptions {
  stockStatus?: StockStatus;
  preorderDeposit?: number;
  slug?: string;
}

interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;
  addToCart: (
    productId: string,
    title: string,
    price: number,
    editorial: string,
    options?: AddToCartOptions
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'neko-manga-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
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

  const addToCart = (
    productId: string,
    title: string,
    price: number,
    editorial: string,
    options?: AddToCartOptions
  ) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.productId === productId);
      if (existing) {
        return prevItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                // Si el producto venía sin metadata en localStorage, la completamos ahora
                stockStatus: item.stockStatus ?? options?.stockStatus,
                preorderDeposit: item.preorderDeposit ?? options?.preorderDeposit,
                slug: item.slug ?? options?.slug,
              }
            : item
        );
      }
      return [
        ...prevItems,
        {
          productId,
          title,
          price,
          quantity: 1,
          editorial,
          stockStatus: options?.stockStatus,
          preorderDeposit: options?.preorderDeposit,
          slug: options?.slug,
        },
      ];
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

/**
 * Helpers para cálculos de pago "hoy" vs "al llegar".
 * Un item de preventa reserva con preorderDeposit (o DEFAULT_PREORDER_DEPOSIT);
 * el resto de estados pagan el precio completo.
 */
export function getItemPaymentSplit(item: CartItem) {
  const isPreorder = item.stockStatus === 'preorder';
  const unitDeposit = isPreorder
    ? item.preorderDeposit ?? DEFAULT_PREORDER_DEPOSIT
    : 0;
  const unitNow = isPreorder ? unitDeposit : item.price;
  const unitLater = isPreorder ? Math.max(0, item.price - unitDeposit) : 0;
  return {
    isPreorder,
    unitDeposit,
    unitNow,
    unitLater,
    now: unitNow * item.quantity,
    later: unitLater * item.quantity,
    full: item.price * item.quantity,
  };
}
