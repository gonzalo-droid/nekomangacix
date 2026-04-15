import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import {
  Truck,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  MessageCircle,
  ShoppingCart,
  CheckCircle2,
  Send,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Políticas de Envío',
  description: 'Información sobre envíos, tiempos de entrega y costos de NekoMangaCix.',
};

const HIGHLIGHTS = [
  {
    Icon: Truck,
    title: 'Envíos a todo el Perú',
    desc: 'Cualquier departamento del país mediante courier confiable (Olva, Shalom).',
    accent: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10',
    ring: 'ring-[#06b6d4]/20',
  },
  {
    Icon: Clock,
    title: '2–5 días hábiles',
    desc: 'Tiempo promedio desde la confirmación del pago hasta la entrega.',
    accent: 'text-[#ec4899]',
    bg: 'bg-[#ec4899]/10',
    ring: 'ring-[#ec4899]/20',
  },
  {
    Icon: MapPin,
    title: 'Chiclayo y Lima',
    desc: 'Entregas locales con tiempos reducidos (1–3 días hábiles).',
    accent: 'text-[#eab308]',
    bg: 'bg-[#eab308]/10',
    ring: 'ring-[#eab308]/20',
  },
  {
    Icon: Package,
    title: 'Empaque protector',
    desc: 'Burbuja + caja reforzada. Tus tomos llegan como recién salidos de imprenta.',
    accent: 'text-[#5a7a9e]',
    bg: 'bg-[#5a7a9e]/10',
    ring: 'ring-[#5a7a9e]/20',
  },
];

const RATES = [
  { dest: 'Chiclayo (local)',        cost: 'S/ 5.00',         time: '1–2 días hábiles' },
  { dest: 'Lima y Callao',            cost: 'S/ 15.00',        time: '2–3 días hábiles' },
  { dest: 'Norte del Perú',           cost: 'S/ 15.00',        time: '3–4 días hábiles' },
  { dest: 'Sur del Perú',             cost: 'S/ 15.00',        time: '3–5 días hábiles' },
  { dest: 'Selva / zonas alejadas',   cost: 'S/ 18.00 – 25.00', time: '5–7 días hábiles' },
];

const STEPS = [
  { Icon: ShoppingCart, title: 'Realizas tu pedido',    desc: 'Agrega al carrito y coordina por WhatsApp los detalles de entrega.' },
  { Icon: Send,          title: 'Confirmas el pago',     desc: 'Yape, Plin o transferencia BCP. Nos envías el voucher para confirmar.' },
  { Icon: Package,       title: 'Preparamos tu pedido',  desc: 'Verificamos tu pago y embalamos cuidadosamente cada tomo.' },
  { Icon: Truck,         title: 'Despachamos',           desc: 'Entregamos al courier y te enviamos el número de seguimiento.' },
  { Icon: CheckCircle2,  title: 'Recibes tu manga',      desc: 'Llega a tu puerta. Coordinaremos contigo la recepción.' },
];

export default function ShippingPage() {
  return (
    <div className="w-full">
      <PageHero
        eyebrow="Políticas de envío"
        title={
          <>
            Cómo llega tu <span className="text-neko-gradient">manga</span>.
          </>
        }
        subtitle="Tiempos, costos y todo el proceso — con total transparencia."
      />

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HIGHLIGHTS.map(({ Icon, title, desc, accent, bg, ring }) => (
            <div
              key={title}
              className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-5 ring-1 ${ring} hover:-translate-y-1 hover:shadow-xl transition-all`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} ${accent} mb-3`}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Tabla de tarifas */}
        <div>
          <div className="mb-6 relative">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-2">
              {'// Tarifas'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Costos por destino
            </h2>
            <span
              className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
              aria-hidden="true"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                  <tr>
                    <th className="py-3.5 px-5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Destino</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Costo</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tiempo estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {RATES.map((row) => (
                    <tr key={row.dest} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 text-gray-900 dark:text-white font-medium">{row.dest}</td>
                      <td className="py-3.5 px-5 font-bold text-[#ec4899]">{row.cost}</td>
                      <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Proceso */}
        <div>
          <div className="mb-6 relative">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#06b6d4] mb-2">
              {'// Paso a paso'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Proceso de envío
            </h2>
            <span
              className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
              aria-hidden="true"
            />
          </div>

          <ol className="relative space-y-5 pl-6 sm:pl-0">
            {/* Línea vertical conectora — solo en desktop */}
            <span
              className="absolute hidden sm:block left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-[#ec4899] via-[#06b6d4] to-transparent"
              aria-hidden="true"
            />
            {STEPS.map((s, idx) => {
              const Icon = s.Icon;
              return (
                <li key={s.title} className="relative flex gap-4 items-start">
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ec4899] to-[#06b6d4] flex items-center justify-center text-white shadow-lg shadow-[#ec4899]/25">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 pb-2 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                      Paso {String(idx + 1).padStart(2, '0')}
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Aviso importante */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#eab308]/10 to-[#f97316]/10 border border-[#eab308]/30 p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#eab308]/20 text-[#eab308] flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Importante</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 list-disc list-inside marker:text-[#eab308]">
                <li>Los tiempos son estimados y pueden variar por factores externos.</li>
                <li>NekoMangaCix no se responsabiliza por demoras del courier.</li>
                <li>Los productos a pedido y preventa tienen tiempos adicionales a los de envío.</li>
                <li>Proporciona una dirección completa y un teléfono disponible.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA dual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/products"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#ec4899] to-[#f97316] text-white hover:shadow-xl hover:shadow-[#ec4899]/30 transition-all"
          >
            <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" aria-hidden="true" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
                  Explorar
                </p>
                <p className="text-xl font-extrabold">Ver catálogo</p>
              </div>
              <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <a
            href="https://wa.me/51924262747?text=Hola%2C%20quiero%20consultar%20sobre%20un%20env%C3%ADo"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 hover:border-[#25D366]/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  ¿Tienes dudas?
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-[#25D366] transition-colors">
                  Escríbenos por WhatsApp
                </p>
              </div>
              <MessageCircle size={22} className="text-[#25D366] transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
