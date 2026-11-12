import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import LegalShell, { LegalSection } from '@/components/LegalShell';
import {
  DELIVERY_DAYS,
  DEPOSIT_PERCENT,
  FREE_SHIPPING_FROM,
  PICKUP_TEXT,
  PICKUP_WINDOW_WEEKS,
  REFUND_TIME,
  RETURN_DAYS,
  SELLOUT_TEXT,
  arrivalTimesText,
} from '@/lib/content/policies';
import { getAvailableCountries } from '@/lib/domain/products/availability';

export const metadata: Metadata = pageMetadata({
  title: 'Términos y condiciones',
  description:
    'Términos y condiciones de uso de Neko Manga Cix, tu tienda de manga online en Perú.',
  path: '/terms',
});

const SECTIONS = [
  { id: 'aceptacion',     title: 'Aceptación de términos' },
  { id: 'servicio',       title: 'Descripción del servicio' },
  { id: 'precios',        title: 'Precios y pagos' },
  { id: 'stock',          title: 'Disponibilidad y stock' },
  { id: 'preventas',      title: 'Preventas' },
  { id: 'envios',         title: 'Envíos y recojo' },
  { id: 'devoluciones',   title: 'Devoluciones' },
  { id: 'propiedad',      title: 'Propiedad intelectual' },
  { id: 'responsabilidad', title: 'Limitación de responsabilidad' },
  { id: 'modificaciones', title: 'Modificaciones' },
  { id: 'contacto',       title: 'Contacto' },
];

export default async function TermsPage() {
  const arrivals = arrivalTimesText(await getAvailableCountries());

  return (
    <LegalShell
      eyebrow="Legal"
      heroTitle={
        <>
          Términos y <span className="text-neko-gradient">condiciones</span>
        </>
      }
      heroSubtitle="Las reglas del juego para comprar en NekoMangaCix."
      updatedAt="noviembre 2026"
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
          editoriales oficiales en español y coleccionables originales, con envíos a nivel nacional y una tienda física en
          Chiclayo. Los pedidos se registran en este sitio, se confirman por WhatsApp y se pagan por transferencia bancaria,
          Yape o Plin.
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
          El stock mostrado es referencial. Si un producto se agota después de recibir tu pedido, te
          contactamos para ofrecerte alternativas o el reembolso.
        </p>
      </LegalSection>

      <LegalSection id="preventas" number="05" title="Preventas">
        <p>
          Una preventa se separa pagando el {DEPOSIT_PERCENT} % del valor del tomo; el saldo se paga cuando llega.
          Las ediciones limitadas pueden requerir otro monto.
        </p>
        <p>Tiempos estimados desde el cierre de la preventa: {arrivals}.</p>
        <p>
          El pedido depende de la disponibilidad de la editorial. Si un tomo se agota, puedes elegir {SELLOUT_TEXT}.
        </p>
        <p>
          Cuando el pedido llega tienes {PICKUP_WINDOW_WEEKS} semanas para coordinar su recojo o envío. Pasado ese plazo,
          el monto separado queda como saldo a favor para otra compra.
        </p>
      </LegalSection>

      <LegalSection id="envios" number="06" title="Envíos y recojo">
        <p>Realizamos envíos a todo el territorio peruano mediante servicios de courier.</p>
        <p>
          El costo depende del destino (ver la tabla en{' '}
          <Link href="/shipping" className="text-neko-magenta-ink font-semibold hover:underline">Políticas de envío</Link>)
          y es gratis desde S/ {FREE_SHIPPING_FROM} de compra.
        </p>
        <p>El tiempo de entrega es de {DELIVERY_DAYS} desde la confirmación del pago, según el destino.</p>
        <p>{PICKUP_TEXT}.</p>
        <p>NekoMangaCix no se responsabiliza por retrasos causados por la empresa de courier.</p>
      </LegalSection>

      <LegalSection id="devoluciones" number="07" title="Devoluciones">
        <p>Aceptamos devoluciones dentro de los {RETURN_DAYS} días calendario desde la recepción del producto.</p>
        <p>El producto debe estar en perfectas condiciones, sin usar y con el embalaje original.</p>
        <p>El cliente asume el costo de devolución. El reembolso se procesa en {REFUND_TIME}.</p>
        <p>
          Las preventas no se devuelven una vez confirmado el pedido, salvo que la editorial agote el tomo
          (ver Preventas).
        </p>
      </LegalSection>

      <LegalSection id="propiedad" number="08" title="Propiedad intelectual">
        <p>
          Todo el contenido de este sitio (imágenes, textos, logos) es propiedad de NekoMangaCix o de sus
          respectivos titulares y está protegido por las leyes de propiedad intelectual. Queda prohibida
          su reproducción sin autorización expresa.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" number="09" title="Limitación de responsabilidad">
        <p>
          NekoMangaCix no será responsable por daños indirectos, incidentales o consecuentes derivados
          del uso de nuestros productos o servicios.
        </p>
      </LegalSection>

      <LegalSection id="modificaciones" number="10" title="Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran
          en vigor desde su publicación en este sitio.
        </p>
      </LegalSection>

      <LegalSection id="contacto" number="11" title="Contacto">
        <p>
          Para consultas sobre estos términos, contáctanos en{' '}
          <a href="mailto:contacto@nekomangacix.com" className="text-neko-magenta-ink font-semibold hover:underline">
            contacto@nekomangacix.com
          </a>{' '}
          o por WhatsApp al{' '}
          <a href="https://wa.me/51924462641" target="_blank" rel="noopener noreferrer" className="text-neko-green-ink font-semibold hover:underline">
            (+51) 924 462 641
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
