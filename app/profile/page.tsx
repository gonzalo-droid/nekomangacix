import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/core/supabase/server';
import ProfileTabs from './ProfileTabs';
import type { UserRole } from '@/types/database.types';

export const metadata: Metadata = {
  title: 'Mi Perfil',
  robots: { index: false },
};

type OrderRow = {
  id: string;
  status: string;
  total_pen: number;
  shipping_cost: number;
  payment_method: string | null;
  created_at: string;
  order_items: { id: string; title: string; quantity: number; unit_price: number }[];
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
      .select('id, status, total_pen, shipping_cost, payment_method, created_at, order_items(id, quantity, unit_price, title)')
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
