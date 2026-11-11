import { Clock, Instagram, MapPin, Navigation, Store } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, STORE } from '@/lib/site';

/** Tienda física en Chiclayo: dirección, horario y cómo llegar. */
export default function StoreSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="home-tienda">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ec4899]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-neko-magenta-ink">
            <Store size={15} aria-hidden="true" />
            Tienda física en {STORE.city}
          </span>
          <h2 id="home-tienda" className="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">
            Visítanos en nuestra tienda en {STORE.city}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl">
            Ven a ver los tomos y las figuras en persona, recoger tu pedido o simplemente conocernos.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
                <MapPin size={22} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Dirección</p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {STORE.streetAddress}, {STORE.city}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
                <Clock size={22} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Horario de atención</p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{STORE.daysLabel}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{STORE.hoursLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={STORE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold transition-colors"
            >
              <Navigation size={18} aria-hidden="true" />
              Cómo llegar
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl border-2 border-[#be185d] text-neko-magenta-ink font-bold hover:bg-[#be185d] hover:text-white transition-colors"
            >
              <Instagram size={18} aria-hidden="true" />
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        {/* Tarjeta de horario. En el móvil repetiría lo que ya dice la
            columna de la izquierda, así que solo se muestra en escritorio. */}
        <div className="hidden lg:block rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30 p-8 text-center">
          <span className="mx-auto w-16 h-16 rounded-2xl bg-[#ec4899]/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
            <Store size={30} />
          </span>
          <p className="mt-5 text-2xl font-extrabold text-gray-900 dark:text-white">¿Cuándo visitarnos?</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Cada fin de semana abrimos para que veas, toques y te lleves tus tomos favoritos.
          </p>
          <table className="mt-6 w-full rounded-2xl overflow-hidden bg-[#fdf2f8] dark:bg-white/5 text-left">
            <caption className="sr-only">Horario de la tienda</caption>
            <tbody>
              {['Sábado', 'Domingo'].map((day) => (
                <tr key={day} className="border-b last:border-0 border-[#fbcfe8] dark:border-white/10">
                  <th scope="row" className="px-5 py-4 font-bold text-gray-900 dark:text-white">{day}</th>
                  <td className="px-5 py-4 text-right font-semibold whitespace-nowrap text-neko-magenta-ink">{STORE.hoursShortLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
