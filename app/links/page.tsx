import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageCircle,
  Instagram,
  Facebook,
  Mail,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Neko Manga Cix — Enlaces',
  description: 'Todos nuestros enlaces: catálogo, preventas, ofertas y redes sociales de Neko Manga Cix.',
  robots: { index: false, follow: false },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51924262747';

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.46a8.16 8.16 0 004.77 1.52V6.53a4.85 4.85 0 01-1.84-.16z" />
    </svg>
  );
}

const SOCIAL_ICONS = [
  { href: 'mailto:contacto@nekomangacix.com', icon: Mail, label: 'Correo' },
  { href: 'https://www.instagram.com/neko.manga.cix/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/people/Neko-Manga-CIX/61562296206939/', icon: Facebook, label: 'Facebook' },
  { href: 'https://www.tiktok.com/@neko.manga.cix', icon: TikTokIcon, label: 'TikTok' },
] as const;

interface LinkItem {
  href: string;
  title: string;
  subtitle?: string;
  external?: boolean;
  icon: React.ReactNode;
  accent: string;
}

const LINKS: LinkItem[] = [
  {
    href: '/products',
    title: 'Catálogo completo',
    subtitle: 'Manga, figuras y más',
    icon: <BookOpen size={20} />,
    accent: 'from-[#ec4899] to-[#f97316]',
  },
  {
    href: '/products?stock=preorder',
    title: 'Preventas activas',
    subtitle: 'Reserva con el 50% de adelanto',
    icon: <Clock size={20} />,
    accent: 'from-[#06b6d4] to-[#2b496d]',
  },
  {
    href: '/products?stock=in_stock',
    title: 'Ofertas y stock ✨',
    subtitle: 'Disponible para envío inmediato',
    icon: <Sparkles size={20} />,
    accent: 'from-[#eab308] to-[#ec4899]',
  },
  {
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20Neko%20Manga%20Cix%2C%20quiero%20consultar`,
    title: 'Escríbenos por WhatsApp',
    subtitle: 'Consultas y pedidos personalizados',
    external: true,
    icon: <MessageCircle size={20} />,
    accent: 'from-[#25D366] to-[#128c4a]',
  },
  {
    href: 'https://www.instagram.com/neko.manga.cix/',
    title: 'Síguenos en Instagram',
    external: true,
    icon: <Instagram size={20} />,
    accent: 'from-[#f58529] via-[#dd2a7b] to-[#515bd4]',
  },
  {
    href: 'https://www.facebook.com/people/Neko-Manga-CIX/61562296206939/',
    title: 'Síguenos en Facebook',
    external: true,
    icon: <Facebook size={20} />,
    accent: 'from-[#1877f2] to-[#0d5bc7]',
  },
  {
    href: 'https://www.tiktok.com/@neko.manga.cix',
    title: 'Síguenos en TikTok',
    external: true,
    icon: <TikTokIcon size={20} />,
    accent: 'from-gray-900 to-black',
  },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen relative bg-[#050508] overflow-hidden">
      {/* Fondo con blobs de color, sin depender de imágenes externas */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#ec4899] opacity-20 blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#06b6d4] opacity-15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#eab308] opacity-10 blur-[100px]" />
      </div>

      <div className="relative max-w-md mx-auto px-5 pt-14 pb-16 flex flex-col items-center">
        {/* Logo */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 shadow-2xl shadow-black/40 mb-5">
          <Image
            src="/images/brand/neko_manga.png"
            alt="Neko Manga Cix"
            fill
            className="object-cover"
            priority
            sizes="96px"
          />
        </div>

        <h1 className="text-white font-bold text-lg tracking-tight">@neko.manga.cix</h1>
        <p className="text-gray-400 text-sm text-center mt-1.5 max-w-xs">
          No esperes más, encuentra tu próximo manga favorito.
        </p>

        {/* Iconos redes rápidos */}
        <div className="flex items-center gap-3 mt-5">
          {SOCIAL_ICONS.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={s.label}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 hover:scale-110 transition-all duration-200"
              >
                <Icon size={17} />
              </a>
            );
          })}
        </div>

        {/* Título de sección */}
        <div className="text-center mt-9 mb-5">
          <p className="text-white font-bold text-base">Síguenos en nuestras redes</p>
          <p className="text-gray-400 text-sm mt-1">Revisa nuestro catálogo y ofertas 👇</p>
        </div>

        {/* Lista de enlaces */}
        <div className="w-full flex flex-col gap-3.5">
          {LINKS.map((item) => {
            const Content = (
              <>
                <span
                  className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white shadow-lg`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0 text-left">
                  <span className="block font-bold text-gray-900 dark:text-white text-[15px] leading-tight truncate">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="block text-xs text-gray-500 mt-0.5 truncate">{item.subtitle}</span>
                  )}
                </span>
                <ArrowRight size={16} className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </>
            );

            const className =
              'group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900/90 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 border border-white/5';

            return item.external ? (
              <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                {Content}
              </a>
            ) : (
              <Link key={item.title} href={item.href} className={className}>
                {Content}
              </Link>
            );
          })}
        </div>

        <p className="text-gray-600 text-xs mt-10">
          © {new Date().getFullYear()} Neko Manga Cix · Chiclayo, Perú
        </p>
      </div>
    </div>
  );
}
