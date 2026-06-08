'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, ShoppingBag, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cierra al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  };

  // Mientras carga, no mostrar nada para evitar flash
  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />;
  }

  // Usuario NO autenticado → botón de login
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#2b496d] dark:hover:text-[#5a7a9e] transition-colors"
      >
        <LogIn size={18} />
        <span className="hidden lg:inline">Ingresar</span>
      </Link>
    );
  }

  // Usuario autenticado → avatar + dropdown
  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? 'U';

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <div className="w-8 h-8 bg-[#2b496d] text-white rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-[#1e3550] transition-colors">
          {initials}
        </div>
        <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`hidden lg:inline text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Conectado como</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <User size={16} className="text-gray-400" />
            Mi Perfil
          </Link>

          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ShoppingBag size={16} className="text-gray-400" />
            Mis Pedidos
          </Link>

          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
