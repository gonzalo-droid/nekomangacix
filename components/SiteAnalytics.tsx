'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GA_ID, ensureGa } from '@/lib/analytics';

/**
 * Carga la medición del sitio público. El panel de administración queda
 * fuera: su tráfico no es de clientes y ensuciaría los números.
 */
export default function SiteAnalytics() {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdmin) ensureGa();
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <Analytics beforeSend={(event) => (event.url.includes('/admin') ? null : event)} />
      <SpeedInsights />
      {GA_ID && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      )}
    </>
  );
}
