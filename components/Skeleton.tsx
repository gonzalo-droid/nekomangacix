interface Props {
  className?: string;
  as?: 'div' | 'span';
}

export default function Skeleton({ className = '', as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </Tag>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden flex flex-col">
      {/* Imagen proporción 2/3 */}
      <Skeleton className="w-full aspect-[2/3] rounded-none" />
      <div className="p-3.5 flex flex-col gap-2 flex-grow">
        {/* Título — 2 líneas */}
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        {/* Editorial con país — 1 línea más corta */}
        <Skeleton className="h-3 w-1/2 mt-0.5" />
        {/* Precio */}
        <div className="mt-auto pt-2">
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    </div>
  );
}
