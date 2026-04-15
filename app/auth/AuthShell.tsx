import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Sparkles, ShieldCheck, BookOpenText, X, ArrowLeft } from 'lucide-react';
import Wordmark from '@/components/Wordmark';

interface Props {
  /** Título del formulario (ej. "Iniciar sesión") */
  title: string;
  /** Subtítulo corto */
  subtitle?: string;
  /** Contenido del formulario */
  children: ReactNode;
}

/**
 * Shell compartido para /auth/login y /auth/register:
 * desktop → split 50/50 con collage de portadas manga a la izquierda;
 * mobile → formulario centrado con fondo halftone sutil.
 */
export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0a0a0f]">
      {/* Salida rápida — fixed para que aparezca en todos los scrolls y layouts */}
      <Link
        href="/"
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-[#ec4899] hover:text-[#ec4899] hover:shadow-lg hover:shadow-[#ec4899]/20 transition-all"
        aria-label="Volver a la tienda sin iniciar sesión"
      >
        <span className="hidden sm:inline">Volver a la tienda</span>
        <span className="sm:hidden">Tienda</span>
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 group-hover:bg-[#ec4899] group-hover:text-white transition-colors">
          <X size={12} />
        </span>
      </Link>
      {/* ── Columna visual (desktop only) ──────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#141424] to-[#0a0a0f] text-white">
        {/* Halftone + glows */}
        <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#ec4899] opacity-25 blur-[90px] animate-blob pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#06b6d4] opacity-20 blur-[90px] animate-blob pointer-events-none"
          style={{ animationDelay: '2.5s' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 right-1/4 w-56 h-56 rounded-full bg-[#eab308] opacity-10 blur-[70px] animate-pulse-glow pointer-events-none"
          aria-hidden="true"
        />

        {/* Portadas flotantes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute left-[10%] top-[15%] w-[150px] -rotate-[8deg] animate-float-slow"
            style={{ '--r': '-8deg' } as React.CSSProperties}
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image src="/images/manga/naruto_02.png" alt="" fill sizes="150px" className="object-cover" />
            </div>
          </div>
          <div
            className="absolute right-[12%] top-[8%] w-[170px] rotate-[6deg] animate-float-slow z-10"
            style={{ '--r': '6deg', animationDelay: '1.4s' } as React.CSSProperties}
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image src="/images/manga/one_piece_02.png" alt="" fill sizes="170px" className="object-cover" />
            </div>
          </div>
          <div
            className="absolute right-[22%] bottom-[14%] w-[140px] -rotate-[4deg] animate-float-slow"
            style={{ '--r': '-4deg', animationDelay: '2.8s' } as React.CSSProperties}
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image src="/images/manga/jujutsu_kaisen_02.png" alt="" fill sizes="140px" className="object-cover" />
            </div>
          </div>
        </div>

        {/* Top: logo + wordmark */}
        <div className="relative">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5"
            aria-label="Neko Manga Cix — Volver al inicio"
          >
            <Image
              src="/images/logo-dark.png"
              alt=""
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
              aria-hidden="true"
            />
            <Wordmark size="md" tone="dark" as="div" />
          </Link>
        </div>

        {/* Bottom: mensaje + beneficios */}
        <div className="relative max-w-md">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-3">
            {'// Bienvenido'}
          </span>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">
            Tu próxima <span className="text-neko-gradient">aventura manga</span> te espera.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Con una cuenta puedes guardar favoritos, seguir tus pedidos y acceder a ofertas
            exclusivas.
          </p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-3 text-white/80">
              <ShieldCheck size={16} className="text-[#06b6d4] flex-shrink-0" />
              100% ediciones originales
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <Sparkles size={16} className="text-[#eab308] flex-shrink-0" />
              Obsequios en cada compra
            </li>
            <li className="flex items-center gap-3 text-white/80">
              <BookOpenText size={16} className="text-[#ec4899] flex-shrink-0" />
              Catálogo curado con las mejores editoriales
            </li>
          </ul>
        </div>
      </aside>

      {/* ── Columna del formulario ──────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-4 py-10 sm:py-14 bg-gradient-to-b from-white via-gray-50 to-white dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f]">
        {/* Halftone mobile-only */}
        <div
          className="absolute inset-0 bg-halftone opacity-30 lg:hidden pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 -right-20 w-64 h-64 rounded-full bg-[#ec4899] opacity-10 blur-3xl pointer-events-none lg:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 -left-20 w-64 h-64 rounded-full bg-[#06b6d4] opacity-10 blur-3xl pointer-events-none lg:hidden"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-md">
          {/* Logo + wordmark mobile */}
          <Link
            href="/"
            className="lg:hidden flex flex-col items-center gap-2 mb-6"
            aria-label="Neko Manga Cix — Volver al inicio"
          >
            <Image
              src="/images/logo-light.png"
              alt=""
              width={120}
              height={40}
              className="h-9 w-auto dark:hidden"
              priority
              aria-hidden="true"
            />
            <Image
              src="/images/logo-dark.png"
              alt=""
              width={120}
              height={40}
              className="h-9 w-auto hidden dark:block"
              priority
              aria-hidden="true"
            />
            <Wordmark size="sm" tone="auto" as="div" />
          </Link>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl p-7 sm:p-8">
            <div className="mb-6">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-1.5">
                {'// Bienvenido'}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          {/* CTA secundario: seguir sin iniciar sesión */}
          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#ec4899] transition-colors group"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              Seguir viendo productos sin cuenta
            </Link>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-500">
            Al continuar aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-[#ec4899]">Términos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="underline hover:text-[#ec4899]">Política de Privacidad</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
