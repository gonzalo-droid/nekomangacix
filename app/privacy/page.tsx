import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de NekoMangaCix.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="text-gray-700 dark:text-gray-300 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Última actualización: marzo 2026</p>

      <Section title="1. Responsable del tratamiento">
        <p>
          NekoMangaCix, con domicilio en Chiclayo, Perú, es el responsable del tratamiento de tus datos
          personales. Contacto: <strong>contacto@nekomangacix.com</strong>
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Recopilamos la siguiente información:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Nombre completo y datos de contacto (email, teléfono) al realizar un pedido</li>
          <li>Dirección de entrega para el envío</li>
          <li>Datos de navegación y uso del sitio (cookies técnicas)</li>
          <li>Información de la cuenta de usuario (si creas una cuenta)</li>
        </ul>
      </Section>

      <Section title="3. Finalidad del tratamiento">
        <p>Usamos tus datos para:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Procesar y gestionar tus pedidos</li>
          <li>Coordinar el envío y la entrega</li>
          <li>Comunicarnos contigo sobre tu pedido</li>
          <li>Mejorar nuestros servicios y la experiencia en el sitio</li>
          <li>Cumplir obligaciones legales</li>
        </ul>
      </Section>

      <Section title="4. Base legal">
        <p>
          El tratamiento de tus datos se basa en la ejecución del contrato de compraventa y en el
          consentimiento que otorgas al usar nuestros servicios.
        </p>
      </Section>

      <Section title="5. Compartición de datos">
        <p>
          No vendemos ni cedemos tus datos a terceros con fines comerciales. Solo compartimos datos con:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Empresas de courier para la entrega de pedidos</li>
          <li>Proveedores de servicios técnicos (hosting, emails) bajo acuerdo de confidencialidad</li>
          <li>Autoridades competentes cuando sea requerido por ley</li>
        </ul>
      </Section>

      <Section title="6. Cookies">
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento del sitio (carrito de compras, sesión)
          y cookies analíticas para entender el uso del sitio. Puedes desactivar las cookies no esenciales
          desde la configuración de tu navegador.
        </p>
      </Section>

      <Section title="7. Retención de datos">
        <p>
          Conservamos tus datos mientras sea necesario para los fines descritos o mientras la ley lo requiera.
          Los datos de pedidos se conservan por un mínimo de 5 años por motivos contables y legales.
        </p>
      </Section>

      <Section title="8. Tus derechos">
        <p>Tienes derecho a:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Acceder a tus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la eliminación de tus datos</li>
          <li>Oponerte al tratamiento en ciertos casos</li>
        </ul>
        <p className="mt-2">Para ejercer estos derechos, contáctanos en <strong>contacto@nekomangacix.com</strong>.</p>
      </Section>

      <Section title="9. Seguridad">
        <p>
          Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no
          autorizado, pérdida o alteración. Sin embargo, ningún sistema es 100% seguro.
        </p>
      </Section>

      <Section title="10. Cambios en esta política">
        <p>
          Podemos actualizar esta política. Te notificaremos de cambios significativos por email
          o mediante un aviso destacado en el sitio.
        </p>
      </Section>
    </div>
  );
}
