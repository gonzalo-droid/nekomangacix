'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Menu, X, Search, ShoppingCart } from 'lucide-react';

export default function Header() {
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getTotalItems();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 font-bold text-xl sm:text-2xl text-gray-900 hover:text-purple-600 transition-colors"
          >
            🐱 Neko Manga Cix
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Productos
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Contacto
            </Link>
          </div>

          {/* Desktop Search & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                  aria-label="Buscar manga"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-600"
                  aria-label="Enviar búsqueda"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
              aria-label={`Carrito de compras con ${cartCount} artículos`}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: Search & Cart & Menu */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-purple-600"
              aria-label="Abrir búsqueda"
            >
              <Search size={20} />
            </button>

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-purple-600"
              aria-label={`Carrito de compras con ${cartCount} artículos`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-purple-600"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden mt-4 pb-4">
            <input
              type="text"
              placeholder="Buscar manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
              aria-label="Buscar manga en dispositivo móvil"
            />
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-gray-200 mt-4 pt-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
