'use client';

import { useState } from 'react';
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validaciones
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    }
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular envío exitoso
    setSubmitted(true);
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: '',
    });

    // Resetear mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contacto</h1>
          <p className="text-lg md:text-xl text-blue-100">
            ¿Tienes dudas o sugerencias? Nos encanta escucharte.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de Contacto</h2>

            <div className="space-y-6">
              {/* WhatsApp */}
              <a
                href="https://wa.me/51924462641"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-green-50 transition-all"
              >
                <div className="text-3xl text-green-500">
                  <MessageCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">WhatsApp</h3>
                  <p className="text-gray-600">+51 924 462 641</p>
                  <p className="text-sm text-gray-500 mt-2">Disponible 24/7</p>
                </div>
              </a>

              {/* Email */}
              <div className="flex gap-4 p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl text-[#2b496d]">
                  <Mail size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Email</h3>
                  <p className="text-gray-600">contacto@nekomangacix.com</p>
                  <p className="text-sm text-gray-500 mt-2">Respuesta en 24 horas</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4 p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl text-red-600">
                  <MapPin size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ubicación</h3>
                  <p className="text-gray-600">Chiclayo, Perú</p>
                  <p className="text-sm text-gray-500 mt-2">Envíos a nivel nacional</p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex gap-4 p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl">🕐</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Horario</h3>
                  <p className="text-gray-600">Lunes a Domingo</p>
                  <p className="text-sm text-gray-500 mt-2">Siempre disponibles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Envíanos un Mensaje</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-900">Mensaje enviado exitosamente</p>
                    <p className="text-green-800 text-sm">
                      Gracias por tu mensaje. Nos pondremos en contacto pronto.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b496d] transition-colors ${
                      errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                    aria-invalid={!!errors.nombre}
                    aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                  />
                  {errors.nombre && (
                    <p id="nombre-error" className="text-red-600 text-sm mt-1">
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b496d] transition-colors ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-600 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Asunto */}
                <div>
                  <label
                    htmlFor="asunto"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b496d] transition-colors ${
                      errors.asunto ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Asunto de tu consulta"
                    aria-invalid={!!errors.asunto}
                    aria-describedby={errors.asunto ? 'asunto-error' : undefined}
                  />
                  {errors.asunto && (
                    <p id="asunto-error" className="text-red-600 text-sm mt-1">
                      {errors.asunto}
                    </p>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="mensaje"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b496d] transition-colors resize-none ${
                      errors.mensaje ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Cuéntanos lo que necesitas..."
                    aria-invalid={!!errors.mensaje}
                    aria-describedby={errors.mensaje ? 'mensaje-error' : undefined}
                  />
                  {errors.mensaje && (
                    <p id="mensaje-error" className="text-red-600 text-sm mt-1">
                      {errors.mensaje}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#2b496d] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#1e3550] transition-colors active:scale-95 transform"
                >
                  Enviar Mensaje
                </button>

                <p className="text-sm text-gray-500 text-center">
                  También puedes contactarnos por WhatsApp para una respuesta más rápida.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-[#e8eef4] to-[#f0f4f8] rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">¿Cuánto tiempo demora el envío?</h3>
              <p className="text-gray-600">
                El tiempo de envío varía según tu ubicación. En promedio, enviamos dentro de 2-5 días útiles a nivel nacional.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">¿Puedo devolver mi compra?</h3>
              <p className="text-gray-600">
                Sí, aceptamos devoluciones de productos en perfecto estado dentro de 7 días de la compra.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos transferencias bancarias, depósitos en cuenta y pago contra entrega según disponibilidad.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                ¿Tienen promociones especiales?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos promociones regulares. Contacta por WhatsApp para conocer las ofertas vigentes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
