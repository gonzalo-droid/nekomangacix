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
import MangaMarqueeBackground from './MangaMarqueeBackground';

// public/images/manga/manga-001.webp … manga-050.webp
const MARQUEE_COVERS = Array.from(
  { length: 50 },
  (_, i) => `/images/manga/manga-${String(i + 1).padStart(3, '0')}.webp`
);

export const metadata: Metadata = {
  title: 'Neko Manga Cix — Enlaces',
  description: 'Todos nuestros enlaces: catálogo, preventas, ofertas y redes sociales de Neko Manga Cix.',
  robots: { index: false, follow: false },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51924462641';

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
  /** Color de la flecha y del glow al hover */
  arrow: string;
  /** true = CTA principal con fondo en gradiente completo */
  primary?: boolean;
}

const LINKS: LinkItem[] = [
  {
    href: '/products',
    title: 'Catálogo completo',
    subtitle: 'Manga, figuras y más',
    icon: <BookOpen size={20} />,
    accent: 'from-[#ec4899] to-[#f97316]',
    arrow: 'text-white',
    primary: true,
  },
  {
    href: '/products?stock=preorder',
    title: 'Preventas activas',
    subtitle: 'Reserva con el 50% de adelanto',
    icon: <Clock size={20} />,
    accent: 'from-[#06b6d4] to-[#2b496d]',
    arrow: 'text-[#06b6d4]',
  },
  {
    href: '/products?stock=in_stock',
    title: 'Ofertas y stock ✨',
    subtitle: 'Disponible para envío inmediato',
    icon: <Sparkles size={20} />,
    accent: 'from-[#eab308] to-[#ec4899]',
    arrow: 'text-[#eab308]',
  },
  {
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20Neko%20Manga%20Cix%2C%20quiero%20consultar`,
    title: 'Escríbenos por WhatsApp',
    subtitle: 'Consultas y pedidos personalizados',
    external: true,
    icon: <MessageCircle size={20} />,
    accent: 'from-[#25D366] to-[#128c4a]',
    arrow: 'text-[#25D366]',
  },
];

export default function LinksPage() {
  return (
    <div className="h-dvh w-full relative bg-[#050508] overflow-hidden flex">
      {/* Portadas de manga moviéndose en diagonal, cubre toda la pantalla */}
      <MangaMarqueeBackground covers={MARQUEE_COVERS} />

      {/* Panel de contenido — 40% del ancho, alto completo, sin scroll */}
      <div className="relative z-10 w-full sm:w-[40%] sm:min-w-[340px] h-full flex flex-col justify-center px-6 sm:px-8 py-6 shrink-0">
        {/* Logo con glow de marca */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#ec4899] to-[#06b6d4] opacity-60 blur-md" aria-hidden="true" />
          <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-[#ec4899]/50 shadow-2xl shadow-black/40">
            <Image
              src="/images/brand/logo-dark-trimmed.png"
              alt="Neko Manga Cix"
              fill
              className="object-cover"
              priority
              sizes="100px"
            />
          </div>
        </div>

        <h1 className="font-extrabold text-xl tracking-tight text-neko-gradient">@neko.manga.cix</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          No esperes más, encuentra tu próximo manga favorito.
        </p>

        {/* Iconos redes */}
        <div className="flex items-center gap-2.5 mt-4">
          {SOCIAL_ICONS.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 hover:scale-110 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>

        {/* Lista de enlaces */}
        <div className="w-full flex flex-col gap-3 mt-7">
          {LINKS.map((item) => {
            const Content = (
              <>
                <span
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                    item.primary ? 'bg-white/20' : `bg-gradient-to-br ${item.accent}`
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0 text-left">
                  <span className="block font-bold text-white text-sm leading-tight truncate">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className={`block text-xs mt-0.5 truncate ${item.primary ? 'text-white/80' : 'text-gray-400'}`}>
                      {item.subtitle}
                    </span>
                  )}
                </span>
                <ArrowRight
                  size={15}
                  className={`flex-shrink-0 ${item.arrow} opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`}
                />
              </>
            );

            const className = item.primary
              ? `group w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl bg-gradient-to-r ${item.accent} shadow-lg shadow-[#ec4899]/30 hover:shadow-xl hover:shadow-[#ec4899]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200`
              : 'group w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200';

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

        <p className="text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} Neko Manga Cix · Chiclayo, Perú
        </p>
      </div>

      {/* Espacio derecho — deja ver la animación de portadas de fondo */}
      <div className="hidden sm:block sm:w-[60%] h-full pointer-events-none" aria-hidden="true" />
    </div>
  );
}
