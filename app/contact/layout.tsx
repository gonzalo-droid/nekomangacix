import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo';

// La página es un componente de cliente y no puede exportar metadata: se
// declara en este layout, que no agrega nada al árbol.
export const metadata: Metadata = pageMetadata({
  title: 'Contacto',
  description:
    'Escríbenos por WhatsApp, Instagram o correo. Atendemos pedidos y consultas de manga y coleccionables en todo el Perú.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
