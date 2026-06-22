'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import Wordmark from './Wordmark';

const NAV = [
  { href: '/', label: 'Inicio', exact: true },
  { href: '/products', label: 'Catálogo', exact: false },
  { href: '/products?stock=preorder', label: 'Preventas', exact: false, badge: true },
] as const;

export default function Header() {
  const { getTotalItems, isHydrated } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = isHydrated ? getTotalItems() : 0;

  const isActive = (href: string, exact: boolean) => {
    const base = href.split('?')[0];
    if (exact) return pathname === base;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-gray-200/60 dark:border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">

          {/* Logo + Wordmark */}
          <Link
            href="/"
            className="group flex-shrink-0 flex items-center gap-2.5"
            aria-label="Neko Manga Cix — Ir al inicio"
          >
            <div className="relative">
              <Image
                src="/images/brand/logo-dark.png"
                alt=""
                width={120}
                height={40}
                className="h-9 w-auto"
                priority
                aria-hidden="true"
              />
              <span className="absolute inset-0 bg-[#ec4899] opacity-0 group-hover:opacity-20 blur-xl transition-opacity pointer-events-none" aria-hidden="true" />
            </div>
            <div className="hidden sm:flex flex-col leading-[1]">
              <Wordmark size="sm" tone="auto" className="group-hover:scale-[1.02] transition-transform origin-left" />
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                Manga · Coleccionables
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {NAV.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#ec4899]/10 text-[#ec4899] dark:bg-[#ec4899]/15'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {'badge' in item && item.badge && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec4899] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ec4899]" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop search — centrado */}
          <div className="hidden md:block flex-1 max-w-lg mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#06b6d4] transition-colors" />
              <input
                type="text"
                placeholder="Buscar manga, autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-100/80 dark:bg-white/5 border border-transparent rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                aria-label="Buscar manga"
              />
            </form>
          </div>

          {/* Iconos derecha */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {/* Separador */}
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" aria-hidden="true" />

            <Link
              href="/cart"
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-all"
              aria-label={`Carrito — ${cartCount} artículos`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#ec4899] to-[#f97316] text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-lg shadow-[#ec4899]/40 ring-2 ring-white dark:ring-[#0a0a0f]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <UserMenu />
            <ThemeToggle />
          </div>

          {/* Mobile: carrito + hamburguesa */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-[#ec4899] transition-colors"
              aria-label={`Carrito — ${cartCount} artículos`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#ec4899] to-[#f97316] text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-lg ring-2 ring-white dark:ring-[#0a0a0f]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu — incluye búsqueda */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-white/5 pt-3 space-y-1">
            {/* Búsqueda dentro del menú */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar manga, autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 transition-all"
                autoFocus
              />
            </form>

            {NAV.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    active
                      ? 'bg-[#ec4899]/10 text-[#ec4899]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  {'badge' in item && item.badge && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#ec4899] bg-[#ec4899]/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] animate-pulse" />
                      Activas
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Separador + acceso a perfil/login en mobile */}
            <div className="border-t border-gray-100 dark:border-white/5 pt-2 mt-1">
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} className="text-[#06b6d4]" />
                  Mi perfil
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} className="text-gray-400" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
