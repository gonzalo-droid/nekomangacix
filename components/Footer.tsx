import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Instagram, Facebook, MapPin, BookOpen } from 'lucide-react';
import TrustBadges from './TrustBadges';
import Wordmark from './Wordmark';

// TikTok icon (lucide-react doesn't ship it)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.46a8.16 8.16 0 004.77 1.52V6.53a4.85 4.85 0 01-1.84-.16z" />
    </svg>
  );
}

const SOCIALS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/neko.manga.cix',
    icon: Facebook,
    hover: 'hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]',
    ariaLabel: 'Síguenos en Facebook',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/51924262747',
    icon: MessageCircle,
    hover: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
    ariaLabel: 'Escríbenos por WhatsApp',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/neko.manga.cix/',
    icon: Instagram,
    hover: 'hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#515bd4] hover:text-white hover:border-transparent',
    ariaLabel: 'Síguenos en Instagram',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@neko.manga.cix',
    icon: TikTokIcon,
    hover: 'hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black',
    ariaLabel: 'Síguenos en TikTok',
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 mt-20">
      {/* Trust Badges strip */}
      <div className="border-b border-gray-800 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TrustBadges variant="full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre Nosotros + Redes */}
          <div>
            <Image
              src="/images/logo-dark.png"
              alt=""
              width={180}
              height={60}
              className="h-16 w-auto mb-3"
              aria-hidden="true"
            />
            <Wordmark size="xl" tone="dark" className="mb-2" as="div" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 mb-4">
              Manga · Coleccionables · Perú
            </p>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Tu tienda de manga online de confianza. Envíos a todo el Perú desde Chiclayo.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.ariaLabel}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 text-gray-300 transition-all duration-200 ${s.hover}`}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?countryGroup=Argentina" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Editorial Argentina
                </Link>
              </li>
              <li>
                <Link href="/products?countryGroup=M%C3%A9xico" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Editorial México
                </Link>
              </li>
              <li>
                <Link href="/products?countryGroup=Espa%C3%B1a" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Editorial España
                </Link>
              </li>
              <li>
                <Link href="/products?countryGroup=Jap%C3%B3n" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Editorial Japón
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <MessageCircle size={16} className="text-green-400 flex-shrink-0" />
                <a
                  href="https://wa.me/51924262747"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  (+51) 924 262 747
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram size={16} className="text-pink-400 flex-shrink-0" />
                <a
                  href="https://www.instagram.com/neko.manga.cix/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  @neko.manga.cix
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-gray-400">Chiclayo, Perú</span>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Políticas de Envío
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Libro de Reclamaciones — bloque oficial */}
        <div className="mt-10 pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <a
              href="https://www.gob.pe/indecopi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors group"
              aria-label="Acceder al Libro de Reclamaciones"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded flex items-center justify-center">
                <BookOpen size={22} className="text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-100 leading-none">
                  INDECOPI · Conforme a ley peruana
                </p>
                <p className="text-sm font-bold text-white leading-tight mt-0.5">
                  Libro de Reclamaciones
                </p>
              </div>
            </a>

            <p className="text-xs text-gray-500 max-w-md">
              Conforme al Código de Protección y Defensa del Consumidor, los establecimientos comerciales deben contar con un Libro de Reclamaciones.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <span>© {currentYear}</span>
            <Wordmark size="xs" tone="dark" gradientAccent={false} className="!text-gray-300" />
            <span>· Todos los derechos reservados.</span>
          </p>
          <p className="text-gray-400 text-sm">
            Hecho con <span className="text-[#ec4899]">♥</span> para los amantes del manga
          </p>
        </div>
      </div>
    </footer>
  );
}
