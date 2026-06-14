import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';

export type SeriesStatus = 'ongoing' | 'completed' | 'single';

export interface Series {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fullDescription?: string;
  author?: string;
  editorial?: string;
  countryCode?: CountryCode;
  demographic?: Demographic;
  seriesStatus: SeriesStatus;
  coverImage?: string;
  basePricePen?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesVolume {
  id: string;
  sku: string;
  slug: string;
  title: string;
  volumeNumber?: number;
  pricePEN: number;
  stock: number;
  stockStatus: string;
  images: string[];
  isActive: boolean;
}

export interface DbSeries {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  full_description: string | null;
  author: string | null;
  editorial: string | null;
  country_code: string | null;
  demographic: string | null;
  series_status: SeriesStatus;
  cover_image: string | null;
  base_price_pen: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function dbRowToSeries(row: DbSeries): Series {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    fullDescription: row.full_description ?? undefined,
    author: row.author ?? undefined,
    editorial: row.editorial ?? undefined,
    countryCode: (row.country_code as CountryCode) ?? undefined,
    demographic: (row.demographic as Demographic) ?? undefined,
    seriesStatus: row.series_status,
    coverImage: row.cover_image ?? undefined,
    basePricePen: row.base_price_pen ? Number(row.base_price_pen) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function seriesToDbRow(s: Partial<Series>): Partial<DbSeries> {
  return {
    ...(s.name !== undefined && { name: s.name }),
    ...(s.slug !== undefined && { slug: s.slug }),
    ...(s.description !== undefined && { description: s.description || null }),
    ...(s.fullDescription !== undefined && { full_description: s.fullDescription || null }),
    ...(s.author !== undefined && { author: s.author || null }),
    ...(s.editorial !== undefined && { editorial: s.editorial || null }),
    ...(s.countryCode !== undefined && { country_code: s.countryCode || null }),
    ...(s.demographic !== undefined && { demographic: s.demographic || null }),
    ...(s.seriesStatus !== undefined && { series_status: s.seriesStatus }),
    ...(s.coverImage !== undefined && { cover_image: s.coverImage || null }),
    ...(s.basePricePen !== undefined && { base_price_pen: s.basePricePen || null }),
    ...(s.isActive !== undefined && { is_active: s.isActive }),
  };
}

/** Fields from a series that can be propagated to all its volumes */
export type SeriesSharedField = 'description' | 'full_description' | 'author' | 'editorial' | 'country_code' | 'demographic' | 'price_pen';
