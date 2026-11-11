type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/**
 * Bloque de datos estructurados. Escapa `<` para que un texto del catálogo
 * (una sinopsis con `</script>`, por ejemplo) no pueda cerrar la etiqueta.
 */
export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
