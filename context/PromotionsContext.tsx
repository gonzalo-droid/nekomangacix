'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  type Promotion,
  type DbPromotion,
  dbRowToPromotion,
  applyPromotions,
  applyCouponDiscount,
  validateCoupon,
} from '@/lib/promotions';
import type { ProductType } from '@/lib/constants/productTypes';

interface PromotionsContextValue {
  promotions: Promotion[];
  coupon: Promotion | null;
  couponCode: string;
  couponError: string | null;
  isValidatingCoupon: boolean;
  getDiscountedPrice: (pricePEN: number, productId: string, productType: ProductType) => {
    finalPrice: number;
    discount: number;
    promotionName?: string;
  };
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  getCouponDiscount: (subtotal: number) => number;
}

const PromotionsContext = createContext<PromotionsContextValue | null>(null);

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupon, setCoupon] = useState<Promotion | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) setPromotions((data as DbPromotion[]).map(dbRowToPromotion));
      })
      .catch(() => {});
  }, []);

  const getDiscountedPrice = useCallback(
    (pricePEN: number, productId: string, productType: ProductType) =>
      applyPromotions(pricePEN, productId, productType, promotions),
    [promotions]
  );

  const applyCoupon = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setCouponError(null);
    setIsValidatingCoupon(true);
    try {
      const res = await fetch('/api/promotions/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCouponError(json.error ?? 'Cupón inválido');
        return;
      }
      // Also validate client-side for expiry
      const promo = validateCoupon(trimmed, [dbRowToPromotion(json.data)]);
      if (!promo) {
        setCouponError('Cupón inválido o expirado');
        return;
      }
      setCoupon(promo);
      setCouponCode(trimmed.toUpperCase());
    } catch {
      setCouponError('Error al validar el cupón');
    } finally {
      setIsValidatingCoupon(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponCode('');
    setCouponError(null);
  }, []);

  const getCouponDiscount = useCallback(
    (subtotal: number) => (coupon ? subtotal - applyCouponDiscount(subtotal, coupon) : 0),
    [coupon]
  );

  return (
    <PromotionsContext.Provider
      value={{
        promotions,
        coupon,
        couponCode,
        couponError,
        isValidatingCoupon,
        getDiscountedPrice,
        applyCoupon,
        removeCoupon,
        getCouponDiscount,
      }}
    >
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  const ctx = useContext(PromotionsContext);
  if (!ctx) throw new Error('usePromotions must be used within PromotionsProvider');
  return ctx;
}
