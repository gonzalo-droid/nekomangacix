'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  editorial: string;
  pricePEN: number;
  stock: number;
  tags: string[];
  description: string;
}

export default function ProductCard({
  id,
  title,
  editorial,
  pricePEN,
  stock,
  tags,
  description,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addToCart(id, title, pricePEN, editorial);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isOutOfStock = stock === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="text-5xl mb-2">📚</div>
          <p className="text-gray-500 dark:text-gray-600 text-sm">{title}</p>
        </div>
        {tags.length > 0 && (
          <div className="absolute top-2 right-2 space-y-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#2b496d] text-white text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{editorial}</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">{description}</p>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-[#2b496d] dark:text-[#5a7a9e]">S/ {pricePEN.toFixed(2)}</p>
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {isOutOfStock ? (
            <span className="text-red-600 font-semibold text-sm">Agotado</span>
          ) : stock < 5 ? (
            <span className="text-orange-600 font-semibold text-sm">
              Solo {stock} en stock
            </span>
          ) : (
            <span className="text-green-600 font-semibold text-sm">En stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 mt-auto ${
            addedToCart
              ? 'bg-green-500 text-white'
              : isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#f97316] text-white hover:bg-[#ea580c] active:scale-95'
          }`}
          aria-label={`Agregar ${title} al carrito`}
        >
          <ShoppingCart size={18} />
          <span>{addedToCart ? '¡Agregado!' : 'Agregar al carrito'}</span>
        </button>
      </div>
    </div>
  );
}
