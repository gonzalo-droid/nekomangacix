'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getCategoryLabel } from '@/lib/constants/categories';
import { Product } from '@/lib/products';
import { cloudinaryLoader, getCloudinaryUrl } from '@/lib/cloudinary';
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { PREORDER_DEPOSIT_RATE } from '@/lib/domain/cart/calculate';
import { CHEAPEST_DELIVERY, DELIVERY_DAYS, FREE_SHIPPING_FROM } from '@/lib/content/policies';
import { STORE, YAPE_PLIN_NUMBER } from '@/lib/site';
import { trackViewItem, trackWhatsAppOpen } from '@/lib/analytics';
import MangaFormatGuide from '@/components/MangaFormatGuide';
import ProductCarousel from '@/components/ProductCarousel';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import {
  Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronDown,
  Clock, Share2, Check, MessageCircle, Truck, Store, Wallet, BookOpen, ShieldCheck, Gift,
} from 'lucide-react';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

// Claves de `attributes` que no son datos para el cliente: `featured` es la
// curación del home y `category` ya se muestra como etiqueta.
const HIDDEN_ATTRS = new Set(['featured', 'category']);

const ATTR_LABELS: Record<string, string> = {
  weight: 'Peso', language: 'Idioma', dimensions: 'Dimensiones', format: 'Formato',
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

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const { showCartToast } = useToast();
  const { isFavorite, toggleFavorite, isHydrated: favHydrated } = useFavorites();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [shared, setShared] = useState(false);
  const [synopsisOpen, setSynopsisOpen] = useState(false);
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
  const isProductFavorite = favHydrated && isFavorite(product.id);
  const categoryLabel = getCategoryLabel(String(product.attributes?.category ?? ''));
  const countryName = product.countryCode ? COUNTRIES[product.countryCode as CountryCode]?.name : null;

  const synopsis = (product.fullDescription || product.description || '').trim();
  // Solo se recorta si de verdad es larga: un "Leer más" que no esconde nada confunde.
  const synopsisIsLong = synopsis.length > 420;

  const attrs = Object.entries(product.attributes ?? {})
    .filter(([k, v]) => !HIDDEN_ATTRS.has(k) && v !== undefined && v !== null && String(v).trim() !== '')
    .map(([key, value]) => ({
      label: ATTR_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1)),
      value: key === 'releaseDate' && typeof value === 'string'
        ? new Date(value).toLocaleDateString('es-PE') : String(value),
    }));

  return (
    <div className="@container min-h-screen bg-gray-50 dark:bg-gray-950 pt-4 pb-8 sm:py-8">
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
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden aspect-[16/11] sm:aspect-[3/4]">
              {product.images[selectedImage] && !imgError ? (
                <Image
                  src={getCloudinaryUrl(product.images[selectedImage])}
                  alt={product.title}
                  fill
                  loader={cloudinaryLoader}
                  className="object-contain p-3 sm:p-6"
                  onError={() => setImgError(true)}
                  /* Móvil: caja 16/11 a todo el ancho con la tapa en `contain`,
                     así que la portada mide ~45 % del ancho, no el 100 %. */
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 90vw, 600px"
                  priority
                  fetchPriority="high"
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

          {/* ── Info: identidad · caja de compra · detalles ─────────────────
              Antes eran nueve bloques apilados con cuatro estilos de botón del
              mismo peso. Ahora hay un solo botón principal dentro de una caja
              que junta todo lo necesario para decidir la compra. */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Identidad */}
            <div>
              {(product.tags?.length ?? 0) > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {(product.tags ?? []).map((tag, idx) => (
                    <span key={idx} className="bg-[#2b496d]/10 text-[#2b496d] text-xs font-semibold px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {product.author && (
                  <>
                    Por{' '}
                    <Link href={`/products?author=${encodeURIComponent(product.author)}`} className="font-semibold text-gray-900 underline-offset-2 hover:underline">
                      {product.author}
                    </Link>
                    {' · '}
                  </>
                )}
                <Link href={`/products?editorial=${encodeURIComponent(product.editorial)}`} className="font-semibold text-gray-900 underline-offset-2 hover:underline">
                  {product.editorial}
                </Link>
                {countryName && <> · {countryName}</>}
              </p>
              {product.series && (
                <Link
                  href={`/products?series=${encodeURIComponent(product.series)}`}
                  className="mt-2 inline-flex items-center gap-1.5 min-h-11 text-sm font-bold text-neko-magenta-ink hover:underline underline-offset-2"
                >
                  <BookOpen size={16} aria-hidden="true" /> Ver todos los tomos<span className="hidden sm:inline">&nbsp;de {product.series}</span>
                </Link>
              )}
              {/* En el celular estas etiquetas viven en la ficha técnica: acá
                  empujaban el botón de compra fuera del primer pantallazo. */}
              <div className="mt-1 hidden sm:flex flex-wrap items-center gap-2 text-xs text-gray-600">
                {categoryLabel && (
                  <span className="font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100">{categoryLabel}</span>
                )}
                {product.seriesStatus && (
                  <span className={`font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    product.seriesStatus === 'single' ? 'bg-[#eab308]/15 text-neko-gold-ink'
                    : product.seriesStatus === 'completed' ? 'bg-emerald-500/15 text-emerald-800'
                    : 'bg-[#ec4899]/15 text-neko-magenta-ink'
                  }`}>
                    {product.seriesStatus === 'single' ? 'Tomo único' : product.seriesStatus === 'completed' ? 'Serie completada' : 'Serie en curso'}
                  </span>
                )}
              </div>
            </div>

            {/* Caja de compra */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-4xl font-extrabold text-[#2b496d] leading-none">
                  S/ {product.pricePEN.toFixed(2)}
                </p>
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${stockBadge.bg} ${stockBadge.text}`}>
                  {stockBadge.label}
                </span>
                {product.stockStatus === 'in_stock' && product.stock > 0 && product.stock < 10 && (
                  <span className="text-xs font-semibold text-orange-700">
                    {product.stock === 1 ? 'Solo queda 1 unidad' : `Solo quedan ${product.stock} unidades`}
                  </span>
                )}
              </div>

              {(isPreorder || isOutOfStock) && (
                <p className="mt-3 text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
                  Hoy pagas <strong>S/ {(product.pricePEN * PREORDER_DEPOSIT_RATE).toFixed(2)}</strong> ({PREORDER_DEPOSIT_RATE * 100} %) y el resto cuando llega.
                  {(product.etaText ?? product.estimatedArrival) && (
                    <span className="mt-1 flex items-center gap-1.5 font-semibold">
                      <Clock size={14} aria-hidden="true" /> Llegada estimada: {product.etaText ?? product.estimatedArrival}
                    </span>
                  )}
                </p>
              )}

              <ul className="mt-3 sm:mt-4 space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Truck size={16} className="mt-0.5 flex-shrink-0 text-neko-cyan-ink" aria-hidden="true" />
                  <span>Envío desde S/ {CHEAPEST_DELIVERY.toFixed(2)} ({DELIVERY_DAYS}) · <strong className="font-semibold">gratis desde S/ {FREE_SHIPPING_FROM}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Store size={16} className="mt-0.5 flex-shrink-0 text-neko-magenta-ink" aria-hidden="true" />
                  <span>Recojo gratis en nuestra tienda de {STORE.city}</span>
                </li>
              </ul>

              {/* Cantidad + botón principal. Cuando sale de pantalla en el
                  móvil, la barra fija del pie toma su lugar. */}
              <div ref={buyBoxRef} className="mt-4 sm:mt-5 flex items-stretch gap-3">
                <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden flex-shrink-0" role="group" aria-label="Cantidad">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-11 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[40px] text-center font-bold text-gray-900 text-sm" aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stockStatus === 'in_stock' && quantity >= product.stock}
                    className="w-11 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 min-h-12 px-5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${
                    addedToCart ? 'bg-emerald-700' : 'bg-[#be185d] hover:bg-[#9d174d]'
                  }`}
                >
                  <ShoppingCart size={18} aria-hidden="true" />
                  {addedToCart ? '¡Agregado!' : isPreorder || isOutOfStock ? 'Reservar' : (
                    <>Agregar<span className="hidden sm:inline">&nbsp;al carrito</span></>
                  )}
                </button>
              </div>

              {/* Acciones secundarias, discretas */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={handleBuyNow}
                  className="inline-flex items-center min-h-11 text-sm font-semibold text-[#2b496d] underline-offset-4 hover:underline"
                >
                  {isPreorder || isOutOfStock ? 'Reservar e ir al carrito' : 'Comprar ahora'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
                      isProductFavorite ? 'text-neko-magenta-ink bg-[#ec4899]/10' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    aria-pressed={isProductFavorite}
                  >
                    <Heart size={20} fill={isProductFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${shared ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    aria-label={shared ? 'Enlace copiado' : 'Compartir producto'}
                  >
                    {shared ? <Check size={20} /> : <Share2 size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Detalles en acordeones: están para quien los busca, sin
                competir con la compra. */}
            <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-200">
              {[
                {
                  id: 'envio',
                  icon: Truck,
                  title: 'Envío y recojo',
                  body: (
                    <>
                      <p>Enviamos a todo el Perú en {DELIVERY_DAYS} según el destino, desde S/ {CHEAPEST_DELIVERY.toFixed(2)}. Desde S/ {FREE_SHIPPING_FROM} de compra el envío es gratis.</p>
                      <p className="mt-2">Recojo gratis en {STORE.streetAddress}, {STORE.city}: {STORE.daysLabel.toLowerCase()}, {STORE.hoursShortLabel}</p>
                      <Link href="/shipping" className="mt-2 inline-flex min-h-11 items-center font-semibold text-neko-magenta-ink hover:underline">Ver tarifas por destino</Link>
                    </>
                  ),
                },
                {
                  id: 'pago',
                  icon: Wallet,
                  title: 'Métodos de pago',
                  body: <p>Yape y Plin al {YAPE_PLIN_NUMBER}, o transferencia BCP. Confirmas el pago por WhatsApp con tu número de pedido.</p>,
                },
                ...(product.type === 'manga'
                  ? [{
                      id: 'formato',
                      icon: BookOpen,
                      title: '¿Qué formato es?',
                      body: (
                        <>
                          <p>Tamaños y acabados de las ediciones de manga, para que sepas qué recibes.</p>
                          <MangaFormatGuide variant="ghost" className="mt-2" />
                        </>
                      ),
                    }]
                  : []),
              ].map(({ id, icon: Icon, title, body }) => (
                <details key={id} className="group">
                  <summary className="flex items-center justify-between gap-3 min-h-12 px-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-semibold text-sm text-gray-900">
                    <span className="flex items-center gap-2.5">
                      <Icon size={17} className="text-gray-500" aria-hidden="true" />
                      {title}
                    </span>
                    <ChevronDown size={18} className="text-gray-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{body}</div>
                </details>
              ))}
            </div>

            {/* Confianza en una línea (antes, cinco íconos en tres filas) */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-neko-cyan-ink" aria-hidden="true" />100% original</li>
              <li className="flex items-center gap-1.5"><Gift size={15} className="text-neko-magenta-ink" aria-hidden="true" />Obsequio en cada compra</li>
              <li>
                <a
                  href={`https://wa.me/51924462641?text=Hola%2C%20quisiera%20consultar%20sobre%20${encodeURIComponent(product.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppOpen('product')}
                  className="flex items-center gap-1.5 font-semibold text-neko-green-ink hover:underline"
                >
                  <MessageCircle size={15} aria-hidden="true" />Consultar por WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Sinopsis + ficha técnica (antes en pestañas, con los datos
            técnicos escondidos) ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 mb-16">
          <section className="rounded-2xl bg-white border border-gray-200 p-6" aria-labelledby="ficha-sinopsis">
            <h2 id="ficha-sinopsis" className="text-lg font-extrabold text-gray-900 mb-3">Sinopsis</h2>
            {synopsis ? (
              <>
                <p className={`text-gray-700 leading-relaxed text-sm sm:text-base ${synopsisOpen || !synopsisIsLong ? '' : 'line-clamp-6'}`}>
                  {synopsis}
                </p>
                {synopsisIsLong && (
                  <button
                    type="button"
                    onClick={() => setSynopsisOpen((o) => !o)}
                    aria-expanded={synopsisOpen}
                    className="mt-2 inline-flex items-center gap-1 min-h-11 text-sm font-bold text-neko-magenta-ink hover:underline"
                  >
                    {synopsisOpen ? 'Leer menos' : 'Leer más'}
                    <ChevronDown size={16} className={`transition-transform ${synopsisOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">Todavía no tenemos la sinopsis de este tomo.</p>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-gray-200 p-6" aria-labelledby="ficha-tecnica">
            <h2 id="ficha-tecnica" className="text-lg font-extrabold text-gray-900 mb-3">Ficha técnica</h2>
            <dl className="text-sm">
              {[
                { label: 'Editorial', value: product.editorial },
                ...(product.author ? [{ label: 'Autor', value: product.author }] : []),
                ...(product.series ? [{ label: 'Serie', value: product.series }] : []),
                ...(countryName ? [{ label: 'Edición', value: countryName }] : []),
                ...(categoryLabel ? [{ label: 'Género', value: categoryLabel }] : []),
                ...(product.seriesStatus
                  ? [{ label: 'Estado', value: product.seriesStatus === 'single' ? 'Tomo único' : product.seriesStatus === 'completed' ? 'Serie completada' : 'Serie en curso' }]
                  : []),
                ...attrs,
                { label: 'SKU', value: product.sku },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
                  <dt className="text-gray-600">{row.label}</dt>
                  <dd className="font-semibold text-gray-900 text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* ── Productos relacionados ─────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mb-8">
            <div className="mb-6 relative">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-neko-magenta-ink mb-1.5">
                {'// También te puede gustar'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {product.series ? `Más de ${product.series} y similares` : 'Te puede interesar'}
              </h2>
              <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
            </div>
            {/* Carrusel: deja ver más opciones sin alargar la página. Las
                tarjetas miden como las del home (ver ProductCarousel). */}
            <div className="mt-8">
              <ProductCarousel
                products={relatedProducts}
                label={product.series ? `Más de ${product.series} y similares` : 'Te puede interesar'}
              />
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
