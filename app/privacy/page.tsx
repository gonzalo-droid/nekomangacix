import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '@/components/LegalShell';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de NekoMangaCix.',
};

const SECTIONS = [
  { id: 'responsable',    title: 'Responsable del tratamiento' },
  { id: 'datos',          title: 'Datos que recopilamos' },
  { id: 'finalidad',      title: 'Finalidad del tratamiento' },
  { id: 'base-legal',     title: 'Base legal' },
  { id: 'comparticion',   title: 'Compartición de datos' },
  { id: 'cookies',        title: 'Cookies' },
  { id: 'retencion',      title: 'Retención de datos' },
  { id: 'derechos',       title: 'Tus derechos' },
  { id: 'seguridad',      title: 'Seguridad' },
  { id: 'cambios',        title: 'Cambios en esta política' },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      heroTitle={
        <>
          Política de <span className="text-neko-gradient">privacidad</span>
        </>
      }
      heroSubtitle="Qué datos recopilamos, para qué los usamos y cuáles son tus derechos."
      updatedAt="marzo 2026"
      sections={SECTIONS}
    >
      <LegalSection id="responsable" number="01" title="Responsable del tratamiento">
        <p>
          NekoMangaCix, con domicilio en Chiclayo, Perú, es el responsable del tratamiento de tus datos
          personales. Contacto:{' '}
          <a href="mailto:contacto@nekomangacix.com" className="text-[#ec4899] font-semibold hover:underline">
            contacto@nekomangacix.com
          </a>
        </p>
      </LegalSection>

      <LegalSection id="datos" number="02" title="Datos que recopilamos">
        <p>Recopilamos la siguiente información:</p>
        <ul className="list-disc list-inside space-y-1 ml-1 marker:text-[#ec4899]">
          <li>Nombre completo y datos de contacto (email, teléfono) al realizar un pedido.</li>
          <li>Dirección de entrega para el envío.</li>
          <li>Datos de navegación y uso del sitio (cookies técnicas).</li>
          <li>Información de la cuenta de usuario (si creas una cuenta).</li>
        </ul>
      </LegalSection>

      <LegalSection id="finalidad" number="03" title="Finalidad del tratamiento">
        <p>Usamos tus datos para:</p>
        <ul className="list-disc list-inside space-y-1 ml-1 marker:text-[#06b6d4]">
          <li>Procesar y gestionar tus pedidos.</li>
          <li>Coordinar el envío y la entrega.</li>
          <li>Comunicarnos contigo sobre tu pedido.</li>
          <li>Mejorar nuestros servicios y tu experiencia en el sitio.</li>
          <li>Cumplir obligaciones legales.</li>
        </ul>
      </LegalSection>

      <LegalSection id="base-legal" number="04" title="Base legal">
        <p>
          El tratamiento de tus datos se basa en la ejecución del contrato de compraventa y en el
          consentimiento que otorgas al usar nuestros servicios.
        </p>
      </LegalSection>

      <LegalSection id="comparticion" number="05" title="Compartición de datos">
        <p>No vendemos ni cedemos tus datos a terceros con fines comerciales. Solo compartimos datos con:</p>
        <ul className="list-disc list-inside space-y-1 ml-1 marker:text-[#ec4899]">
          <li>Empresas de courier para la entrega de pedidos.</li>
          <li>Proveedores de servicios técnicos (hosting, emails) bajo acuerdo de confidencialidad.</li>
          <li>Autoridades competentes cuando sea requerido por ley.</li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" number="06" title="Cookies">
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento del sitio (carrito de compras, sesión)
          y cookies analíticas para entender el uso del sitio. Puedes desactivar las cookies no esenciales
          desde la configuración de tu navegador.
        </p>
      </LegalSection>

      <LegalSection id="retencion" number="07" title="Retención de datos">
        <p>
          Conservamos tus datos mientras sea necesario para los fines descritos o mientras la ley lo requiera.
          Los datos de pedidos se conservan por un mínimo de 5 años por motivos contables y legales.
        </p>
      </LegalSection>

      <LegalSection id="derechos" number="08" title="Tus derechos">
        <p>Tienes derecho a:</p>
        <ul className="list-disc list-inside space-y-1 ml-1 marker:text-[#06b6d4]">
          <li>Acceder a tus datos personales.</li>
          <li>Rectificar datos inexactos.</li>
          <li>Solicitar la eliminación de tus datos.</li>
          <li>Oponerte al tratamiento en ciertos casos.</li>
        </ul>
        <p className="mt-3">
          Para ejercer estos derechos, contáctanos en{' '}
          <a href="mailto:contacto@nekomangacix.com" className="text-[#ec4899] font-semibold hover:underline">
            contacto@nekomangacix.com
          </a>.
        </p>
      </LegalSection>

      <LegalSection id="seguridad" number="09" title="Seguridad">
        <p>
          Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no
          autorizado, pérdida o alteración. Sin embargo, ningún sistema es 100% seguro.
        </p>
      </LegalSection>

      <LegalSection id="cambios" number="10" title="Cambios en esta política">
        <p>
          Podemos actualizar esta política. Te notificaremos de cambios significativos por email
          o mediante un aviso destacado en el sitio.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
