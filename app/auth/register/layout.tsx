import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata('Crear cuenta');

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
