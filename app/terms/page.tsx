import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de NekoMangaCix, tu tienda de manga online en Perú.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="text-gray-700 dark:text-gray-300 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Última actualización: marzo 2026</p>

      <Section title="1. Aceptación de términos">
        <p>
          Al acceder y usar el sitio web de NekoMangaCix (<strong>nekomangacix.com</strong>), aceptas estos
          Términos y Condiciones. Si no estás de acuerdo, abstente de usar nuestros servicios.
        </p>
      </Section>

      <Section title="2. Descripción del servicio">
        <p>
          NekoMangaCix es una tienda de manga online con sede en Chiclayo, Perú. Ofrecemos mangas de
          editoriales de Argentina y México, con envíos a nivel nacional. Las ventas se coordinan
          directamente por WhatsApp y el pago se realiza por transferencia bancaria, Yape o Plin.
        </p>
      </Section>

      <Section title="3. Precios y pagos">
        <p>Todos los precios están expresados en Soles peruanos (S/) e incluyen impuestos.</p>
        <p>Los precios pueden cambiar sin previo aviso. Se cobra el precio vigente al momento del pedido.</p>
        <p>Métodos de pago aceptados: Yape, Plin, transferencia bancaria BCP.</p>
        <p>El pago debe realizarse antes del envío del pedido.</p>
      </Section>

      <Section title="4. Disponibilidad y stock">
        <p>
          El stock mostrado es referencial. En caso de agotarse un producto luego de recibir tu pedido,
          te contactaremos para ofrecerte alternativas o proceder con el reembolso.
        </p>
        <p>
          Los productos a pedido (on demand) tienen un tiempo de espera estimado de 2-3 semanas.
          Las preventas requieren un pago adelantado y la fecha de llegada es estimada.
        </p>
      </Section>

      <Section title="5. Envíos">
        <p>Realizamos envíos a todo el territorio peruano mediante servicios de courier.</p>
        <p>El costo de envío es de S/ 15.00 a nivel nacional (sujeto a cambios según destino).</p>
        <p>El tiempo de entrega es de 2 a 5 días hábiles desde la confirmación del pago.</p>
        <p>NekoMangaCix no se responsabiliza por retrasos causados por la empresa de courier.</p>
      </Section>

      <Section title="6. Devoluciones">
        <p>Aceptamos devoluciones dentro de los 7 días calendario desde la recepción del producto.</p>
        <p>El producto debe estar en perfectas condiciones, sin usar y con el embalaje original.</p>
        <p>El cliente asume el costo de devolución. El reembolso se procesa en 48-72 horas hábiles.</p>
        <p>No se aceptan devoluciones de productos en preventa una vez confirmado el pedido.</p>
      </Section>

      <Section title="7. Propiedad intelectual">
        <p>
          Todo el contenido de este sitio (imágenes, textos, logos) es propiedad de NekoMangaCix o de sus
          respectivos titulares y está protegido por las leyes de propiedad intelectual. Queda prohibida
          su reproducción sin autorización expresa.
        </p>
      </Section>

      <Section title="8. Limitación de responsabilidad">
        <p>
          NekoMangaCix no será responsable por daños indirectos, incidentales o consecuentes derivados
          del uso de nuestros productos o servicios.
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran
          en vigor desde su publicación en este sitio.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>Para consultas sobre estos términos, contáctanos en <strong>contacto@nekomangacix.com</strong> o por WhatsApp al <strong>(+51) 924 262 747</strong>.</p>
      </Section>
    </div>
  );
}
