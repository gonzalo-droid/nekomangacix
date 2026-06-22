'use client';

import { useState, useEffect } from 'react';
import { Loader2, FolderOpen } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
}

export default function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((j) => setBanners(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
        <FolderOpen size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Carpeta: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">public/images/banners/</code></p>
          <p>Para agregar o quitar banners, coloca imágenes JPG/PNG/WebP en esa carpeta. Dimensiones recomendadas: <strong>1920 × 600 px</strong>. El slider del home los muestra automáticamente.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No hay imágenes en public/banners/</p>
          <p className="text-sm mt-1">Agrega archivos JPG, PNG o WebP para que aparezcan en el slider</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover" />
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{b.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
