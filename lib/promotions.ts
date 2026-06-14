import type { ProductType } from './constants/productTypes';

export type DiscountType = 'percentage' | 'fixed';
export type PromotionType = 'per_product' | 'per_product_type' | 'coupon';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  discountType: DiscountType;
  discountValue: number;
  // scope
  productIds?: string[];
  productTypes?: ProductType[];
  couponCode?: string;
  maxUses?: number;
  usesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbPromotion {
  id: string;
  name: string;
  type: PromotionType;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  discount_type: DiscountType;
  discount_value: number;
  product_ids: string[] | null;
  product_types: string[] | null;
  coupon_code: string | null;
  max_uses: number | null;
  uses_count: number;
  created_at: string;
  updated_at: string;
}

export function dbRowToPromotion(row: DbPromotion): Promotion {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    isActive: row.is_active,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    productIds: row.product_ids ?? undefined,
    productTypes: (row.product_types as ProductType[]) ?? undefined,
    couponCode: row.coupon_code ?? undefined,
    maxUses: row.max_uses ?? undefined,
    usesCount: row.uses_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function promotionToDbRow(p: Partial<Promotion>): Partial<DbPromotion> {
  return {
    ...(p.name !== undefined && { name: p.name }),
    ...(p.type !== undefined && { type: p.type }),
    ...(p.isActive !== undefined && { is_active: p.isActive }),
    ...(p.startsAt !== undefined && { starts_at: p.startsAt || null }),
    ...(p.endsAt !== undefined && { ends_at: p.endsAt || null }),
    ...(p.discountType !== undefined && { discount_type: p.discountType }),
    ...(p.discountValue !== undefined && { discount_value: p.discountValue }),
    ...(p.productIds !== undefined && { product_ids: p.productIds }),
    ...(p.productTypes !== undefined && { product_types: p.productTypes }),
    ...(p.couponCode !== undefined && { coupon_code: p.couponCode || null }),
    ...(p.maxUses !== undefined && { max_uses: p.maxUses || null }),
  };
}

/** Calculate discounted price given a list of active promotions for a product */
export function applyPromotions(
  pricePEN: number,
  productId: string,
  productType: ProductType,
  promotions: Promotion[],
): { finalPrice: number; discount: number; promotionName?: string } {
  let best: { discount: number; name: string } | null = null;

  for (const promo of promotions) {
    if (!promo.isActive) continue;
    const now = new Date();
    if (promo.startsAt && new Date(promo.startsAt) > now) continue;
    if (promo.endsAt && new Date(promo.endsAt) < now) continue;
    if (promo.type === 'coupon') continue; // coupons applied separately

    const appliesToProduct =
      promo.type === 'per_product' && promo.productIds?.includes(productId);
    const appliesToType =
      promo.type === 'per_product_type' && promo.productTypes?.includes(productType);

    if (!appliesToProduct && !appliesToType) continue;

    const discountAmt =
      promo.discountType === 'percentage'
        ? (pricePEN * promo.discountValue) / 100
        : promo.discountValue;

    if (!best || discountAmt > best.discount) {
      best = { discount: discountAmt, name: promo.name };
    }
  }

  if (!best) return { finalPrice: pricePEN, discount: 0 };
  const finalPrice = Math.max(0, pricePEN - best.discount);
  return { finalPrice: Math.round(finalPrice * 100) / 100, discount: best.discount, promotionName: best.name };
}

/** Validate a coupon code and return the matching promotion (if active) */
export function validateCoupon(code: string, promotions: Promotion[]): Promotion | null {
  const normalized = code.trim().toUpperCase();
  return (
    promotions.find((p) => {
      if (p.type !== 'coupon') return false;
      if (!p.isActive) return false;
      if (p.couponCode?.toUpperCase() !== normalized) return false;
      if (p.maxUses != null && p.usesCount >= p.maxUses) return false;
      const now = new Date();
      if (p.startsAt && new Date(p.startsAt) > now) return false;
      if (p.endsAt && new Date(p.endsAt) < now) return false;
      return true;
    }) ?? null
  );
}

/** Apply a coupon discount to a subtotal */
export function applyCouponDiscount(subtotal: number, coupon: Promotion): number {
  if (coupon.discountType === 'percentage') {
    return Math.max(0, subtotal - (subtotal * coupon.discountValue) / 100);
  }
  return Math.max(0, subtotal - coupon.discountValue);
}
