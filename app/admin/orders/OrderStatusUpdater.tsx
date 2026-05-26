'use client';

import { useState, useTransition } from 'react';
import type { OrderStatus } from '@/types/database.types';
import { ORDER_STATES, ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

function normalize(status: OrderStatus): OrderState {
  if (status === 'pending') return 'pending_deposit';
  if (status === 'paid') return 'confirmed';
  return status;
}

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderState>(normalize(currentStatus));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: OrderState) {
    setStatus(newStatus);
    setSaved(false);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as OrderState)}
        disabled={isPending}
        className="text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d] disabled:opacity-60"
      >
        {ORDER_STATES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATE_INFO[s].label}
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-green-600 dark:text-green-400">✓ Guardado</span>}
    </div>
  );
}
