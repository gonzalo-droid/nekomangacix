'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, Package, ShoppingBag, ChevronLeft } from 'lucide-react';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import ProductsManager from './products/ProductsManager';

type AdminTab = 'products' | 'images';

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
            <button onClick={() => setActiveTab('images')} className={tabClass('images')}>
              <ImageIcon size={18} /> Imágenes (Cloudinary)
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && <ProductsManager />}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div>
            <div className="mb-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Cómo subir imágenes</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-300">
                <li>Sube la imagen y dale un nombre descriptivo (ej: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">jjk-vol1</code>).</li>
                <li>Copia el nombre de la imagen subida.</li>
                <li>Úsalo en el campo <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">images</code> al crear o editar un producto.</li>
                <li>Varias imágenes: sepáralas con coma en el Excel o en el formulario.</li>
              </ol>
            </div>
            <CloudinaryUploader />
          </div>
        )}
      </div>
    </div>
  );
}
