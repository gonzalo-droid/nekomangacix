'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';


/**
 * Rutas donde se oculta el chrome global (header + footer + botón flotante).
 * Usamos prefijos: cualquier ruta que empiece con uno de estos no muestra chrome.
 */
const HIDE_CHROME_PREFIXES = ['/auth', '/links'];

interface Props {
  children: React.ReactNode;
}

/**
 * Layout visual que decide si renderizar o no el chrome global según la ruta.
 * Las rutas de auth (login/register/callback) son pantallas completas con su
 * propio shell — al ocultar Header/Footer se elimina la franja blanca bajo el
 * split-screen sin afectar el resto de la app.
 */
export default function ChromeLayout({ children }: Props) {
  const pathname = usePathname() ?? '';
  const hideChrome = HIDE_CHROME_PREFIXES.some((p) => pathname.startsWith(p));

  if (hideChrome) {
    // Auth pages: solo el contenido, sin <main> wrapper para que AuthShell
    // pueda usar min-h-screen completo
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-3 focus:rounded-lg focus:bg-white dark:focus:bg-gray-900 focus:text-gray-900 dark:focus:text-white focus:font-semibold focus:shadow-xl focus:ring-2 focus:ring-[#ec4899]"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
