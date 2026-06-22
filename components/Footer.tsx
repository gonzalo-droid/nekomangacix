import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Instagram, Facebook, MapPin, BookOpen, Clock, ArrowRight } from 'lucide-react';
import Wordmark from './Wordmark';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.46a8.16 8.16 0 004.77 1.52V6.53a4.85 4.85 0 01-1.84-.16z" />
    </svg>
  );
}

const SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/people/Neko-Manga-CIX/61562296206939/', icon: Facebook, hover: 'hover:bg-[#1877f2] hover:border-[#1877f2]', label: 'Facebook' },
  { name: 'WhatsApp', href: 'https://wa.me/51924262747', icon: MessageCircle, hover: 'hover:bg-[#25D366] hover:border-[#25D366]', label: 'WhatsApp' },
  { name: 'Instagram', href: 'https://www.instagram.com/neko.manga.cix/', icon: Instagram, hover: 'hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#515bd4] hover:border-transparent', label: 'Instagram' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@neko.manga.cix', icon: TikTokIcon, hover: 'hover:bg-white hover:text-black hover:border-white', label: 'TikTok' },
] as const;

const EXPLORE_LINKS = [
  { href: '/products', label: 'Todo el catálogo' },
  { href: '/products?stock=preorder', label: 'Preventas activas' },
  { href: '/products?stock=in_stock', label: 'En stock' },
  { href: '/products?type=figure', label: 'Figuras coleccionables' },
  { href: '/products?type=manga', label: 'Manga' },
];

const INFO_LINKS = [
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contacto' },
  { href: '/faq', label: 'Preguntas frecuentes' },
  { href: '/shipping', label: 'Políticas de envío' },
  { href: '/terms', label: 'Términos y condiciones' },
  { href: '/privacy', label: 'Política de privacidad' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20">
      {/* Separador diagonal */}
      <div className="relative h-16 overflow-hidden bg-white dark:bg-gray-950" aria-hidden="true">
        <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full">
          <polygon points="0,64 1440,0 1440,64" fill="#050508" />
        </svg>
      </div>

      {/* Cuerpo principal */}
      <div className="bg-[#050508] pb-10">
        {/* CTA WhatsApp */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1f0d] via-[#0a1a12] to-[#0d1f0d] border border-[#25D366]/20 px-8 sm:px-12 py-10 sm:py-12">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#25D366] opacity-10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25D366]/70 mb-2">Atención al cliente</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  ¿Dudas sobre tu pedido?
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Escríbenos y te respondemos en minutos. Productos, envíos, preventas.
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                <a
                  href="https://wa.me/51924262747?text=Hola%20Neko%20Manga%20Cix%2C%20quiero%20consultar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-base shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap"
                >
                  <MessageCircle size={20} className="transition-transform group-hover:rotate-12" />
                  Escribir por WhatsApp
                  <ArrowRight size={16} className="opacity-70 transition-transform group-hover:translate-x-1" />
                </a>
                <p className="text-white/30 text-xs">Lun – Sáb · 9 am a 9 pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisora con glow */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="relative h-px bg-gradient-to-r from-transparent via-[#ec4899]/40 to-transparent mb-14">
            <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 w-5 h-5 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
            </div>
          </div>

          {/* Grid de columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

            {/* Col 1 — Marca */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <Image src="/images/brand/logo-dark.png" alt="" width={160} height={54} className="h-14 w-auto mb-3" aria-hidden="true" />
                <Wordmark size="lg" tone="dark" as="div" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-600 mb-3">
                Manga · Coleccionables · Perú
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Tu tienda de manga de confianza.<br />Envíos a todo el Perú desde Chiclayo.
              </p>

              {/* Redes */}
              <div className="flex items-center gap-2">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 text-gray-400 transition-all duration-200 ${s.hover} hover:text-white hover:scale-110`}
                    >
                      <Icon size={15} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Col 2 — Explorar */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#ec4899] mb-5">
                Explorar
              </h3>
              <ul className="space-y-3">
                {EXPLORE_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#ec4899] transition-colors flex-shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Información */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#06b6d4] mb-5">
                Información
              </h3>
              <ul className="space-y-3">
                {INFO_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#06b6d4] transition-colors flex-shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contacto */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-5">
                Contacto
              </h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="https://wa.me/51924262747" target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-500 hover:text-[#25D366] transition-colors group">
                    <MessageCircle size={15} className="text-[#25D366] mt-0.5 flex-shrink-0" />
                    <span>(+51) 924 262 747</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/neko.manga.cix/" target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-500 hover:text-[#ec4899] transition-colors">
                    <Instagram size={15} className="text-[#ec4899] mt-0.5 flex-shrink-0" />
                    <span>@neko.manga.cix</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <MapPin size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Chiclayo, Perú</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <Clock size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Lunes – Sábado</p>
                    <p className="text-gray-600">9:00 am – 9:00 pm</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Libro de Reclamaciones + Copyright */}
          <div className="mt-14 pt-8 border-t border-gray-800/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

              <a
                href="https://www.gob.pe/indecopi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/60 border border-red-800/40 hover:border-red-600/60 transition-colors group"
                aria-label="Libro de Reclamaciones"
              >
                <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 leading-none">INDECOPI</p>
                  <p className="text-sm font-semibold text-red-200 leading-tight mt-0.5">Libro de Reclamaciones</p>
                </div>
              </a>

              <div className="text-center sm:text-right">
                <p className="text-gray-600 text-xs mb-1">
                  © {year} Neko Manga Cix · Todos los derechos reservados.
                </p>
                <p className="text-gray-700 text-xs">
                  Hecho con <span className="text-[#ec4899]">♥</span> para los amantes del manga en Perú
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
