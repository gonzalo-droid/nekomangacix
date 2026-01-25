'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FiltersProps {
  onSearch: (query: string) => void;
  onEditorialChange: (editorial: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onStockChange: (inStockOnly: boolean) => void;
  editorials: string[];
}

export default function Filters({
  onSearch,
  onEditorialChange,
  onPriceChange,
  onStockChange,
  editorials,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEditorial, setSelectedEditorial] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('search');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleEditorialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const editorial = e.target.value;
    setSelectedEditorial(editorial);
    onEditorialChange(editorial);
  };

  const handlePriceChange = () => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    onPriceChange(min, max);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setInStockOnly(checked);
    onStockChange(checked);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEditorial('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    onSearch('');
    onEditorialChange('');
    onPriceChange(0, Infinity);
    onStockChange(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
        {(searchQuery || selectedEditorial || minPrice || maxPrice || inStockOnly) && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'search' ? null : 'search')}
          className="w-full flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 rounded px-2 -mx-2"
          aria-expanded={expandedSection === 'search'}
        >
          <h3 className="font-semibold text-gray-900">Búsqueda</h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSection === 'search' ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSection === 'search' && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Buscar manga, autor..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Buscar productos"
            />
          </div>
        )}
      </div>

      {/* Editorial Filter */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'editorial' ? null : 'editorial')}
          className="w-full flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 rounded px-2 -mx-2"
          aria-expanded={expandedSection === 'editorial'}
        >
          <h3 className="font-semibold text-gray-900">Editorial</h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSection === 'editorial' ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSection === 'editorial' && (
          <div className="mt-3">
            <select
              value={selectedEditorial}
              onChange={handleEditorialChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filtrar por editorial"
            >
              <option value="">Todas las editoriales</option>
              {editorials.map((editorial) => (
                <option key={editorial} value={editorial}>
                  {editorial}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}
          className="w-full flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 rounded px-2 -mx-2"
          aria-expanded={expandedSection === 'price'}
        >
          <h3 className="font-semibold text-gray-900">Rango de Precio</h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSection === 'price' ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSection === 'price' && (
          <div className="mt-3 space-y-3">
            <input
              type="number"
              placeholder="Precio mínimo (S/)"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                handlePriceChange();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Precio mínimo"
            />
            <input
              type="number"
              placeholder="Precio máximo (S/)"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                handlePriceChange();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Precio máximo"
            />
          </div>
        )}
      </div>

      {/* Stock Filter */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'stock' ? null : 'stock')}
          className="w-full flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 rounded px-2 -mx-2"
          aria-expanded={expandedSection === 'stock'}
        >
          <h3 className="font-semibold text-gray-900">Disponibilidad</h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSection === 'stock' ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSection === 'stock' && (
          <div className="mt-3">
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={handleStockChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                aria-label="Mostrar solo productos en stock"
              />
              <span className="text-gray-700">Solo productos en stock</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
