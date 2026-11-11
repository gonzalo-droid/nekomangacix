import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata('Iniciar sesión');

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
