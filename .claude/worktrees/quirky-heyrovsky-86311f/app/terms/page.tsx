import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '@/components/LegalShell';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de NekoMangaCix, tu tienda de manga online en Perú.',
};

const SECTIONS = [
  { id: 'aceptacion',     title: 'Aceptación de términos' },
  { id: 'servicio',       title: 'Descripción del servicio' },
  { id: 'precios',        title: 'Precios y pagos' },
  { id: 'stock',          title: 'Disponibilidad y stock' },
  { id: 'envios',         title: 'Envíos' },
  { id: 'devoluciones',   title: 'Devoluciones' },
  { id: 'propiedad',      title: 'Propiedad intelectual' },
  { id: 'responsabilidad', title: 'Limitación de responsabilidad' },
  { id: 'modificaciones', title: 'Modificaciones' },
  { id: 'contacto',       title: 'Contacto' },
];

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      heroTitle={
        <>
          Términos y <span className="text-neko-gradient">condiciones</span>
        </>
      }
      heroSubtitle="Las reglas del juego para comprar en NekoMangaCix."
      updatedAt="marzo 2026"
      sections={SECTIONS}
    >
      <LegalSection id="aceptacion" number="01" title="Aceptación de términos">
        <p>
          Al acceder y usar el sitio web de NekoMangaCix (<strong>nekomangacix.com</strong>), aceptas estos
          Términos y Condiciones. Si no estás de acuerdo, abstente de usar nuestros servicios.
        </p>
      </LegalSection>

      <LegalSection id="servicio" number="02" title="Descripción del servicio">
        <p>
          NekoMangaCix es una tienda de manga online con sede en Chiclayo, Perú. Ofrecemos mangas de
          editoriales de Argentina, México y España, con envíos a nivel nacional. Las ventas se coordinan
          por WhatsApp y el pago se realiza por transferencia bancaria, Yape o Plin.
        </p>
      </LegalSection>

      <LegalSection id="precios" number="03" title="Precios y pagos">
        <p>Todos los precios están expresados en Soles peruanos (S/) e incluyen impuestos.</p>
        <p>Los precios pueden cambiar sin previo aviso. Se cobra el precio vigente al momento del pedido.</p>
        <p>Métodos de pago aceptados: Yape, Plin, transferencia bancaria BCP.</p>
        <p>El pago debe realizarse antes del envío del pedido.</p>
      </LegalSection>

      <LegalSection id="stock" number="04" title="Disponibilidad y stock">
        <p>
          El stock mostrado es referencial. En caso de agotarse un producto luego de recibir tu pedido,
          te contactaremos para ofrecerte alternativas o proceder con el reembolso.
        </p>
        <p>
          Los productos a pedido (on demand) tienen un tiempo de espera estimado de 2–3 semanas.
          Las preventas requieren un pago adelantado y la fecha de llegada es estimada.
        </p>
      </LegalSection>

      <LegalSection id="envios" number="05" title="Envíos">
        <p>Realizamos envíos a todo el territorio peruano mediante servicios de courier.</p>
        <p>El costo de envío es de S/ 15.00 a nivel nacional (sujeto a cambios según destino).</p>
        <p>El tiempo de entrega es de 2 a 5 días hábiles desde la confirmación del pago.</p>
        <p>NekoMangaCix no se responsabiliza por retrasos causados por la empresa de courier.</p>
      </LegalSection>

      <LegalSection id="devoluciones" number="06" title="Devoluciones">
        <p>Aceptamos devoluciones dentro de los 7 días calendario desde la recepción del producto.</p>
        <p>El producto debe estar en perfectas condiciones, sin usar y con el embalaje original.</p>
        <p>El cliente asume el costo de devolución. El reembolso se procesa en 48–72 horas hábiles.</p>
        <p>No se aceptan devoluciones de productos en preventa una vez confirmado el pedido.</p>
      </LegalSection>

      <LegalSection id="propiedad" number="07" title="Propiedad intelectual">
        <p>
          Todo el contenido de este sitio (imágenes, textos, logos) es propiedad de NekoMangaCix o de sus
          respectivos titulares y está protegido por las leyes de propiedad intelectual. Queda prohibida
          su reproducción sin autorización expresa.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" number="08" title="Limitación de responsabilidad">
        <p>
          NekoMangaCix no será responsable por daños indirectos, incidentales o consecuentes derivados
          del uso de nuestros productos o servicios.
        </p>
      </LegalSection>

      <LegalSection id="modificaciones" number="09" title="Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran
          en vigor desde su publicación en este sitio.
        </p>
      </LegalSection>

      <LegalSection id="contacto" number="10" title="Contacto">
        <p>
          Para consultas sobre estos términos, contáctanos en{' '}
          <a href="mailto:contacto@nekomangacix.com" className="text-[#ec4899] font-semibold hover:underline">
            contacto@nekomangacix.com
          </a>{' '}
          o por WhatsApp al{' '}
          <a href="https://wa.me/51924262747" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold hover:underline">
            (+51) 924 262 747
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
