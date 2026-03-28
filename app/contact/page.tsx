'use client';

import { useState } from 'react';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!formData.email.trim()) e.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email no válido';
    if (!formData.asunto.trim()) e.asunto = 'El asunto es requerido';
    if (!formData.mensaje.trim()) e.mensaje = 'El mensaje es requerido';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error desconocido');
      }

      setStatus('success');
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b496d] transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
      errors[field] ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 bg-white'
    }`;

  return (
    <div className="w-full">
      <section className="bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contacto</h1>
          <p className="text-lg md:text-xl text-blue-100">¿Tienes dudas o sugerencias? Nos encanta escucharte.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Info */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Información</h2>
            <div className="space-y-4">
              <a
                href="https://wa.me/51924262747"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 dark:hover:bg-green-900/10 transition-all"
              >
                <MessageCircle size={28} className="text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">(+51) 924 262 747</p>
                  <p className="text-xs text-gray-500 mt-1">Disponible todos los días</p>
                </div>
              </a>

              <div className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <Mail size={28} className="text-[#2b496d] dark:text-[#5a7a9e] flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">contacto@nekomangacix.com</p>
                  <p className="text-xs text-gray-500 mt-1">Respuesta en 24h</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <MapPin size={28} className="text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Ubicación</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Chiclayo, Perú</p>
                  <p className="text-xs text-gray-500 mt-1">Envíos a nivel nacional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Envíanos un Mensaje</h2>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-400">Mensaje enviado</p>
                    <p className="text-green-800 dark:text-green-300 text-sm">Nos pondremos en contacto pronto.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-400 text-sm">
                    Hubo un error al enviar el mensaje. Contáctanos directamente por WhatsApp.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-1">Nombre *</label>
                    <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" className={inputClass('nombre')} />
                    {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-1">Email *</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" className={inputClass('email')} />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-1">Asunto *</label>
                  <input id="asunto" name="asunto" type="text" value={formData.asunto} onChange={handleChange} placeholder="Asunto de tu consulta" className={inputClass('asunto')} />
                  {errors.asunto && <p className="text-red-600 text-xs mt-1">{errors.asunto}</p>}
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-900 dark:text-gray-300 mb-1">Mensaje *</label>
                  <textarea id="mensaje" name="mensaje" rows={5} value={formData.mensaje} onChange={handleChange} placeholder="Cuéntanos lo que necesitas..." className={`${inputClass('mensaje')} resize-none`} />
                  {errors.mensaje && <p className="text-red-600 text-xs mt-1">{errors.mensaje}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#2b496d] text-white font-bold py-3 rounded-lg hover:bg-[#1e3550] disabled:opacity-60 transition-colors"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-r from-[#e8eef4] to-[#f0f4f8] dark:from-gray-800 dark:to-gray-900 rounded-xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: '¿Cuánto tiempo demora el envío?', a: 'En promedio 2-5 días hábiles a nivel nacional. Coordinaremos contigo por WhatsApp.' },
              { q: '¿Puedo devolver mi compra?', a: 'Sí, aceptamos devoluciones de productos en perfecto estado dentro de 7 días de la compra.' },
              { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos Yape, Plin y transferencia bancaria BCP. Siempre coordinamos antes del envío.' },
              { q: '¿Tienen promociones especiales?', a: 'Sí, ofrecemos promociones regulares. Contáctanos por WhatsApp para conocer las ofertas vigentes.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
