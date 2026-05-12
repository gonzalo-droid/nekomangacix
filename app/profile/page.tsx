import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/core/supabase/server';
import ProfileTabs from './ProfileTabs';
import type { UserRole } from '@/types/database.types';

export const metadata: Metadata = {
  title: 'Mi Perfil',
  robots: { index: false },
};

import type { OrderItemType, PaymentType } from '@/types/database.types';

type OrderRow = {
  id: string;
  status: string;
  payment_type: PaymentType;
  total_pen: number;
  subtotal_pen: number | null;
  discount_pen: number;
  deposit_pen: number;
  balance_pen: number;
  shipping_cost: number;
  estimated_arrival: string | null;
  payment_proof_url: string | null;
  payment_proof_confirmed_at: string | null;
  created_at: string;
  order_items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    item_type: OrderItemType;
    estimated_arrival: string | null;
  }[];
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/profile');

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, status, payment_type, total_pen, subtotal_pen, discount_pen, deposit_pen, balance_pen, shipping_cost, estimated_arrival, payment_proof_url, payment_proof_confirmed_at, created_at, order_items(id, title, quantity, unit_price, item_type, estimated_arrival)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<OrderRow[]>(),
  ]);

  const safeProfile = profile ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    phone: null,
    address: null,
    role: 'customer' as UserRole,
    has_used_first_purchase_discount: false,
    created_at: new Date().toISOString(),
  };

  return (
    <ProfileTabs
      user={{
        id: user.id,
        email: user.email ?? '',
        email_confirmed_at: user.email_confirmed_at ?? null,
      }}
      profile={safeProfile}
      orders={orders ?? []}
      initialTab={tab === 'favorites' || tab === 'orders' ? tab : 'data'}
    />
  );
}
