import type { CartItem } from '@/context/CartContext';

export const FREE_SHIPPING_THRESHOLD_PEN = 100;
export const STANDARD_SHIPPING_PEN = 15;
export const FIRST_PURCHASE_DISCOUNT_RATE = 0.10;
export const PREORDER_DEPOSIT_RATE = 0.50;

export type CartTotals = {
  stockSubtotal: number;
  preorderSubtotal: number;
  subtotal: number;
  discount: number;
  shipping: number;
  preorderDeposit: number;
  balanceDue: number;
  totalToPayNow: number;
  appliedFirstPurchaseDiscount: boolean;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateCartTotals(args: {
  items: CartItem[];
  isFirstPurchase: boolean;
}): CartTotals {
  const { items, isFirstPurchase } = args;

  let stockSubtotal = 0;
  let preorderSubtotal = 0;

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    if (item.stockStatus === 'preorder') {
      preorderSubtotal += lineTotal;
    } else {
      stockSubtotal += lineTotal;
    }
  }

  stockSubtotal = round2(stockSubtotal);
  preorderSubtotal = round2(preorderSubtotal);
  const subtotal = round2(stockSubtotal + preorderSubtotal);

  const appliedFirstPurchaseDiscount = isFirstPurchase && subtotal > 0;
  const discount = appliedFirstPurchaseDiscount
    ? round2(subtotal * FIRST_PURCHASE_DISCOUNT_RATE)
    : 0;

  // Reparto proporcional del descuento entre stock y preventa
  const stockDiscountShare =
    subtotal > 0 ? round2(discount * (stockSubtotal / subtotal)) : 0;
  const preorderDiscountShare = round2(discount - stockDiscountShare);

  // El descuento de preventa se aplica solo a su porción de depósito (50%)
  const preorderDeposit = round2(preorderSubtotal * PREORDER_DEPOSIT_RATE);
  const preorderDepositDiscountShare = round2(preorderDiscountShare * PREORDER_DEPOSIT_RATE);
  const balanceDue = round2(preorderSubtotal - preorderDeposit - (preorderDiscountShare - preorderDepositDiscountShare));

  const afterDiscount = round2(subtotal - discount);
  const shipping =
    subtotal > 0 && afterDiscount >= FREE_SHIPPING_THRESHOLD_PEN
      ? 0
      : subtotal > 0
        ? STANDARD_SHIPPING_PEN
        : 0;

  const totalToPayNow = round2(
    (stockSubtotal - stockDiscountShare) +
      (preorderDeposit - preorderDepositDiscountShare) +
      shipping
  );

  return {
    stockSubtotal,
    preorderSubtotal,
    subtotal,
    discount,
    shipping,
    preorderDeposit,
    balanceDue,
    totalToPayNow,
    appliedFirstPurchaseDiscount,
  };
}
