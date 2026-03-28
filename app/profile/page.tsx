import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/core/supabase/server';
import ProfileForm from './ProfileForm';
import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';
import type { UserRole } from '@/types/database.types';

export const metadata: Metadata = {
  title: 'Mi Perfil',
  robots: { index: false },
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/profile');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Si aún no tiene perfil (trigger puede tardar), crear uno vacío en memoria
  const safeProfile = profile ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    phone: null,
    address: null,
    role: 'customer' as UserRole,
    created_at: new Date().toISOString(),
  };

  const displayName = safeProfile.full_name || user.email?.split('@')[0] || 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-[#2b496d] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {initials}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            {safeProfile.role === 'admin' && (
              <span className="mt-2 inline-block text-xs bg-[#2b496d] text-white px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#2b496d] dark:text-[#5a7a9e] bg-blue-50 dark:bg-blue-900/10 border-l-4 border-[#2b496d] dark:border-[#5a7a9e]"
            >
              <User size={16} />
              Mi Perfil
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ShoppingBag size={16} className="text-gray-400" />
              Mis Pedidos
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Datos de cuenta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Datos de cuenta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Esta información se usará para coordinar tus envíos.
            </p>
            <ProfileForm profile={safeProfile} />
          </div>

          {/* Email (no editable) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Correo electrónico
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {user.email_confirmed_at ? '✓ Verificado' : '⚠ Sin verificar'}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">No editable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
