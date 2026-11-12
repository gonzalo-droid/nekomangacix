'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getCategoryLabel } from '@/hooks/useProducts';
import { Product } from '@/lib/products';
import { cloudinaryLoader, getCloudinaryUrl } from '@/lib/cloudinary';
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { PREORDER_DEPOSIT_RATE } from '@/lib/domain/cart/calculate';
import { trackViewItem, trackWhatsAppOpen } from '@/lib/analytics';
import MangaFormatGuide from '@/components/MangaFormatGuide';
import TrustBadges from '@/components/TrustBadges';
import ProductCard from '@/components/ProductCard';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import {
  Heart, ShoppingCart, Zap, Minus, Plus, ChevronLeft,
  Banknote, Clock, Share2, Check, MessageCircle,
} from 'lucide-react';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

const ATTR_LABELS: Record<string, string> = {
  peso: 'Peso', idioma: 'Idioma', dimensiones: 'Dimensiones',
  formato: 'Formato', category: 'Categoría', pages: 'Páginas',
  releaseDate: 'Fecha de lanzamiento', isbn: 'ISBN', publisher: 'Editorial',
  age: 'Edad recomendada', color: 'Color', material: 'Material',
  height: 'Alto', width: 'Ancho', depth: 'Profundidad',
};

const STOCK_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  in_stock:     { label: 'En stock',  bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', text: 'text-emerald-800 dark:text-emerald-400' },
  preorder:     { label: 'Preventa',  bg: 'bg-blue-500/15 dark:bg-blue-500/20',       text: 'text-blue-700 dark:text-blue-400' },
  on_demand:    { label: 'A pedido',  bg: 'bg-orange-500/15 dark:bg-orange-500/20',   text: 'text-orange-800 dark:text-orange-400' },
  out_of_stock: { label: 'Agotado',   bg: 'bg-red-500/15 dark:bg-red-500/20',         text: 'text-red-700 dark:text-red-400' },
};

// Los mismos tres que ofrece el checkout. Antes se listaban tarjeta y
// efectivo, que no se pueden usar al pagar.
const PAYMENT_METHODS = [
  { icon: Banknote, label: 'Yape' },
  { icon: Banknote, label: 'Plin' },
  { icon: Banknote, label: 'Transferencia BCP' },
];

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const { showCartToast } = useToast();
  const { isFavorite, toggleFavorite, isHydrated: favHydrated } = useFavorites();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'info'>('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [shared, setShared] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  // Una vez por producto: en desarrollo React monta los efectos dos veces.
  const trackedProductId = useRef<string | null>(null);
  useEffect(() => {
    if (trackedProductId.current === product.id) return;
    trackedProductId.current = product.id;
    trackViewItem(
      { item_id: product.id, item_name: product.title, item_brand: product.editorial, price: product.pricePEN },
      product.stockStatus,
    );
  }, [product.id, product.title, product.editorial, product.pricePEN, product.stockStatus]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      await navigator.share({ title: product.title, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const imageUrl = product.images?.[0] ? getCloudinaryUrl(product.images[0]) : undefined;

  // Un agotado se puede reservar: entra al carrito como preventa, igual que
  // desde la tarjeta del catálogo.
  const addQuantityToCart = () => {
    const stockStatus = product.stockStatus === 'out_of_stock' ? 'preorder' : product.stockStatus;
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, product.title, product.pricePEN, product.editorial, {
        stockStatus, preorderDeposit: product.preorderDeposit, slug: product.slug, imageUrl,
      });
    }
    return stockStatus === 'preorder';
  };

  const handleBuyNow = () => {
    addQuantityToCart();
    router.push('/cart');
  };

  const handleAddToCart = () => {
    const isReservation = addQuantityToCart();
    showCartToast({ title: product.title, editorial: product.editorial, imageUrl, isPreorder: isReservation });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && (product.stockStatus !== 'in_stock' || next <= product.stock)) setQuantity(next);
  };

  const stockBadge = STOCK_BADGE[product.stockStatus] ?? STOCK_BADGE.in_stock;
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const isPreorder = product.stockStatus === 'preorder';
  const canAddToCart = !isOutOfStock;
  const isProductFavorite = favHydrated && isFavorite(product.id);
  const categoryLabel = getCategoryLabel(String(product.attributes?.category ?? ''));
  const countryName = product.countryCode ? COUNTRIES[product.countryCode as CountryCode]?.name : null;

  const attrs = Object.entries(product.attributes ?? {})
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([key, value]) => ({
      label: ATTR_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1)),
      value: key === 'releaseDate' && typeof value === 'string'
        ? new Date(value).toLocaleDateString('es-PE') : String(value),
    }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-4 pb-8 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación" className="mb-3 sm:mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/products" className="inline-flex items-center gap-1 min-h-11 hover:text-[#ec4899] transition-colors">
            <ChevronLeft size={16} />
            Productos
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-16">

          {/* ── Galería ─────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Imagen principal */}
            {/* En el móvil la portada va apaisada (la tapa entra completa con
                `object-contain`): a 3/4 ocupaba la pantalla entera y el precio
                y el botón quedaban a más de un pantallazo. */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4]">
              {product.images[selectedImage] && !imgError ? (
                <Image
                  src={getCloudinaryUrl(product.images[selectedImage])}
                  alt={product.title}
                  fill
                  loader={cloudinaryLoader}
                  className="object-contain p-3 sm:p-6"
                  onError={() => setImgError(true)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-7xl mb-3">📚</div>
                  <p className="text-sm text-gray-400">{product.title}</p>
                </div>
              )}
              {/* La disponibilidad se muestra junto al precio; repetirla sobre la portada era ruido. */}
            </div>

            {/* Thumbnails en fila inferior */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImage(idx); setImgError(false); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl transition-all p-0.5 ${
                      selectedImage === idx
                        ? 'ring-2 ring-[#ec4899]'
                        : 'ring-1 ring-gray-200 dark:ring-gray-700 opacity-55 hover:opacity-100 hover:ring-gray-400'
                    }`}
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                      {img
                        ? <Image src={getCloudinaryUrl(img)} alt={`${product.title} ${idx + 1}`} fill loader={cloudinaryLoader} className="object-contain p-1" sizes="64px" />
                        : <span className="text-lg flex items-center justify-center h-full">📚</span>
                      }
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ─────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Tags */}
            {(product.tags?.length ?? 0) > 0 && (
              <div className="flex gap-2 flex-wrap">
                {(product.tags ?? []).map((tag, idx) => (
                  <span key={idx} className="bg-[#2b496d]/10 text-[#2b496d] dark:bg-[#5a7a9e]/20 dark:text-[#5a7a9e] text-xs font-semibold px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Título + autor + editorial */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
                {product.title}
              </h1>
              {product.author && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Por <span className="font-semibold text-gray-700 dark:text-gray-300">{product.author}</span>
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {countryName ? `${countryName} · ${product.editorial}` : product.editorial}
              </p>
            </div>

            {/* Precio + stock */}
            <div className="flex items-end gap-4 py-4 border-y border-gray-200 dark:border-gray-700/60">
              <p className="text-4xl font-extrabold text-[#2b496d] dark:text-neko-navy-ink leading-none">
                S/ {product.pricePEN.toFixed(2)}
              </p>
              <div className="flex flex-col gap-1 pb-0.5">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${stockBadge.bg} ${stockBadge.text}`}>
                  {stockBadge.label}
                </span>
                {product.stockStatus === 'in_stock' && product.stock > 0 && product.stock < 10 && (
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                    {product.stock === 1 ? 'Solo queda 1 unidad' : `Solo quedan ${product.stock} unidades`}
                  </span>
                )}
              </div>
            </div>

            {/* Info preventa */}
            {isPreorder && (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 space-y-1.5">
                {(product.etaText ?? product.estimatedArrival) && (
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                    <Clock size={15} />
                    <span>Llegada estimada: {product.etaText ?? product.estimatedArrival}</span>
                  </div>
                )}
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Reserva con <strong>S/ {(product.pricePEN * PREORDER_DEPOSIT_RATE).toFixed(2)}</strong> ({PREORDER_DEPOSIT_RATE * 100}%) y paga el resto al llegar.
                </p>
              </div>
            )}

            {/* Cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cantidad</span>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 min-w-[48px] text-center font-bold text-gray-900 dark:text-white text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={product.stockStatus === 'in_stock' && quantity >= product.stock}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Botones de acción. Cuando salen de pantalla en el móvil, la
                barra fija del pie toma su lugar. */}
            <div ref={buyBoxRef} className="space-y-2.5">
              <div className="flex gap-2.5">
                {(
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      addedToCart
                        ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/30'
                        : isPreorder || isOutOfStock
                          ? 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-[#ec4899]/30'
                          : 'bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white hover:shadow-lg hover:shadow-[#ec4899]/30'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart ? '¡Agregado!' : isPreorder || isOutOfStock ? 'Reservar' : 'Agregar al carrito'}
                  </button>
                )}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    isProductFavorite
                      ? 'border-[#ec4899] bg-[#ec4899]/10 text-neko-magenta-ink'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#ec4899] hover:text-[#ec4899]'
                  }`}
                  aria-label={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={20} fill={isProductFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    shared
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#06b6d4] hover:text-[#06b6d4]'
                  }`}
                  aria-label="Compartir producto"
                >
                  {shared ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  className="w-full min-h-11 py-2.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 border-2 border-[#2b496d] text-[#2b496d] hover:bg-[#2b496d] hover:text-white dark:border-neko-navy-ink dark:text-neko-navy-ink dark:hover:bg-neko-navy-ink dark:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={18} aria-hidden="true" />
                  {isPreorder ? 'Reservar e ir al carrito' : 'Comprar ahora'}
                </button>
              )}

              {product.type === 'manga' && (
                <MangaFormatGuide variant="ghost" className="w-full justify-center" />
              )}
            </div>

            {/* Chips de categoría / serie */}
            <div className="flex flex-wrap gap-2">
              {categoryLabel && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {categoryLabel}
                </span>
              )}
              {product.seriesStatus && (
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  product.seriesStatus === 'single'   ? 'bg-[#eab308]/15 text-neko-gold-ink'
                  : product.seriesStatus === 'completed' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                  : 'bg-[#ec4899]/15 text-neko-magenta-ink'
                }`}>
                  {product.seriesStatus === 'single' ? 'Tomo único' : product.seriesStatus === 'completed' ? 'Serie completada' : 'En curso'}
                </span>
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                SKU: {product.sku}
              </span>
            </div>

            {/* Trust badges */}
            <TrustBadges variant="compact" />

            {/* Métodos de pago */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Métodos de pago</p>
              <div className="flex flex-wrap gap-2">
                {/* Fondo blanco con borde: la página ya es gris claro, así que
                    una ficha gris sobre gris no se distinguía en tema claro. */}
                {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-transparent rounded-lg px-3 py-2">
                    <Icon size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Consultar por WhatsApp */}
            <a
              href={`https://wa.me/51924462641?text=Hola%2C%20quisiera%20consultar%20sobre%20${encodeURIComponent(product.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppOpen('product')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-[#25D366]/40 text-neko-green-ink hover:bg-[#25D366]/10 transition-colors text-sm font-semibold"
            >
              <MessageCircle size={16} />
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-16">
          <div className="border-b border-gray-100 dark:border-gray-800 flex">
            {(['description', 'info'] as const).map((tab) => {
              const labels = { description: 'Descripción', info: 'Información' };
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${
                    active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {labels[tab]}
                  {active && (
                    <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {product.fullDescription || product.description || 'Sin descripción disponible.'}
              </p>
            )}

            {activeTab === 'info' && (
              attrs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  {attrs.map((row) => (
                    <div key={row.label} className="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Sin información adicional.</p>
              )
            )}
          </div>
        </div>

        {/* ── Productos relacionados ─────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mb-8">
            <div className="mb-6 relative">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-neko-magenta-ink mb-1.5">
                {'// También te puede gustar'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {product.series ? `Más de la serie ${product.series}` : 'Más en esta categoría'}
              </h2>
              <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} {...related} variant="compact" />
              ))}
            </div>
          </section>
        )}

      </div>

      <StickyBuyBar
        targetRef={buyBoxRef}
        price={product.pricePEN}
        detail={
          isPreorder || isOutOfStock
            ? `Reserva con S/ ${(product.pricePEN * PREORDER_DEPOSIT_RATE).toFixed(2)} hoy`
            : stockBadge.label
        }
        actionLabel={isPreorder || isOutOfStock ? 'Reservar' : 'Agregar'}
        added={addedToCart}
        onAction={handleAddToCart}
      />
    </div>
  );
}
