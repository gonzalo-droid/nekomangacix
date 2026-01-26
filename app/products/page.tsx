'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import { products, filterProducts, getAllEditorials } from '@/lib/products';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedEditorial, setSelectedEditorial] = useState(searchParams.get('editorial') || '');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const editorials = getAllEditorials();

  const filteredProducts = useMemo(() => {
    return filterProducts(searchQuery, selectedEditorial, minPrice, maxPrice, inStockOnly);
  }, [searchQuery, selectedEditorial, minPrice, maxPrice, inStockOnly]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleEditorialChange = (editorial: string) => {
    setSelectedEditorial(editorial);
    setCurrentPage(1);
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  };

  const handleStockChange = (inStockOnly: boolean) => {
    setInStockOnly(inStockOnly);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1">
          <Filters
            onSearch={handleSearch}
            onEditorialChange={handleEditorialChange}
            onPriceChange={handlePriceChange}
            onStockChange={handleStockChange}
            editorials={editorials}
          />
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          {/* Results Info */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300">
              Mostrando{' '}
              <span className="font-semibold">
                {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              a{' '}
              <span className="font-semibold">
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold">{filteredProducts.length}</span> productos
            </p>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                  >
                    ← Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === i + 1
                            ? 'bg-[#2b496d] text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Página ${i + 1}`}
                        aria-current={currentPage === i + 1 ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima página"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                No se encontraron productos que coincidan con tu búsqueda.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Intenta ajustar los filtros o la búsqueda.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">Cargando...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
