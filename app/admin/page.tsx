'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, Package, ShoppingBag, ChevronLeft, Tag, Layers, BookMarked } from 'lucide-react';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import CloudinaryManager from '@/components/CloudinaryManager';
import ProductsManager from './products/ProductsManager';
import PromotionsManager from './promotions/PromotionsManager';
import SeriesManager from './series/SeriesManager';
import LegendView from './legend/LegendView';

type AdminTab = 'products' | 'series' | 'promotions' | 'images' | 'legend';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  const tabClass = (tab: AdminTab) =>
    `pb-3 px-2 font-medium transition-colors flex items-center gap-2 text-sm ${
      activeTab === tab
        ? 'border-b-2 border-[#2b496d] text-[#2b496d] dark:border-[#5a7a9e] dark:text-[#5a7a9e]'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/products" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
            <ChevronLeft size={18} /> Volver a productos
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona productos, imágenes y pedidos</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 bg-[#2b496d] hover:bg-[#1e3550] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingBag size={16} /> Ver Pedidos
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-6">
            <button onClick={() => setActiveTab('products')} className={tabClass('products')}>
              <Package size={18} /> Productos
            </button>
            <button onClick={() => setActiveTab('series')} className={tabClass('series')}>
              <Layers size={18} /> Series
            </button>
            <button onClick={() => setActiveTab('promotions')} className={tabClass('promotions')}>
              <Tag size={18} /> Promociones
            </button>
            <button onClick={() => setActiveTab('images')} className={tabClass('images')}>
              <ImageIcon size={18} /> Imágenes (Cloudinary)
            </button>
            <button onClick={() => setActiveTab('legend')} className={tabClass('legend')}>
              <BookMarked size={18} /> Leyenda
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && <ProductsManager />}

        {/* Series Tab */}
        {activeTab === 'series' && <SeriesManager />}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && <PromotionsManager />}

        {/* Legend Tab */}
        {activeTab === 'legend' && <LegendView />}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Subir nueva imagen */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Subir imagen</h3>
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
                <p className="text-blue-800 dark:text-blue-300">
                  Usa el formato <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">neko-manga/products/ivrea-mashle-16</code> como nombre. Varias imágenes por producto: sepáralas con coma en el Excel.
                </p>
              </div>
              <CloudinaryUploader />
            </div>

            {/* Gestionar imágenes existentes */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Gestionar imágenes</h3>
              <CloudinaryManager />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
