'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from '@/lib/constants/productTypes';
import { COUNTRY_CODES, COUNTRIES } from '@/lib/constants/countries';
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS } from '@/lib/constants/demographics';
import { EDITORIALS_BY_COUNTRY } from '@/lib/constants/editorials';

/* ── helpers ── */
function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'pink' | 'amber' | 'gray' | 'navy' }) {
  const cls = {
    blue:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    pink:  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    gray:  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    navy:  'bg-[#2b496d]/10 text-[#2b496d] dark:bg-[#5a7a9e]/20 dark:text-[#5a7a9e]',
  }[color];
  return <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${cls}`}>{children}</span>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-[11px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{children}</code>;
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <span className="font-bold text-gray-900 dark:text-white text-sm">{title}</span>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">{children}</div>}
    </div>
  );
}

function FieldRow({ field, type, required, values, note }: {
  field: string; type: string; required?: boolean; values?: React.ReactNode; note?: React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <td className="py-2.5 pr-4 align-top">
        <Code>{field}</Code>
        {required && <span className="ml-1 text-[10px] text-red-500 font-bold">*</span>}
      </td>
      <td className="py-2.5 pr-4 align-top text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{type}</td>
      <td className="py-2.5 pr-4 align-top text-xs">{values}</td>
      <td className="py-2.5 align-top text-xs text-gray-500 dark:text-gray-400">{note}</td>
    </tr>
  );
}

/* ── main ── */
export default function LegendView() {
  return (
    <div className="space-y-4 max-w-5xl">

      <div className="bg-[#2b496d]/5 dark:bg-[#5a7a9e]/10 border border-[#2b496d]/20 dark:border-[#5a7a9e]/20 rounded-xl px-5 py-4">
        <p className="text-sm text-[#2b496d] dark:text-[#5a7a9e]">
          Esta vista es solo referencia. Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios al crear un producto.
        </p>
      </div>

      {/* PRODUCTO */}
      <Section title="📦 Producto — campos principales" defaultOpen>
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              <th className="text-left pb-2 pr-4">Campo</th>
              <th className="text-left pb-2 pr-4">Tipo</th>
              <th className="text-left pb-2 pr-4">Valores posibles</th>
              <th className="text-left pb-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            <FieldRow field="title" type="texto" required values={<span className="text-gray-600 dark:text-gray-300">libre</span>} note="Nombre completo del producto" />
            <FieldRow field="type" type="enum" required values={
              <div className="flex flex-wrap gap-1">
                {PRODUCT_TYPES.map((t) => <Badge key={t} color="navy">{t}</Badge>)}
              </div>
            } note={
              <span>{Object.entries(PRODUCT_TYPE_LABELS).map(([k, v]) => `${k} → ${v}`).join(' · ')}</span>
            } />
            <FieldRow field="sku" type="texto" required values={<Badge color="gray">NCM-XXX-XXXX</Badge>} note="Generado automáticamente. Editable." />
            <FieldRow field="editorial" type="texto" required values={<span className="text-gray-500 text-xs">ver sección Editoriales</span>} note="Debe coincidir con el country_code" />
            <FieldRow field="country_code" type="enum" required values={
              <div className="flex flex-wrap gap-1">
                {COUNTRY_CODES.map((c) => <Badge key={c} color="blue">{c}</Badge>)}
              </div>
            } note={COUNTRY_CODES.map((c) => `${c} → ${COUNTRIES[c].flag} ${COUNTRIES[c].name}`).join(' · ')} />
            <FieldRow field="price_pen" type="decimal" required values={<span className="text-gray-600 dark:text-gray-300">ej: <Code>45.90</Code></span>} note="Precio en soles peruanos" />
            <FieldRow field="stock" type="entero" required values={<span className="text-gray-600 dark:text-gray-300"><Code>0</Code> o más</span>} note="" />
            <FieldRow field="stock_status" type="enum" required values={
              <div className="flex flex-wrap gap-1">
                <Badge color="green">in_stock</Badge>
                <Badge color="blue">preorder</Badge>
                <Badge color="gray">out_of_stock</Badge>
              </div>
            } note="in_stock=disponible · preorder=preventa · out_of_stock=agotado" />
            <FieldRow field="is_active" type="boolean" required values={<><Badge color="green">true</Badge> <Badge color="gray">false</Badge></>} note="false oculta el producto de la tienda" />
          </tbody>
        </table>
      </Section>

      {/* CAMPOS OPCIONALES */}
      <Section title="📝 Producto — campos opcionales">
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              <th className="text-left pb-2 pr-4">Campo</th>
              <th className="text-left pb-2 pr-4">Tipo</th>
              <th className="text-left pb-2 pr-4">Valores posibles</th>
              <th className="text-left pb-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            <FieldRow field="author" type="texto" values={<span className="text-gray-500">libre</span>} note="Autor/mangaka" />
            <FieldRow field="description" type="texto largo" values={<span className="text-gray-500">libre</span>} note="Descripción corta para tarjetas" />
            <FieldRow field="full_description" type="texto largo" values={<span className="text-gray-500">libre</span>} note="Descripción completa en detalle del producto" />
            <FieldRow field="tags" type="array texto" values={<span className="text-gray-500">ej: <Code>["nuevo","oferta"]</Code></span>} note="El primer tag aparece en badge de la tarjeta" />
            <FieldRow field="images" type="array texto" values={<span className="text-gray-500">IDs de Cloudinary o URLs</span>} note="Primera imagen = portada. Resto en galería." />
            <FieldRow field="demographic" type="enum" values={
              <div className="flex flex-wrap gap-1">
                {DEMOGRAPHICS.map((d) => <Badge key={d} color="pink">{d}</Badge>)}
              </div>
            } note={DEMOGRAPHICS.map((d) => `${d} → ${DEMOGRAPHIC_LABELS[d]}`).join(' · ')} />
            <FieldRow field="series" type="texto" values={<span className="text-gray-500">Nombre de la serie. Ej: <Code>Jujutsu Kaisen</Code></span>} note="Vincular desde tab Series es preferible" />
            <FieldRow field="series_id" type="uuid" values={<span className="text-gray-500">ID de la serie</span>} note="Se asigna al vincular desde tab Series" />
            <FieldRow field="series_status" type="enum" values={
              <div className="flex flex-wrap gap-1">
                <Badge color="blue">ongoing</Badge>
                <Badge color="green">completed</Badge>
                <Badge color="gray">single</Badge>
              </div>
            } note="ongoing=en curso · completed=completa · single=tomo único" />
            <FieldRow field="volume_number" type="entero" values={<span className="text-gray-500"><Code>1</Code>, <Code>2</Code>, <Code>3</Code>…</span>} note="Número de tomo dentro de la serie" />
            <FieldRow field="estimated_arrival" type="texto" values={<span className="text-gray-500">ej: <Code>Marzo 2025</Code></span>} note="Fecha estimada de llegada (preventa)" />
            <FieldRow field="eta_text" type="texto" values={<span className="text-gray-500">ej: <Code>Llega en 3 semanas</Code></span>} note="Texto libre de ETA, se muestra en detalle" />
            <FieldRow field="preorder_deposit" type="decimal" values={<span className="text-gray-500">ej: <Code>22.50</Code></span>} note="Monto de depósito para preventa. Si vacío, se calcula 50%" />
          </tbody>
        </table>
      </Section>

      {/* ATTRIBUTES */}
      <Section title="🗂 Atributos flexibles (attributes)">
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 mb-4">
          Campo JSON libre. Cualquier clave-valor. Se muestra en la ficha del producto como tabla de especificaciones. No hay valores obligatorios.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'volume', example: '1', desc: 'Número de volumen (alternativa a volume_number)' },
            { key: 'language', example: '"es" o "jp"', desc: 'Idioma del producto' },
            { key: 'pages', example: '192', desc: 'Número de páginas' },
            { key: 'format', example: '"tapa blanda"', desc: 'Formato físico' },
            { key: 'isbn', example: '"978-950-..."', desc: 'ISBN del libro' },
            { key: 'dimensions', example: '"13.5 x 19 cm"', desc: 'Dimensiones físicas' },
            { key: 'weight', example: '"200g"', desc: 'Peso del producto' },
            { key: 'figure_scale', example: '"1/7"', desc: 'Escala de figura coleccionable' },
            { key: 'manufacturer', example: '"Good Smile"', desc: 'Fabricante (figuras)' },
            { key: 'category', example: '"shonen"', desc: 'Categoría legacy (si aplica)' },
            { key: 'release_date', example: '"2024-11"', desc: 'Fecha de lanzamiento original' },
          ].map(({ key, example, desc }) => (
            <div key={key} className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <Code>{key}</Code>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">ej: <span className="font-mono">{example}</span></p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Puedes agregar cualquier otro atributo personalizado desde el formulario de edición → sección "Atributos".
        </p>
      </Section>

      {/* STOCK STATUS */}
      <Section title="📊 Estados de stock">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {[
            { value: 'in_stock', label: 'En Stock', color: 'green' as const, desc: 'Producto disponible para compra inmediata. El stock debe ser mayor a 0.' },
            { value: 'preorder', label: 'Preventa', color: 'blue' as const, desc: 'Producto en camino o por encargar. Se muestra fecha de llegada y opción de reserva con depósito.' },
            { value: 'out_of_stock', label: 'Agotado', color: 'gray' as const, desc: 'Sin stock. Se puede seguir mostrando para que el cliente solicite aviso de restock.' },
          ].map(({ value, label, color, desc }) => (
            <div key={value} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <Badge color={color}>{value}</Badge>
              <p className="font-semibold text-sm text-gray-900 dark:text-white mt-2">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* EDITORIALES */}
      <Section title="🏢 Editoriales por país">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {COUNTRY_CODES.map((code) => (
            <div key={code} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                {COUNTRIES[code].flag} {COUNTRIES[code].name} <Badge color="blue">{code}</Badge>
              </p>
              <div className="flex flex-wrap gap-1">
                {EDITORIALS_BY_COUNTRY[code].map((e) => <Badge key={e} color="gray">{e}</Badge>)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          El campo <Code>editorial</Code> debe ser uno de estos valores exactos (respetando mayúsculas). Si no coincide, el sistema mostrará una advertencia.
        </p>
      </Section>

      {/* SERIES */}
      <Section title="📚 Series — campos">
        <table className="w-full text-sm mt-3">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              <th className="text-left pb-2 pr-4">Campo</th>
              <th className="text-left pb-2 pr-4">Tipo</th>
              <th className="text-left pb-2 pr-4">Valores</th>
              <th className="text-left pb-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            <FieldRow field="name" type="texto" required values={<span className="text-gray-500">libre</span>} note="Nombre oficial de la serie" />
            <FieldRow field="series_status" type="enum" required values={
              <div className="flex flex-wrap gap-1">
                <Badge color="blue">ongoing</Badge>
                <Badge color="green">completed</Badge>
                <Badge color="gray">single</Badge>
              </div>
            } note="Define el badge en las tarjetas de los tomos" />
            <FieldRow field="base_price_pen" type="decimal" values={<span className="text-gray-500">ej: <Code>45.00</Code></span>} note="Precio base. Se puede propagar a todos los tomos." />
            <FieldRow field="cover_image" type="texto" values={<span className="text-gray-500">ID Cloudinary o URL</span>} note="Imagen representativa de la serie" />
            <FieldRow field="description / full_description" type="texto" values={<span className="text-gray-500">libre</span>} note="Se puede propagar a todos los tomos" />
            <FieldRow field="author / editorial / country_code / demographic" type="varios" values={<span className="text-gray-500">mismos valores que en producto</span>} note="Propagables a todos los tomos con un click" />
          </tbody>
        </table>
      </Section>

      {/* PROMOCIONES */}
      <Section title="🏷 Promociones — tipos y campos">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {[
            {
              type: 'per_product',
              label: 'Por producto',
              color: 'pink' as const,
              desc: 'Descuento aplicado a productos específicos. Requiere seleccionar los IDs de producto.',
              fields: ['product_ids: uuid[]'],
            },
            {
              type: 'per_product_type',
              label: 'Por tipo',
              color: 'amber' as const,
              desc: 'Descuento a todos los productos de uno o más tipos (manga, figura, etc.).',
              fields: ['product_types: ["manga","figure",...]'],
            },
            {
              type: 'coupon',
              label: 'Cupón',
              color: 'navy' as const,
              desc: 'Código que el cliente ingresa en el carrito. Opcional: límite de usos.',
              fields: ['coupon_code: "NEKO20"', 'max_uses: 100 (opcional)'],
            },
          ].map(({ type, label, color, desc, fields }) => (
            <div key={type} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <Badge color={color}>{type}</Badge>
              <p className="font-semibold text-sm text-gray-900 dark:text-white mt-2">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">{desc}</p>
              {fields.map((f) => <p key={f} className="text-[11px] font-mono text-gray-400 dark:text-gray-500">{f}</p>)}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Campos comunes a todos los tipos:</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span><Code>discount_type</Code> — <Badge color="green">percentage</Badge> o <Badge color="amber">fixed</Badge></span>
            <span><Code>discount_value</Code> — número positivo (% o S/)</span>
            <span><Code>starts_at / ends_at</Code> — rango de fechas (opcional)</span>
            <span><Code>is_active</Code> — toggle manual para activar/desactivar</span>
          </div>
        </div>
      </Section>

    </div>
  );
}
