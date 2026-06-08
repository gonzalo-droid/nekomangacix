'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  src?: string;
  alt: string;
  fit?: 'cover' | 'contain';
  aspect?: '2/3' | 'square';
  sizes?: string;
  priority?: boolean;
  className?: string;
  hoverScale?: boolean;
}

export default function ProductImage({
  src,
  alt,
  fit = 'cover',
  aspect = '2/3',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
  priority = false,
  className = '',
  hoverScale = true,
}: Props) {
  const [error, setError] = useState(false);
  const hasImage = Boolean(src) && !error;

  const aspectClass = aspect === '2/3' ? 'aspect-[2/3]' : 'aspect-square';
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain p-3';

  return (
    <div
      className={`relative w-full ${aspectClass} bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 overflow-hidden ${className}`}
    >
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${fitClass} ${hoverScale ? 'transition-transform duration-500 group-hover:scale-[1.04]' : ''}`}
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <div className="text-5xl mb-1.5 opacity-70">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2 font-medium px-1">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
}
