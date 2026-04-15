'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { Mail, MessageCircle, MapPin, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';

const FAQS = [
  {
    q: '¿Cuánto tiempo demora el envío?',
    a: 'En promedio 2–5 días hábiles a nivel nacional vía Olva/Shalom. Coordinamos contigo por WhatsApp antes de despachar.',
  },
  {
    q: '¿Puedo devolver mi compra?',
    a: 'Aceptamos devoluciones de productos en perfecto estado dentro de 7 días desde la recepción.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Yape, Plin y transferencia bancaria (BCP). También efectivo al recoger. Siempre confirmamos antes del envío.',
  },
  {
    q: '¿Tienen promociones?',
    a: 'Lanzamos ofertas regulares y preventas con descuento. Escríbenos por WhatsApp para conocer las vigentes.',
  },
];

const CHANNELS = [
  {
    Icon: MessageCircle,
    title: 'WhatsApp',
    detail: '(+51) 924 262 747',
    sub: 'Disponible todos los días',
    href: 'https://wa.me/51924262747',
    accent: 'text-[#25D366]',
    bg: 'bg-[#25D366]/10',
    ring: 'ring-[#25D366]/20',
  },
  {
    Icon: Mail,
    title: 'Email',
    detail: 'contacto@nekomangacix.com',
    sub: 'Respuesta en 24 h',
    href: 'mailto:contacto@nekomangacix.com',
    accent: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10',
    ring: 'ring-[#06b6d4]/20',
  },
  {
    Icon: MapPin,
    title: 'Ubicación',
    detail: 'Chiclayo, Perú',
    sub: 'Envíos a nivel nacional',
    href: null,
    accent: 'text-[#ec4899]',
    bg: 'bg-[#ec4899]/10',
    ring: 'ring-[#ec4899]/20',
  },
];

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
      if (!res.ok) throw new Error('Error al enviar');
      setStatus('success');
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 ${
      errors[field]
        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-white/10 focus:border-[#06b6d4]'
    }`;

  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

  return (
    <div className="w-full">
      <PageHero
        eyebrow="Contacto"
        title={
          <>
            Hablemos de{' '}
            <span className="text-neko-gradient">manga</span>.
          </>
        }
        subtitle="Pregunta, sugiere o pide una recomendación — respondemos a todos los mensajes."
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10">
        {/* Canales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNELS.map(({ Icon, title, detail, sub, href, accent, bg, ring }) => {
            const content = (
              <div
                className={`h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-5 transition-all ring-1 ${ring} ${
                  href ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : ''
                }`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} ${accent} mb-3`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{detail}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={12} /> {sub}
                </p>
              </div>
            );
            return href ? (
              <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={title}>{content}</div>
            );
          })}
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 relative">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-1.5">
                  {'// Formulario'}
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Envíanos un mensaje
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Te respondemos al email en un máximo de 24 horas.
                </p>
              </div>

              {status === 'success' && (
                <div
                  className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex gap-3 animate-tilt-in"
                  role="status"
                >
                  <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                      Mensaje enviado correctamente
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                      Te responderemos pronto. Gracias.
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div
                  className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3"
                  role="alert"
                >
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-300 text-sm">
                      Ocurrió un error
                    </p>
                    <p className="text-red-700 dark:text-red-400 text-xs mt-0.5">
                      Contáctanos directamente por WhatsApp mientras lo resolvemos.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nombre" className={labelClass}>Nombre *</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className={inputClass('nombre')}
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="asunto" className={labelClass}>Asunto *</label>
                  <input
                    id="asunto"
                    name="asunto"
                    type="text"
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="¿Sobre qué nos escribes?"
                    className={inputClass('asunto')}
                  />
                  {errors.asunto && <p className="text-red-500 text-xs mt-1">{errors.asunto}</p>}
                </div>

                <div>
                  <label htmlFor="mensaje" className={labelClass}>Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos en detalle..."
                    className={`${inputClass('mensaje')} resize-none`}
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-lg shadow-[#ec4899]/25 hover:shadow-[#ec4899]/45 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 transition-all"
                >
                  <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                  {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* WhatsApp bloque destacado */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#1e3550] to-[#0a0a0f] text-white p-6">
              <div className="absolute inset-0 bg-halftone opacity-40 pointer-events-none" aria-hidden="true" />
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#25D366] opacity-25 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <h3 className="text-lg font-extrabold mb-1">¿Apurado?</h3>
                <p className="text-sm text-white/75 mb-4">
                  Escríbenos por WhatsApp y te respondemos en minutos.
                </p>
                <a
                  href="https://wa.me/51924262747?text=Hola%20Neko%20Manga%20Cix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-sm transition-all active:scale-95"
                >
                  <MessageCircle size={16} /> Abrir WhatsApp
                </a>
              </div>
            </div>

            {/* Horario */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#06b6d4]" />
                Horario de atención
              </h3>
              <dl className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                <div className="flex justify-between">
                  <dt>Lun — Vie</dt><dd className="font-medium text-gray-900 dark:text-white">9:00 — 20:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sábado</dt><dd className="font-medium text-gray-900 dark:text-white">10:00 — 18:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Domingo</dt><dd className="font-medium text-gray-900 dark:text-white">11:00 — 16:00</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8 relative">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-2">
            {'// Preguntas frecuentes'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Dudas rápidas
          </h2>
          <span
            className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
            aria-hidden="true"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 hover:border-[#ec4899]/40 transition-all"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-[#ec4899] transition-colors">
                {q}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿No encuentras tu respuesta?{' '}
          <Link href="/faq" className="text-[#ec4899] font-semibold hover:underline">
            Ver FAQ completa
          </Link>
        </p>
      </section>
    </div>
  );
}
