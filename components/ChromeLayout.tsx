'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

/**
 * Rutas donde se oculta el chrome global (header + footer + botón flotante).
 * Usamos prefijos: cualquier ruta que empiece con uno de estos no muestra chrome.
 */
const HIDE_CHROME_PREFIXES = ['/auth'];

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
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
