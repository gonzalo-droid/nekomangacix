'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { usePromotions } from '@/context/PromotionsContext';
import { useToast } from '@/context/ToastContext';
import type { ProductType } from '@/lib/constants/productTypes';
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import ProductImage from './ProductImage';

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  editorial: string;
  countryCode?: CountryCode;
  pricePEN: number;
  stock: number;
  type?: ProductType;
  tags?: string[];
  description?: string;
  images?: string[];
  stockStatus?: 'in_stock' | 'preorder' | 'out_of_stock';
  preorderDeposit?: number;
  seriesStatus?: 'single' | 'ongoing' | 'completed';
}

interface Props extends ProductCardData {
  variant?: 'default' | 'compact' | 'minimal';
  priority?: boolean;
  onRemove?: (id: string) => void;
  showFavoriteToggle?: boolean;
  sizes?: string;
  showQuickAdd?: boolean;
}

const TAG_ACCENTS = [
  'bg-[#ec4899]/95',
  'bg-[#06b6d4]/95',
  'bg-[#eab308]/95',
  'bg-[#2b496d]/95',
];

function getTagAccent(tag: string, idx: number): string {
  const lower = tag.toLowerCase();
  if (lower.includes('oferta') || lower.includes('sale')) return 'bg-[#ec4899]/95';
  if (lower.includes('nuevo') || lower.includes('new')) return 'bg-[#06b6d4]/95';
  if (lower.includes('premium') || lower.includes('deluxe') || lower.includes('exclusivo')) return 'bg-[#eab308]/95';
  if (lower.includes('agotado') || lower.includes('sold out')) return 'bg-gray-700/95';
  return TAG_ACCENTS[idx % TAG_ACCENTS.length];
}

const STOCK_BADGE: Record<string, { label: string; cls: string }> = {
  preorder:     { label: 'Preventa',  cls: 'bg-blue-500 text-white' },
  out_of_stock: { label: 'Agotado',   cls: 'bg-red-600 text-white' },
  in_stock:     { label: 'En stock',  cls: 'bg-emerald-500 text-white' },
};

function EditorialLine({ countryCode, editorial }: { countryCode?: CountryCode; editorial: string }) {
  const countryName = countryCode ? COUNTRIES[countryCode]?.name : null;
  return (
    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 line-clamp-1 tracking-wide">
      {countryName ? `${countryName}, ${editorial}` : editorial}
    </p>
  );
}

export default function ProductCard({
  id, slug, title, editorial, countryCode, pricePEN, stock, type = 'manga',
  tags = [], description, images, stockStatus, preorderDeposit, seriesStatus,
  variant = 'default', priority = false, onRemove,
  showFavoriteToggle = false, sizes, showQuickAdd = false,
}: Props) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, isHydrated: favHydrated } = useFavorites();
  const { getDiscountedPrice } = usePromotions();
  const { showCartToast } = useToast();
  const [added, setAdded] = useState(false);

  const { finalPrice, discount, promotionName } = getDiscountedPrice(pricePEN, id, type);
  const hasDiscount = discount > 0;
  const isOutOfStock = stockStatus ? stockStatus === 'out_of_stock' : stock === 0;
  const isPreorder = stockStatus === 'preorder';
  const fav = favHydrated && isFavorite(id);
  const resolvedImage = images?.[0] ? getCloudinaryUrl(images[0]) : undefined;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(id, title, pricePEN, editorial, { stockStatus, preorderDeposit, slug, imageUrl: resolvedImage });
    showCartToast({ title, editorial, imageUrl: resolvedImage, isPreorder: false });
    setAdded(true); setTimeout(() => setAdded(false), 1800);
  };
  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(id, title, pricePEN, editorial, { stockStatus: 'preorder', preorderDeposit, slug, imageUrl: resolvedImage });
    showCartToast({ title, editorial, imageUrl: resolvedImage, isPreorder: true });
    setAdded(true); setTimeout(() => setAdded(false), 1800);
  };
  const handleFavorite = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); };
  const handleRemove = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onRemove?.(id); };

  const defaultSizes =
    variant === 'compact' ? '200px'
    : variant === 'minimal' ? '(max-width: 640px) 50vw, 25vw'
    : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

  const stockBadge = stockStatus ? STOCK_BADGE[stockStatus] : null;

  // ── Compact ────────────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link
        href={`/products/${slug}`}
        className="group card-manga bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 flex flex-col"
      >
        <div className="relative overflow-hidden">
          <ProductImage src={images?.[0]} alt={title} aspect="2/3" sizes={sizes ?? defaultSizes} priority={priority} />
          <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-sheen pointer-events-none" aria-hidden="true" />

          {/* Stock badge arriba izquierda */}
          {stockBadge && stockStatus !== 'in_stock' && (
            <span className={`absolute top-1.5 left-1.5 ${stockBadge.cls} text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm`}>
              {stockBadge.label}
            </span>
          )}

          {/* Tag principal arriba derecha */}
          {tags[0] && !isOutOfStock && (
            <span className={`absolute top-1.5 right-1.5 ${getTagAccent(tags[0], 0)} text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow`}>
              {tags[0]}
            </span>
          )}

        </div>
        <div className="p-2.5 flex flex-col flex-grow">
          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-0.5 line-clamp-2 group-hover:text-[#ec4899] transition-colors min-h-[2.25rem]">
            {title}
          </h3>
          <EditorialLine countryCode={countryCode} editorial={editorial} />
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#2b496d] dark:text-[#5a7a9e]">
                S/ {finalPrice.toFixed(2)}
              </p>
              {hasDiscount && <p className="text-[10px] line-through text-gray-400">S/ {pricePEN.toFixed(2)}</p>}
            </div>
            {!isOutOfStock && (
              <button
                type="button"
                onClick={isPreorder ? handleReserve : handleAdd}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : isPreorder
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white'
                    : 'bg-[#ec4899]/10 text-[#ec4899] hover:bg-[#ec4899] hover:text-white'
                }`}
                aria-label={isPreorder ? `Reservar ${title}` : `Agregar ${title} al carrito`}
              >
                <ShoppingCart size={12} />
                {added ? '✓' : isPreorder ? 'Reservar' : 'Agregar'}
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── Minimal (favoritos) ────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <div className="group card-manga relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        {onRemove && (
          <button type="button" onClick={handleRemove}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label={`Eliminar ${title}`}
          >
            <Trash2 size={14} />
          </button>
        )}
        <Link href={`/products/${slug}`} className="block">
          <ProductImage src={images?.[0]} alt={title} aspect="2/3" sizes={sizes ?? defaultSizes} priority={priority} />
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">{title}</h3>
            <EditorialLine countryCode={countryCode} editorial={editorial} />
            <p className="text-base font-bold text-[#2b496d] dark:text-[#5a7a9e] mt-1">S/ {finalPrice.toFixed(2)}</p>
            {hasDiscount && <p className="text-xs line-through text-gray-400">S/ {pricePEN.toFixed(2)}</p>}
          </div>
        </Link>
        <div className="px-3 pb-3">
          <button type="button" onClick={handleAdd} disabled={isOutOfStock}
            className="w-full py-2 px-3 bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white text-xs font-semibold rounded-md hover:shadow-lg hover:shadow-[#ec4899]/30 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ShoppingCart size={14} />
            {added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    );
  }

  // ── Default (grid principal) ───────────────────────────────────────────────
  return (
    <Link
      href={`/products/${slug}`}
      className="group card-manga relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/15 dark:hover:shadow-black/60"
    >
      {/* Imagen */}
      <div className="relative overflow-hidden">
        <ProductImage src={images?.[0]} alt={title} aspect="2/3" sizes={sizes ?? defaultSizes} priority={priority} />

        {/* Sheen */}
        <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-sheen pointer-events-none" aria-hidden="true" />

        {/* Badge stock — arriba izquierda */}
        {stockBadge && (
          <span className={`absolute top-2 left-2 z-10 ${stockBadge.cls} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md`}>
            {stockBadge.label}
          </span>
        )}

        {/* Tags — arriba derecha */}
        {tags.length > 0 && !isOutOfStock && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10 pointer-events-none">
            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className={`${getTagAccent(tag, idx)} text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-md`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Favorito — aparece en hover */}
        {showFavoriteToggle && (
          <button type="button" onClick={handleFavorite}
            className={`absolute top-2 z-20 p-2 rounded-full shadow-md transition-all duration-200 ${
              stockBadge ? 'right-2' : 'right-2'
            } ${
              fav
                ? 'bg-[#ec4899] text-white opacity-100'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#ec4899]'
            } backdrop-blur-sm hover:scale-110`}
            aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Botón carrito flotante sobre imagen — aparece en hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">
          <button
            type="button"
            onClick={isOutOfStock ? handleReserve : handleAdd}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-xl transition-all active:scale-95 ${
              added
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : isOutOfStock || isPreorder
                  ? 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white shadow-[#ec4899]/40'
                  : 'bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white shadow-[#ec4899]/40'
            }`}
            aria-label={isOutOfStock || isPreorder ? `Reservar ${title}` : `Agregar ${title} al carrito`}
          >
            <ShoppingCart size={15} />
            {added ? '¡Agregado!' : isOutOfStock || isPreorder ? 'Reservar' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5 line-clamp-2 min-h-[2.5rem] group-hover:text-[#ec4899] dark:group-hover:text-[#ec4899] transition-colors leading-snug">
          {title}
        </h3>
        <EditorialLine countryCode={countryCode} editorial={editorial} />

        <div className="mt-auto">
          {seriesStatus && (
            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
              seriesStatus === 'single' ? 'bg-[#eab308]/15 text-[#eab308]'
              : seriesStatus === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-[#ec4899]/15 text-[#ec4899]'
            }`}>
              {seriesStatus === 'single' ? 'Tomo único' : seriesStatus === 'completed' ? 'Completado' : 'En curso'}
            </span>
          )}

          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xl font-extrabold text-[#2b496d] dark:text-[#5a7a9e]">
                S/ {finalPrice.toFixed(2)}
              </p>
              {hasDiscount && <p className="text-xs line-through text-gray-400">S/ {pricePEN.toFixed(2)}</p>}
            </div>
            {!isOutOfStock && !isPreorder && stock > 0 && stock < 5 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#eab308]">¡últimas {stock}!</span>
            )}
            {hasDiscount && promotionName && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ec4899]">{promotionName}</span>
            )}
          </div>

          {(isPreorder || isOutOfStock) && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
              Reserva con S/ {(finalPrice * 0.5).toFixed(2)} — paga el resto al llegar.
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
