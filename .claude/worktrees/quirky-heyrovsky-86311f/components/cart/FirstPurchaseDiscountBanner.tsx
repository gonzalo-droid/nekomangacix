'use client';

import Link from 'next/link';

interface Props {
  isLoggedIn: boolean;
  eligible: boolean;
}

export default function FirstPurchaseDiscountBanner({ isLoggedIn, eligible }: Props) {
  if (isLoggedIn && !eligible) return null;

  if (eligible) {
    return (
      <div className="mb-6 relative overflow-hidden rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/15 via-emerald-400/10 to-emerald-500/15 p-4 shadow-md shadow-emerald-500/10 animate-tilt-in">
        <span
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-sheen"
          aria-hidden="true"
        />
        <p className="relative text-sm font-extrabold text-emerald-700 dark:text-emerald-300 text-center tracking-wide">
          ✨ ¡Descuento de bienvenida aplicado! 10% OFF en tu primera compra ✨
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-orange-400/40 bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-orange-500/10 p-4">
      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 text-center">
        🎉{' '}
        <Link
          href="/auth/register"
          className="underline decoration-orange-500/60 underline-offset-2 hover:decoration-orange-500 font-bold"
        >
          Regístrate
        </Link>{' '}
        y obtén 10% OFF en tu primera compra
      </p>
    </div>
  );
}
