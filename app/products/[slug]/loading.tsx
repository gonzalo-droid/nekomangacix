import Skeleton, { ProductCardSkeleton } from '@/components/Skeleton';

export default function LoadingProductDetail() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-40 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Imagen */}
          <div className="space-y-3">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        <div className="mb-10">
          <Skeleton className="h-7 w-56 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
