'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  productId: string;
  title: string;
  price: number;
  editorial: string;
  slug: string;
  preorderDeposit?: number;
  className?: string;
}

export default function ReserveButton({
  productId,
  title,
  price,
  editorial,
  slug,
  preorderDeposit,
  className,
}: Props) {
  const { addToCart } = useCart();
  const [reserved, setReserved] = useState(false);

  const handleClick = () => {
    addToCart(productId, title, price, editorial, {
      stockStatus: 'preorder',
      preorderDeposit,
      slug,
    });
    setReserved(true);
    setTimeout(() => setReserved(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
        reserved
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-[#ec4899]/30'
      } ${className ?? ''}`}
      aria-label={`Reservar ${title} con el 50% de adelanto`}
    >
      {reserved ? (
        <>
          <CheckCircle2 size={18} />
          <span>✓ Reservado</span>
        </>
      ) : (
        <>
          <Clock size={18} />
          <span>Reservar</span>
        </>
      )}
    </button>
  );
}
