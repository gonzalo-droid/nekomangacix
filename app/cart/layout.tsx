import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { privatePageMetadata } from '@/lib/seo';

// La página es un componente de cliente y no puede exportar metadata: se
// declara en este layout, que no agrega nada al árbol.
export const metadata: Metadata = privatePageMetadata('Tu carrito');

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
