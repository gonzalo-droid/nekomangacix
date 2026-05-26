interface Props {
  className?: string;
  as?: 'div' | 'span';
}

/**
 * Placeholder con efecto shimmer. Usa la animación `shimmer` definida en globals.css.
 * Si la animación no existe, cae a un fondo estático.
 */
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <Skeleton className="w-full aspect-[2/3] rounded-none" />
      <div className="p-4 flex flex-col gap-2.5 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <div className="mt-auto pt-2 space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
