import type { Product } from '@/lib/products';

type Scored = { product: Product; score: number };

export function findRelatedProducts(target: Product, pool: Product[], limit = 8): Product[] {
  const scored: Scored[] = pool
    .filter((p) => p.id !== target.id)
    .map((p) => {
      let score = 0;
      if (target.series && p.series === target.series) score += 100;
      if (target.demographic && p.demographic === target.demographic) score += 30;
      if (p.editorial === target.editorial) score += 10;
      if (p.countryCode === target.countryCode) score += 5;
      if (p.type === target.type) score += 3;
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.product);
}

export function splitRelatedBySeries(target: Product, related: Product[]) {
  const sameSeries = target.series
    ? related.filter((p) => p.series === target.series)
    : [];
  const others = related.filter((p) => !sameSeries.includes(p));
  return { sameSeries, others };
}
