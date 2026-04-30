'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import ProductImage from './ProductImage';

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  editorial: string;
  pricePEN: number;
  stock: number;
  tags: string[];
  description: string;
  images?: string[];
  stockStatus?: 'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock';
  preorderDeposit?: number;
}

interface Props extends ProductCardData {
  /**
   * default — grid principal (title, editorial, desc, stock, botón completo)
   * compact — carrusel/relacionados (sin desc ni stock, botón flotante opcional)
   * minimal — favoritos (incluye botón eliminar)
   */
  variant?: 'default' | 'compact' | 'minimal';
  priority?: boolean;
  onRemove?: (id: string) => void;
  showFavoriteToggle?: boolean;
  sizes?: string;
  /** Muestra un botón "Agregar"/"Reservar" en la variante compact. Default: false */
  showQuickAdd?: boolean;
}

// Paleta de acentos para tags (rotación determinística por hash del tag)
const TAG_ACCENTS = [
  'bg-[#ec4899]/95',  // magenta
  'bg-[#06b6d4]/95',  // cyan
  'bg-[#eab308]/95',  // gold
  'bg-[#2b496d]/95',  // navy
];

function getTagAccent(tag: string, idx: number): string {
  const lower = tag.toLowerCase();
  if (lower.includes('oferta') || lower.includes('sale')) return 'bg-[#ec4899]/95';
  if (lower.includes('nuevo') || lower.includes('new')) return 'bg-[#06b6d4]/95';
  if (lower.includes('premium') || lower.includes('deluxe') || lower.includes('exclusivo')) return 'bg-[#eab308]/95';
  if (lower.includes('agotado') || lower.includes('sold out')) return 'bg-gray-700/95';
  return TAG_ACCENTS[idx % TAG_ACCENTS.length];
}

export default function ProductCard({
  id,
  slug,
  title,
  editorial,
  pricePEN,
  stock,
  tags,
  description,
  images,
  stockStatus,
  preorderDeposit,
  variant = 'default',
  priority = false,
  onRemove,
  showFavoriteToggle = false,
  sizes,
  showQuickAdd = false,
}: Props) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, isHydrated: favHydrated } = useFavorites();
  const [added, setAdded] = useState(false);

  const isOutOfStock = stockStatus ? stockStatus === 'out_of_stock' : stock === 0;
  const isPreorder = stockStatus === 'preorder';
  // Antes de hidratar, siempre false para matchear SSR (localStorage aún no leído)
  const fav = favHydrated && isFavorite(id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id, title, pricePEN, editorial, { stockStatus, preorderDeposit, slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(id);
  };

  const defaultSizes =
    variant === 'compact'
      ? '200px'
      : variant === 'minimal'
        ? '(max-width: 640px) 50vw, 25vw'
        : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

  // ── Variant: compact (grid denso 5-6 por fila o carrusel) ─────────────────
  // Sin ancho fijo: hereda del contenedor (grid cell o flex con width explícito).
  if (variant === 'compact') {
    return (
      <Link
        href={`/products/${slug}`}
        className="group card-manga bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
      >
        <div className="relative overflow-hidden">
          <ProductImage
            src={images?.[0]}
            alt={title}
            aspect="2/3"
            sizes={sizes ?? defaultSizes}
            priority={priority}
          />
          {/* Sheen al hover */}
          <span
            className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-sheen pointer-events-none"
            aria-hidden="true"
          />
          {/* Agotado overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/90 rotate-[-6deg]">
                Agotado
              </span>
            </div>
          )}
          {/* Badge de tag principal */}
          {tags[0] && !isOutOfStock && (
            <span
              className={`absolute top-1.5 right-1.5 ${getTagAccent(tags[0], 0)} text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded backdrop-blur-sm shadow`}
            >
              {tags[0]}
            </span>
          )}
        </div>
        <div className="p-2.5 flex flex-col flex-grow">
          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-0.5 line-clamp-2 group-hover:text-[#ec4899] dark:group-hover:text-[#ec4899] transition-colors min-h-[2.25rem]">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-1 line-clamp-1">{editorial}</p>
          <div className="mt-auto flex items-baseline justify-between gap-1">
            <p className="text-sm sm:text-base font-extrabold text-[#2b496d] dark:text-[#5a7a9e]">
              S/ {pricePEN.toFixed(2)}
            </p>
            {isPreorder && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#06b6d4]">
                Preventa
              </span>
            )}
          </div>

          {showQuickAdd && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`mt-2 w-full py-1.5 px-2 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                added
                  ? 'bg-emerald-500 text-white shadow'
                  : isOutOfStock
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                    : isPreorder
                      ? 'bg-gradient-to-r from-[#06b6d4] to-[#2b496d] text-white hover:shadow hover:shadow-[#06b6d4]/30'
                      : 'bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white hover:shadow hover:shadow-[#ec4899]/30'
              }`}
              aria-label={isPreorder ? `Reservar ${title}` : `Agregar ${title} al carrito`}
            >
              <ShoppingCart size={12} />
              <span>
                {added
                  ? '¡Agregado!'
                  : isPreorder
                    ? `Reservar S/ ${(preorderDeposit ?? 10).toFixed(2)}`
                    : 'Agregar al carrito'}
              </span>
            </button>
          )}
        </div>
      </Link>
    );
  }

  // ── Variant: minimal (favoritos) ───────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <div className="group card-manga relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden transition-all hover:-translate-y-0.5">
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
            aria-label={`Eliminar ${title}`}
          >
            <Trash2 size={14} />
          </button>
        )}
        <Link href={`/products/${slug}`} className="block">
          <ProductImage
            src={images?.[0]}
            alt={title}
            aspect="2/3"
            sizes={sizes ?? defaultSizes}
            priority={priority}
          />
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{editorial}</p>
            <p className="text-base font-bold text-[#2b496d] dark:text-[#5a7a9e] mt-1.5">
              S/ {pricePEN.toFixed(2)}
            </p>
          </div>
        </Link>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-full py-2 px-3 bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white text-xs font-semibold rounded-md hover:shadow-lg hover:shadow-[#ec4899]/30 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ShoppingCart size={14} />
            {added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    );
  }

  // ── Variant: default (grid principal) ──────────────────────────────────────
  return (
    <Link
      href={`/products/${slug}`}
      className="group card-manga relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
    >
      {/* Imagen con sheen */}
      <div className="relative overflow-hidden">
        <ProductImage
          src={images?.[0]}
          alt={title}
          aspect="2/3"
          sizes={sizes ?? defaultSizes}
          priority={priority}
        />

        {/* Sheen al hover — diagonal */}
        <span
          className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-sheen pointer-events-none"
          aria-hidden="true"
        />

        {/* Estado agotado overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider px-3 py-1 rounded-md bg-red-500/90 rotate-[-6deg] shadow-lg">
              Agotado
            </span>
          </div>
        )}

        {/* Tags con color por tipo */}
        {tags.length > 0 && !isOutOfStock && (
          <div className="absolute top-2 right-2 space-y-1 z-10 pointer-events-none">
            {tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className={`inline-block ${getTagAccent(tag, idx)} text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-lg`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Favorite toggle (opcional) */}
        {showFavoriteToggle && (
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md hover:scale-110 transition-all"
            aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              size={14}
              className={fav ? 'text-[#ec4899]' : 'text-gray-400 hover:text-[#ec4899]'}
              fill={fav ? 'currentColor' : 'none'}
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.75rem] group-hover:text-[#ec4899] dark:group-hover:text-[#ec4899] transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">{editorial}</p>

        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">{description}</p>
        )}

        <div className="mt-auto space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-2xl font-extrabold text-[#2b496d] dark:text-[#5a7a9e]">
              S/ {pricePEN.toFixed(2)}
            </p>

            {/* Stock inline */}
            {isPreorder ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#06b6d4]">
                Preventa
              </span>
            ) : !isOutOfStock && stock > 0 && stock < 5 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#eab308]">
                ¡últimas {stock}!
              </span>
            ) : !isOutOfStock && stock >= 5 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                En stock
              </span>
            ) : null}
          </div>

          {/* Hint reserva preventa */}
          {isPreorder && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              Reserva S/ {(preorderDeposit ?? 10).toFixed(2)} y paga el resto al llegar.
            </p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
              added
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : isOutOfStock
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                  : isPreorder
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#2b496d] text-white hover:shadow-lg hover:shadow-[#06b6d4]/30'
                    : 'bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white hover:shadow-lg hover:shadow-[#ec4899]/30'
            }`}
            aria-label={isPreorder ? `Reservar ${title}` : `Agregar ${title} al carrito`}
          >
            <ShoppingCart size={16} />
            <span>
              {added
                ? '¡Agregado!'
                : isPreorder
                  ? `Reservar S/ ${(preorderDeposit ?? 10).toFixed(2)}`
                  : 'Agregar al carrito'}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
