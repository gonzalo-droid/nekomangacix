import Link from 'next/link';
import { CalendarCheck, Clock3, MessageCircle, PackageSearch, Wallet } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { PREORDER_DEPOSIT_RATE } from '@/lib/domain/cart/calculate';
import { INSTAGRAM_URL, WHATSAPP_URL } from '@/lib/site';

/** Tiempo de llegada desde el cierre de la preventa, por origen de la edición. */
const ARRIVAL_TIMES: Record<CountryCode, string> = {
  AR: '2 a 3 semanas',
  MX: '3 a 4 semanas',
  ES: '4 a 5 semanas',
  JP: '2 a 3,5 meses',
};

const DEPOSIT_PERCENT = Math.round(PREORDER_DEPOSIT_RATE * 100);

interface Props {
  /** Solo se listan los tiempos de los países que tienen productos cargados. */
  countries: readonly CountryCode[];
}

/** Políticas de pedido: cómo se separa, qué pasa si se agota, plazos y recojo. */
export default function OrderPoliciesSection({ countries }: Props) {
  const arrivals = countries.filter((c) => ARRIVAL_TIMES[c]);

  const policies = [
    {
      icon: Wallet,
      title: `Separa con el ${DEPOSIT_PERCENT} %`,
      body: (
        <>
          Reservas tu tomo pagando el {DEPOSIT_PERCENT} % de su valor y el resto cuando llega.
          Las ediciones limitadas pueden pedir otro monto.
        </>
      ),
    },
    {
      icon: PackageSearch,
      title: 'Según disponibilidad de la editorial',
      body: (
        <>
          Si un tomo se agota en la editorial, tú eliges: pasarlo a la siguiente preventa,
          usar el monto en otro producto o pedir la devolución.
        </>
      ),
    },
    {
      icon: Clock3,
      title: 'Tiempos de llegada',
      body: (
        <>
          Desde el cierre de la preventa:
          <ul className="mt-2 space-y-1">
            {arrivals.map((code) => (
              <li key={code} className="flex justify-between gap-3">
                <span>{COUNTRIES[code].name}</span>
                <strong className="font-semibold text-gray-900 dark:text-white">{ARRIVAL_TIMES[code]}</strong>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      icon: CalendarCheck,
      title: '3 semanas para recoger',
      body: (
        <>
          Cuando llega tu pedido tienes 3 semanas para coordinar el recojo. Pasado ese plazo,
          lo que separaste queda como <strong className="font-semibold text-gray-900 dark:text-white">saldo a favor</strong> para otra compra.
        </>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="home-politicas">
      <SectionHeader
        id="home-politicas"
        badge="// Políticas de pedido"
        title="Cómo funciona tu pedido"
        description="Todo lo que debes saber antes de separar tu próximo manga, para que no haya sorpresas."
      />

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {policies.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="relative flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-6"
          >
            <span className="mb-4 w-12 h-12 rounded-xl bg-[#ec4899]/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
              <Icon size={22} />
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{body}</div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <a
          href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola, tengo una duda sobre cómo hacer mi pedido')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold transition-colors"
        >
          <MessageCircle size={18} aria-hidden="true" />
          ¿Dudas? Escríbenos por WhatsApp
        </a>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          También por{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-neko-magenta-ink underline underline-offset-2 hover:no-underline">
            Instagram
          </a>{' '}
          o en las{' '}
          <Link href="/faq" className="font-semibold text-neko-magenta-ink underline underline-offset-2 hover:no-underline">
            preguntas frecuentes
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
