import Link from 'next/link';
import FairGallery from '@/components/FairGallery';
import PageHero from '@/components/PageHero';
import TrustBadges from '@/components/TrustBadges';
import Wordmark from '@/components/Wordmark';
import {
  Gem,
  Handshake,
  HeartPulse,
  Truck,
  MessageCircle,
  BookOpenText,
  Ticket,
  MapPin,
  Instagram,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Nosotros — Neko Manga Cix',
  description:
    'Conoce la historia y los valores detrás de Neko Manga Cix, tu tienda de manga y coleccionables en Perú.',
};

const VALUES = [
  {
    icon: Gem,
    title: 'Calidad',
    desc: 'Solo productos originales y verificados antes del envío. Cuidamos cada tomo como si fuera para nosotros.',
    accent: 'text-[#eab308]',
    bg: 'bg-[#eab308]/10',
    ring: 'ring-[#eab308]/20',
  },
  {
    icon: Handshake,
    title: 'Confianza',
    desc: 'Transparencia total: precios claros, stock real, entrega puntual. Sin letras chicas.',
    accent: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10',
    ring: 'ring-[#06b6d4]/20',
  },
  {
    icon: HeartPulse,
    title: 'Pasión',
    desc: 'Somos fans de manga como tú. Curamos cada recomendación con el corazón.',
    accent: 'text-[#ec4899]',
    bg: 'bg-[#ec4899]/10',
    ring: 'ring-[#ec4899]/20',
  },
];

const SERVICES = [
  { icon: Truck,        title: 'Envío a todo el Perú',     desc: 'Olva Courier y Shalom. Empaque resistente que cuida cada tomo.' },
  { icon: Ticket,       title: 'Precios competitivos',      desc: 'Ofertas regulares y preventas con descuentos para miembros.' },
  { icon: MessageCircle, title: 'Atención por WhatsApp',    desc: 'Preguntas, recomendaciones y preventas — respondemos rápido.' },
  { icon: BookOpenText,  title: 'Catálogo curado',          desc: 'Editoriales argentina, mexicana y española + coleccionables originales.' },
];

const STATS = [
  { n: '1000+', label: 'Títulos en catálogo' },
  { n: '24',    label: 'Provincias con envío' },
  { n: '4',     label: 'Ediciones regionales' },
  { n: '★ 4.9', label: 'Rating promedio' },
];

export default function AboutPage() {
  return (
    <div className="w-full">
      <PageHero
        eyebrow="Sobre nosotros"
        title={
          <>
            Más que una tienda:{' '}
            <span className="text-neko-gradient">una comunidad manga</span>.
          </>
        }
        subtitle="Desde Chiclayo al resto del Perú. Desde 2023 acercando el mejor manga y coleccionables a fans como tú."
      />

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-4 sm:p-6">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? 'sm:border-l border-gray-100 dark:border-white/5' : ''}`}>
              <p className="text-2xl sm:text-3xl font-extrabold text-neko-gradient">{s.n}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Misión */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-2">
              {'// Nuestra misión'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Acercar el manga a todo el Perú.
            </h2>
            <span
              className="block mt-3 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
              aria-hidden="true"
            />

            <div className="mt-6 space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                El manga es más que entretenimiento: es arte, cultura y un universo de historias.
                Queremos que acceder a él en Perú sea fácil, confiable y asequible.
              </p>
              <p>
                Trabajamos directo con editoriales y distribuidores oficiales para garantizar
                originalidad. Cuidamos el empaque para que tu tomo llegue impecable, y mantenemos
                contacto cercano por WhatsApp en todo el proceso.
              </p>
            </div>
          </div>

          {/* Card decorativa con gradiente y halftone */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b496d] via-[#1e3550] to-[#0a0a0f] p-10 sm:p-14 min-h-[300px] text-white shadow-xl">
            <div className="absolute inset-0 bg-halftone opacity-50 pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#ec4899] opacity-30 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-20 -left-12 w-60 h-60 rounded-full bg-[#06b6d4] opacity-25 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
                Chiclayo, Perú · Desde 2023
              </p>
              <Wordmark size="2xl" tone="dark" layout="stacked" as="div" className="mb-4" />
              <p className="text-white/70 max-w-md">
                Sirviendo a la comunidad otaku peruana con ediciones originales y coleccionables
                oficiales.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[#ec4899]" />
                <span className="text-white/80">Chiclayo · envíos a nivel nacional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 relative">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-2">
            {'// Nuestros valores'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Lo que nos mueve
          </h2>
          <span
            className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
            aria-hidden="true"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className={`group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-all ring-1 ${v.ring} hover:shadow-xl`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${v.bg} ${v.accent} mb-4 transition-transform group-hover:scale-110`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Servicios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b496d]/[0.04] via-transparent to-[#ec4899]/[0.05] dark:from-[#06b6d4]/[0.05] dark:to-[#ec4899]/[0.05] border border-gray-100 dark:border-white/5 p-8 sm:p-12">
          <div className="mb-8">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#06b6d4] mb-2">
              {'// Qué ofrecemos'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Todo lo que necesitas, en un solo lugar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 flex items-center justify-center text-[#2b496d] dark:text-[#5a7a9e]">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">{s.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Galería de ferias */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <FairGallery />
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TrustBadges variant="full" />
      </section>

      {/* Contacto rápido + CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Contacto directo
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/51924262747"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#25D366] transition-colors"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  <span>(+51) 924 262 747</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/neko.manga.cix/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-[#ec4899] transition-colors"
                >
                  <Instagram size={18} className="text-[#ec4899]" />
                  <span>@neko.manga.cix</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin size={18} className="text-[#06b6d4]" />
                <span>Chiclayo, Perú</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] transition-colors"
            >
              Envíanos un mensaje <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#1e3550] to-[#0a0a0f] text-white p-6 sm:p-8 flex flex-col justify-between">
            <div className="absolute inset-0 bg-halftone opacity-40 pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#ec4899] opacity-30 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2">
                ¿Listo para tu próxima lectura?
              </h3>
              <p className="text-white/75 text-sm">
                Mira nuestro catálogo completo — shōnen, seinen, shōjo, coleccionables y más.
              </p>
            </div>
            <Link
              href="/products"
              className="relative mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-xl shadow-[#ec4899]/30 hover:shadow-[#ec4899]/50 hover:scale-[1.02] active:scale-[0.98] transition-all self-start"
            >
              Ver catálogo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
