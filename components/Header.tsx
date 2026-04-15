'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Menu, X, Search, ShoppingCart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import Wordmark from './Wordmark';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/products', label: 'Productos' },
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contacto' },
] as const;

export default function Header() {
  const { getTotalItems, isHydrated } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Antes de hidratar, fuerza 0 para que server y cliente matcheen
  const cartCount = isHydrated ? getTotalItems() : 0;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-gray-200/70 dark:border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center gap-4">
          {/* Logo + Wordmark */}
          <Link
            href="/"
            className="group flex-shrink-0 flex items-center gap-2.5 transition-opacity hover:opacity-95"
            aria-label="Neko Manga Cix — Ir al inicio"
          >
            <div className="relative">
              <Image
                src="/images/logo-light.png"
                alt=""
                width={120}
                height={40}
                className="h-9 w-auto dark:hidden"
                priority
                aria-hidden="true"
              />
              <Image
                src="/images/logo-dark.png"
                alt=""
                width={120}
                height={40}
                className="h-9 w-auto hidden dark:block"
                priority
                aria-hidden="true"
              />
              {/* Glow al hover */}
              <span
                className="absolute inset-0 bg-[#ec4899] opacity-0 group-hover:opacity-25 blur-xl transition-opacity pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-[1]">
              <Wordmark size="sm" tone="auto" className="group-hover:scale-[1.02] transition-transform origin-left" />
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                Manga · Coleccionables
              </span>
            </div>
          </Link>

          {/* Desktop Search - Left side, wider */}
          <div className="hidden md:block flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                placeholder="Buscar manga, editorial, autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-100/80 dark:bg-white/5 border border-transparent rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/30 transition-all"
                aria-label="Buscar manga"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#06b6d4] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-white hover:bg-[#ec4899] text-xs font-semibold transition-all"
                aria-label="Buscar"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-auto">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'text-[#ec4899]'
                      : 'text-gray-700 dark:text-gray-200 hover:text-[#ec4899] dark:hover:text-[#ec4899]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/cart"
              className="relative ml-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors"
              aria-label={`Carrito de compras con ${cartCount} artículos`}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#ec4899] to-[#f97316] text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-lg shadow-[#ec4899]/40 ring-2 ring-white dark:ring-[#0a0a0f]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <UserMenu />
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center space-x-1 ml-auto">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors"
              aria-label="Abrir búsqueda"
            >
              <Search size={20} />
            </button>

            <Link
              href="/cart"
              className="relative p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors"
              aria-label={`Carrito de compras con ${cartCount} artículos`}
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
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden mt-3 pb-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar manga, editorial, autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-gray-100/80 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-[#06b6d4]/30 transition-all"
                aria-label="Buscar manga en dispositivo móvil"
                autoFocus
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-2 space-y-1 border-t border-gray-200 dark:border-white/5 mt-3 pt-3">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2.5 rounded-md font-medium transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#ec4899]/10 to-[#06b6d4]/10 text-[#ec4899]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#ec4899]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
