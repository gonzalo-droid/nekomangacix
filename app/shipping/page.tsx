import type { Metadata } from 'next';
import { Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Políticas de Envío',
  description: 'Información sobre envíos, tiempos de entrega y costos de NekoMangaCix.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Políticas de Envío</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-12">Todo lo que necesitas saber sobre cómo llega tu manga.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: <Truck size={28} className="text-[#2b496d] dark:text-[#5a7a9e]" />,
            title: 'Envíos a todo el Perú',
            desc: 'Realizamos envíos a cualquier departamento del país mediante courier confiable.',
          },
          {
            icon: <Clock size={28} className="text-[#2b496d] dark:text-[#5a7a9e]" />,
            title: '2-5 días hábiles',
            desc: 'Tiempo promedio de entrega desde la confirmación del pago.',
          },
          {
            icon: <MapPin size={28} className="text-[#2b496d] dark:text-[#5a7a9e]" />,
            title: 'Chiclayo y Lima',
            desc: 'Envíos locales en Chiclayo y Lima disponibles con tiempos reducidos.',
          },
          {
            icon: <Package size={28} className="text-[#2b496d] dark:text-[#5a7a9e]" />,
            title: 'Empaque seguro',
            desc: 'Empacamos los mangas cuidadosamente para protegerlos durante el transporte.',
          },
        ].map((card) => (
          <div key={card.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm flex gap-4">
            <div className="flex-shrink-0 mt-1">{card.icon}</div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Costos de envío</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-5 text-left font-semibold text-gray-700 dark:text-gray-300">Destino</th>
                  <th className="py-3 px-5 text-left font-semibold text-gray-700 dark:text-gray-300">Costo</th>
                  <th className="py-3 px-5 text-left font-semibold text-gray-700 dark:text-gray-300">Tiempo estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  { dest: 'Chiclayo (local)', cost: 'S/ 5.00', time: '1-2 días hábiles' },
                  { dest: 'Lima y Callao', cost: 'S/ 15.00', time: '2-3 días hábiles' },
                  { dest: 'Norte del Perú', cost: 'S/ 15.00', time: '3-4 días hábiles' },
                  { dest: 'Sur del Perú', cost: 'S/ 15.00', time: '3-5 días hábiles' },
                  { dest: 'Selva / zonas alejadas', cost: 'S/ 18.00 - 25.00', time: '5-7 días hábiles' },
                ].map((row) => (
                  <tr key={row.dest} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-5 text-gray-900 dark:text-white">{row.dest}</td>
                    <td className="py-3 px-5 font-semibold text-[#2b496d] dark:text-[#5a7a9e]">{row.cost}</td>
                    <td className="py-3 px-5 text-gray-600 dark:text-gray-400">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Proceso de envío</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Realizas tu pedido', desc: 'Coordinas tu pedido por WhatsApp con el detalle de los mangas que deseas.' },
              { step: '2', title: 'Confirmas el pago', desc: 'Realizas el pago por Yape, Plin o transferencia y nos envías el voucher.' },
              { step: '3', title: 'Preparamos tu pedido', desc: 'Verificamos el pago y preparamos tu pedido con embalaje protector.' },
              { step: '4', title: 'Enviamos', desc: 'Entregamos al courier y te compartimos el número de seguimiento.' },
              { step: '5', title: 'Recibes', desc: 'El courier entrega en la dirección indicada. Coordinaremos contigo para garantizar la entrega.' },
            ].map((s) => (
              <li key={s.step} className="flex gap-4">
                <div className="w-9 h-9 bg-[#2b496d] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Importante</h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <li>Los tiempos de entrega son estimados y pueden variar por factores externos.</li>
                <li>NekoMangaCix no se responsabiliza por demoras causadas por la empresa courier.</li>
                <li>Para productos a pedido y preventa, los tiempos son adicionales a los de envío.</li>
                <li>Asegúrate de proporcionar una dirección de entrega correcta y completa.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
