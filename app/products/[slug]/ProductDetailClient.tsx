'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getCategoryLabel, getStockStatusLabel } from '@/hooks/useProducts';
import { Product } from '@/lib/products';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  CreditCard,
  Banknote,
  Clock,
  Package,
  Star,
} from 'lucide-react';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'info' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const stockInfo = getStockStatusLabel(product.stockStatus);
  const categoryLabel = getCategoryLabel(product.category);
  const isProductFavorite = isFavorite(product.id);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && (product.stockStatus !== 'in_stock' || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, product.title, product.pricePEN, product.editorial);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const canAddToCart = product.stockStatus !== 'out_of_stock';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/products"
            className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline"
          >
            <ChevronLeft size={20} />
            <span>Volver a productos</span>
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
              {product.images[selectedImage] && !imgError ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  onError={() => setImgError(true)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="text-center p-8">
                  <div className="text-9xl mb-4">📚</div>
                  <p className="text-gray-500 dark:text-gray-400">{product.title}</p>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImage(idx); setImgError(false); }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all overflow-hidden ${
                      selectedImage === idx
                        ? 'border-[#2b496d] dark:border-[#5a7a9e]'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 relative`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={`${product.title} - ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    ) : (
                      <span className="text-2xl flex items-center justify-center h-full">📚</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2b496d] text-white text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title & Author */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Por <span className="font-medium">{product.author}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400">{product.editorial}</p>
            </div>

            {/* SKU & Category */}
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>SKU: <span className="font-medium">{product.sku}</span></span>
              <span>|</span>
              <span>Categoria: <span className="font-medium">{categoryLabel}</span></span>
            </div>

            {/* Price */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-4xl font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                S/ {product.pricePEN.toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package size={20} className={stockInfo.color} />
                <span className={`font-semibold ${stockInfo.color}`}>{stockInfo.label}</span>
              </div>

              {product.stockStatus === 'in_stock' && product.stock > 0 && product.stock < 10 && (
                <p className="text-orange-600 text-sm">Solo {product.stock} unidades disponibles</p>
              )}

              {product.stockStatus === 'on_demand' && product.estimatedArrival && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock size={18} />
                  <span>Llegada estimada: <strong>{product.estimatedArrival}</strong></span>
                </div>
              )}

              {product.stockStatus === 'preorder' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Clock size={18} />
                    <span>Fecha estimada: <strong>{product.estimatedArrival}</strong></span>
                  </div>
                  {product.preorderDeposit && (
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Reserva con <strong>S/ {product.preorderDeposit.toFixed(2)}</strong> y paga el
                      resto (S/ {(product.pricePEN - product.preorderDeposit).toFixed(2)}) cuando llegue.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Cantidad:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={20} />
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={product.stockStatus === 'in_stock' && quantity >= product.stock}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : !canAddToCart
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-[#f97316] text-white hover:bg-[#ea580c] active:scale-95'
                }`}
              >
                <ShoppingCart size={20} />
                <span>
                  {addedToCart
                    ? '¡Agregado!'
                    : product.stockStatus === 'preorder'
                      ? `Reservar (S/ ${product.preorderDeposit?.toFixed(2) || product.pricePEN.toFixed(2)})`
                      : 'Agregar al carrito'}
                </span>
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isProductFavorite
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
                aria-label={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart size={24} fill={isProductFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Metodos de Pago</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CreditCard size={20} />
                  <span className="text-sm">Tarjeta de Credito/Debito</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Banknote size={20} />
                  <span className="text-sm">Yape / Plin</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Banknote size={20} />
                  <span className="text-sm">Transferencia Bancaria</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Banknote size={20} />
                  <span className="text-sm">Efectivo (al recoger)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-12">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex" aria-label="Tabs">
              {(['description', 'info', 'reviews'] as const).map((tab) => {
                const labels = { description: 'Descripcion', info: 'Informacion General', reviews: 'Valoraciones' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-[#2b496d] text-[#2b496d] dark:border-[#5a7a9e] dark:text-[#5a7a9e]'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Paginas', value: product.specifications.pages },
                  { label: 'Formato', value: product.specifications.format },
                  { label: 'Idioma', value: product.specifications.language },
                  { label: 'ISBN', value: product.specifications.isbn },
                  { label: 'Dimensiones', value: product.specifications.dimensions },
                  { label: 'Peso', value: product.specifications.weight },
                  {
                    label: 'Fecha de lanzamiento',
                    value: product.specifications.releaseDate
                      ? new Date(product.specifications.releaseDate).toLocaleDateString('es-PE')
                      : undefined,
                  },
                ]
                  .filter((row) => row.value !== undefined)
                  .map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{row.value}</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={24} className="text-gray-300 dark:text-gray-600" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aun no hay valoraciones para este producto.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Se el primero en dejar tu opinion.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative w-full h-48 bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
                    {related.images[0] ? (
                      <Image
                        src={related.images[0]}
                        alt={related.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm px-4 line-clamp-1">
                          {related.title}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-[#2b496d] dark:group-hover:text-[#5a7a9e] transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{related.editorial}</p>
                    <p className="text-lg font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                      S/ {related.pricePEN.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
