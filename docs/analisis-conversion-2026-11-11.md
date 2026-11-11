# Análisis de conversión — Neko Manga Cix (2026-11-11)

Continúa `docs/ux-audit-2026-11-09.md`. Aquella auditoría cerró accesibilidad y
pulido visual (2.9 → 4.8). Esta mira otra cosa: **qué impide que alguien que
llega al sitio termine comprando** — navegación, carga, SEO, flujo de compra.

Todo lo que sigue se midió contra **producción** (`www.nekomangacix.com`, build
del merge `2cb1ac5`) y contra la base real, en modo solo lectura. No se envió
ningún pedido ni se modificó ningún dato.

## Resumen

Puntaje orientado a conversión: **2.6 / 5**

El sitio se ve bien y es accesible. Lo que frena las ventas está en otra capa:

1. **Hoy ningún pedido de preventa queda registrado, y el 97 % del catálogo es
   preventa.** La única campaña de preventa cerró el 15 de julio; la API rechaza
   esos pedidos y el carrito no se entera. La tabla `orders` tiene **0 filas**.
2. **No hay ninguna medición.** Ni Analytics, ni píxel, ni Speed Insights. No se
   puede saber cuánta gente entra, dónde abandona ni qué vende.
3. **En el móvil comprar cuesta:** el botón de la tarjeta es invisible (y aun así
   recibe toques), y en la ficha el precio y el botón de compra quedan debajo
   del primer pantallazo.

Detrás vienen el dominio mal declarado para Google, un buscador que no encuentra
"one piece 16" y un catálogo que abre con un producto de imagen rota.

## Puntaje por área

| Área | Puntaje | Nota |
|---|---|---|
| Flujo de compra | 1.5 | Pedidos de preventa no se guardan; checkout sin número de pedido ni reintento |
| Medición | 1 | Inexistente |
| Encontrabilidad (buscador, filtros, orden) | 2 | Buscador literal, 9 filtros muertos, orden A–Z |
| SEO | 2.5 | Lighthouse SEO 100, pero canónicas y sitemap apuntan a un dominio que redirige; sin páginas de serie |
| Contenido / Textos | 2.5 | Promesas que el sitio no cumple (México/España, tarjeta, tarifas de envío) |
| Responsive / móvil | 3 | Sin overflow, pero CTA bajo el pliegue y botones invisibles |
| Rendimiento percibido | 3 | TTFB 92 ms y CLS 0; LCP 3,7–4,7 s y catálogo sin caché |
| Usabilidad general | 3.5 | |
| Accesibilidad | 4.5 | Base sólida de la auditoría anterior; 3 detalles nuevos |
| Diseño visual / Consistencia | 4.5 | Sin cambios |

## Los datos que cambian el diagnóstico

| Dato | Valor | Por qué importa |
|---|---|---|
| Productos activos | 6 019 | |
| En preventa | **5 861 (97,4 %)** | El flujo de preventa *es* el negocio |
| En stock | **155 (2,6 %)** | Lo único de entrega inmediata, enterrado en el catálogo |
| Campañas de preventa vigentes | **0** (la de AR cerró el 2026-07-15) | La API exige una para aceptar preventas |
| Pedidos en la base | **0** | |
| Cuentas registradas | 15 | |
| Países con producto | AR 6 008 · JP 11 · MX 0 · ES 0 | El sitio anuncia México y España |
| `demographic` cargado | 0 de 6 019 | El filtro Shōnen/Seinen/… está vacío |
| Series distintas | 2 089 (256 con 5+ tomos; ONE PIECE 107) | No existe página de serie |
| Precio mediano | S/ 43 (4 094 productos bajo S/ 50) | El envío de S/ 15 pesa 35 %; el umbral gratis es S/ 100 |
| Promociones activas | 0 | |

## Hallazgos

### [Crítico] Los pedidos de preventa no se guardan y nadie se entera
- **Dónde:** `/cart` · `app/api/orders/route.ts:100-106`, `lib/campaigns.ts` (`getActiveCampaignForCountry`), `app/cart/page.tsx:130-203`
- **Evidencia:** la consulta de campaña vigente (misma que usa la API, con la anon key) devuelve **ninguna** para AR, JP, MX y ES. La campaña "Preventa Julio AR" figura `open` pero su `ends_at` es 2026-07-15. Con eso la API responde `400 No hay preventa abierta…` a cualquier carrito con un ítem de preventa. `orders` y `order_items`: 0 filas.
- **Problema:** el carrito hace `await fetch('/api/orders')` y **no mira la respuesta**: abre WhatsApp, vacía el carrito y muestra "¡Pedido enviado!". El cliente cree que pidió; el panel de pedidos del admin queda vacío; si el mensaje de WhatsApp no se envía, el pedido no existe en ningún lado. Mientras tanto el banner del home dice "Preventa activa".
- **Arreglo:** (1) decisión de negocio: abrir una campaña vigente, o dejar de exigirla y guardar el ítem con `campaign_id` nulo para asignarlo después; (2) el carrito debe leer la respuesta y, si falla, decirlo y conservar el carrito; (3) alerta en el admin cuando hay productos en preventa y ninguna campaña abierta.
- **No verificado:** no se envió un pedido real a producción para no crear datos; se deduce del código, de la consulta y de las 0 filas.

### [Crítico] El paso final del checkout puede fallar en silencio
- **Dónde:** `app/cart/page.tsx:130-203`, campos en `:554-585`
- **Evidencia (código):** `window.open(wa.me…)` se llama **después** de un `await`, fuera del gesto del usuario; `clearCart()` y `setOrderSent(true)` corren siempre. Nombre, teléfono y dirección son "(opcional)". La pantalla de éxito no tiene número de pedido ni botón para reabrir WhatsApp.
- **Problema:** los navegadores bloquean ventanas abiertas fuera del gesto (Safari en iPhone es el más estricto). Si se bloquea, el cliente ve "¡Pedido enviado!", el carrito ya está vacío y no hay forma de reintentar. Y como el teléfono es opcional, un pedido guardado sin WhatsApp enviado no se puede recuperar.
- **Arreglo:** guardar el pedido primero con teléfono obligatorio; mostrar número de pedido; abrir WhatsApp con un enlace real (`<a href>` o `location.href`) e incluir el número en el mensaje; pantalla de éxito con botón "Abrir WhatsApp de nuevo"; vaciar el carrito solo cuando el pedido quedó guardado.
- **No verificado:** el bloqueo en un iPhone real. En Chrome la ventana suele abrirse si la API responde en menos de 5 s.

### [Crítico] No hay medición de ningún tipo
- **Dónde:** todo el sitio · `app/layout.tsx`
- **Evidencia:** búsqueda en `app/ components/ lib/ context/ package.json` de `gtag|analytics|fbq|pixel|clarity|posthog|speed-insights` → 0 resultados.
- **Problema:** cualquier mejora de esta lista se haría a ciegas. No se sabe cuántas visitas hay, desde dónde llegan, qué buscan ni en qué paso abandonan.
- **Arreglo:** Vercel Analytics + Speed Insights (dos líneas); GA4 con eventos de comercio (`view_item`, `add_to_cart`, `begin_checkout`, `purchase` al confirmar por WhatsApp, `search` con el término); píxel de Meta si se pauta en Instagram; dar de alta el sitio en Search Console.

### [Alto] Google recibe un dominio que redirige
- **Dónde:** `app/layout.tsx:27`, `app/sitemap.ts:4`, `app/robots.ts:3`, `app/products/[slug]/page.tsx:13`
- **Evidencia:** `curl -I https://nekomangacix.com/…` → **307** a `https://www.nekomangacix.com/…`. Pero la canónica de la ficha, `og:url`, el `Sitemap:` de robots y las **6 027 URLs del sitemap** usan `https://nekomangacix.com` (sin www).
- **Problema:** todo lo que se le declara a Google es una URL que redirige, y con un código temporal. Es la forma típica de acabar con páginas "con redirección" o canónicas elegidas por Google distintas de las declaradas.
- **Arreglo:** definir `NEXT_PUBLIC_SITE_URL=https://www.nekomangacix.com` en Vercel (o hacer primario el dominio sin www) y cambiar la redirección entre dominios a 308 en la configuración de dominios de Vercel.

### [Alto] En el móvil, los botones de la tarjeta son invisibles y aun así se tocan
- **Dónde:** `/products` (y favoritos) · `components/ProductCard.tsx:249,258`
- **Evidencia:** a 375 px, opacidad efectiva **0** en "Agregar/Reservar" y en el corazón (solo aparecen con `hover`). El botón invisible ocupa 125×44 px sobre la parte baja de la portada con `pointer-events: auto`: un toque ahí **agregó el producto al carrito** (0 → 1) y no abrió la ficha. Captura: `shots/catalogo-tap-375.png`.
- **Problema:** quien quiere abrir un manga tocando la portada puede terminar con un ítem en el carrito que no pidió; quien quiere agregar desde la lista no ve cómo. Con teclado, el foco cae en un botón que no se ve.
- **Arreglo:** en pantallas táctiles mostrar siempre un botón compacto de agregar en la zona de precio (la variante `compact` ya lo hace bien con `showQuickAdd`) y dejar la versión flotante solo para `@media (hover: hover)`; `focus-visible` debe revelarlo.

### [Alto] En la ficha móvil, precio y botón de compra quedan fuera del primer pantallazo
- **Dónde:** `/products/[slug]` · `app/products/[slug]/ProductDetailClient.tsx:136`
- **Evidencia:** viewport 375×812 — título en y=754, **precio en y=946, "Reservar" en y=1179**, "Comprar ahora" en 1237. La portada (3/4 del ancho + margen) ocupa la pantalla entera. Página de 7 199 px. Captura: `shots/ficha-375.png`.
- **Problema:** quien llega desde Google o Instagram ve una portada y nada más: ni precio ni disponibilidad ni cómo comprar.
- **Arreglo:** limitar la portada a ~50 % del alto en móvil y subir título + precio; barra fija inferior con precio y botón principal; un solo CTA primario (hoy "Reservar" y "Comprar ahora" compiten).

### [Alto] El catálogo abre con lo peor que tiene
- **Dónde:** `/products` · `lib/domain/products/catalog.ts:16` (`DEFAULT_SORT = 'name_asc'`)
- **Evidencia:** primera página por defecto: "¿DONDE ESTA BLUEY EN NAVIDAD?" (la imagen que da 404 en Cloudinary), "10TH 01-03", "20TH CENTURY BOYS 01-11"… 18 de 18 en preventa. En móvil solo caben 2 tarjetas en pantalla y la primera es el marcador de imagen rota. Captura: `shots/catalogo-375.png`.
- **Problema:** el orden alfabético no vende. Los 155 productos de entrega inmediata no aparecen salvo que alguien filtre.
- **Arreglo:** orden por defecto "en stock primero, luego destacados, luego título"; "Más recientes" hoy no significa nada (el catálogo se importó en bloque: 0 productos creados en 30 días); corregir o desactivar el producto de Bluey.

### [Alto] El buscador no encuentra lo que la gente escribe
- **Dónde:** header y `/products?search=` · `app/api/products/search/route.ts`, `lib/domain/products/catalog.ts:126`, `components/SearchDropdown.tsx`
- **Evidencia (misma consulta que la API):**

  | Búsqueda | Resultados | Qué pasa |
  |---|---|---|
  | `one piece 16` | **0** | el título es "ONE PIECE 016" |
  | `spy x family`, `spy family` | **0** | el título usa `×` |
  | `shingeki`, `atack on titan` | **0** | sin sinónimos ni tolerancia a errores |
  | `berserk deluxe` | **0** | |
  | `pokemon` / `pokémon` | 46 / 16 | sensible a tildes |
  | `naruto` | 81, muestra los tomos 55, 56, 57 | sin orden: nunca el tomo 1 |
  | `jujutsu kaisen 1` | muestra 10, 14, 15 | |

  Además, en el home móvil **no hay buscador visible**: está dentro del menú hamburguesa.
- **Problema:** con 6 000 títulos, el buscador es la navegación principal. Un "sin resultados" para un manga que sí está es una venta perdida.
- **Arreglo:** función de búsqueda en Postgres con `unaccent` + `pg_trgm` (tolera tildes, símbolos y errores), que normalice números ("16" = "016") y ordene por en stock → número de tomo; buscador visible en el header móvil; registrar las búsquedas sin resultado.

### [Alto] Nueve opciones de filtro que siempre dan cero
- **Dónde:** `/products` · `components/Filters.tsx`
- **Evidencia:** panel en producción: Demografía — Shōnen 0, Seinen 0, Shōjo 0, Josei 0, Kodomo 0 (`demographic` es nulo en los 6 019 productos). Tipo — Edición especial 0, Merchandising 0, Funda 0, Cómic 0. País — Argentina 6 008, Japón 11.
- **Problema:** la forma natural de explorar manga (por demografía/género) no funciona, y el panel se llena de opciones que no llevan a nada.
- **Arreglo:** ocultar opciones con cero; cargar `demographic` por serie (256 series de 5+ tomos cubren el grueso del catálogo) con el mismo patrón de propagación por serie que ya existe en el admin.

### [Alto] El sitio promete cosas que el flujo no cumple
- **Evidencia:**
  - "Editoriales Argentina, **México y España**" en meta descripción, hero, términos y 404 (`app/layout.tsx:36`, `components/HeroSlider.tsx:83`) — no hay un solo producto MX ni ES.
  - La ficha lista "**Tarjeta de crédito / débito**" y "Efectivo (al recoger)" (`ProductDetailClient.tsx:43-48`); el checkout solo ofrece Yape, Plin y transferencia BCP.
  - `/shipping` publica **S/ 5 en Chiclayo** y S/ 18–25 en selva; el carrito cobra **S/ 15 fijo** a todos.
  - El **envío gratis desde S/ 100** no se anuncia en ninguna parte: la palabra "gratis" solo existe en la línea del resumen cuando ya se alcanzó.
  - "Ver coleccionables" del hero enlaza a `/products?countryGroup=Coleccionables` y el banner de preventa a `/products?stockStatus=preorder`: el catálogo ignora ambos parámetros (espera `type=`/`country=` y `stock=`) y muestra todo sin filtrar. El segundo lo introduje yo en el commit `f46cc72`.
  - "Ediciones mexicanas escogidas **para vos**" (`components/HomeProductSections.tsx:128`): voseo argentino en una tienda peruana.
- **Problema:** cada promesa rota en el momento de pagar es desconfianza justo donde más cuesta.
- **Arreglo:** alinear textos con lo que hay; corregir los dos enlaces; decidir tarifa de envío (selector de destino o texto único); anunciar el envío gratis en header, ficha y carrito.

### [Alto] El catálogo y el carrito cargan más de lo necesario
- **Dónde:** `/products`, `/cart`
- **Evidencia:**
  - `/products` responde `cache-control: private, no-store` y `x-vercel-cache: MISS` siempre; TTFB 0,5–2,2 s contra 0,09 s de las páginas prerenderizadas. Aplicar el filtro "En stock" tardó **1 842 ms**.
  - Tocar una tarjeta → contenido de la ficha: **1 270 ms**, porque los enlaces llevan `prefetch={false}` (`ProductCard.tsx:119,188,213`) aunque las 6 019 fichas son estáticas.
  - `/cart` descarga desde el navegador `products?select=*` — **1 000 productos con todas sus columnas, 1,12 MB de JSON (230 KB comprimido)** — solo para calcular 6 sugerencias (`app/cart/CartSuggestions.tsx:21`), y como PostgREST corta en 1 000, las sugerencias ignoran al 83 % del catálogo.
- **Arreglo:** reactivar el prefetch de las fichas; cachear facetas y las combinaciones de filtro más usadas; `Suspense` con esqueleto en vez de `fallback={null}`; sustituir `useProducts()` en el carrito por un endpoint que devuelva las 6 tarjetas.

### [Medio] No existen páginas de serie y la paginación no es rastreable
- **Dónde:** `/products`, `/products/[slug]` · `app/products/ProductsClient.tsx:375-391`
- **Evidencia:** la paginación son `<button>` sin `href`; la ficha tiene **0 enlaces** a su serie; no hay ruta `/series/…`. Títulos como `ONE PIECE 016 — NekoMangaCix · NEKO MANGA CIX` (marca dos veces, sin "manga", "comprar" ni "Perú"). `/products?page=2` y cualquier filtro salen indexables, sin canónica y con el mismo título. `/cart` es indexable. JSON-LD de producto sin `image` ni migas; ninguno en el home. `lastModified` del sitemap = fecha del build para las 6 027 URLs.
- **Problema:** la búsqueda con intención de compra es por serie ("comprar one piece manga perú"), y no hay página que responda a eso. Para el comprador tampoco existe "ver toda la serie" ni "tomo siguiente".
- **Arreglo:** `/series/[slug]` con todos los tomos en orden, estado de la serie y "agregar tomos 1–N"; tomo anterior/siguiente en la ficha; plantilla de título `One Piece 16 — Manga Ivrea | S/ 36 · Neko Manga Cix`; paginación con enlaces; `noindex` en carrito, perfil, pedidos y auth; canónica en `/products`; JSON-LD con imagen, `BreadcrumbList` y `Organization`.

### [Medio] LCP de 3,7–4,7 s en móvil
- **Evidencia (Lighthouse 12.2.1 móvil, producción):**

  | Ruta | Rend. | SEO | LCP | TBT | CLS | TTFB | JS | Imágenes |
  |---|---|---|---|---|---|---|---|---|
  | `/` | 83 | 100 | 4,7 s | 90 ms | 0,02 | 92 ms | 237 KB | 600 KB |
  | `/products` | 75 | 100 | 3,8 s | 530 ms | 0 | 92 ms | 248 KB | 581 KB |
  | `/products/one-piece-016` | 78 | 100 | 4,0 s | 370 ms | 0 | 91 ms | 250 KB | 802 KB |
  | `/products/chainsaw-man-03` | 88 | 100 | 3,7 s | 150 ms | 0 | 96 ms | 250 KB | 459 KB |

- **Problema:** el servidor responde rápido; el tiempo se va en JS e imágenes. El cliente de Supabase Auth viaja a todos los visitantes desde el layout raíz (`context/AuthContext.tsx:34`) aunque solo 15 personas tienen cuenta. El home precarga 9 imágenes. Lighthouse estima 249 KB de ahorro en la ficha por `sizes` mal ajustado.
- **Arreglo:** cargar Auth de forma diferida; `priority` solo en la imagen LCP; `sizes` reales en ficha y relacionados.

### [Medio] El home ordena por país de la editorial, no por cómo se compra
- **Evidencia:** dos secciones — "Selección de Argentina" (10 productos, 9 en preventa, en orden alfabético: 10TH 03, Biblioteca Dante Quinterno, Boruto 06…) y "Figuras" (6). De 17 destacados, 3 están en stock. El menú solo tiene Inicio, Catálogo y Preventas. Captura: `shots/home-1280-full.png`.
- **Arreglo:** secciones "En stock — te llega esta semana", "Series más buscadas" (enlazando a las páginas de serie), "Preventas que cierran pronto" con fecha, y accesos por demografía cuando el dato exista.

### [Medio] Sin confirmación al agregar desde la ficha, sin barra de envío gratis
- **Evidencia:** tras "Reservar" en la ficha no hay toast ni región `aria-live` (la tarjeta sí lo tiene); solo cambia el contador del carrito. El carrito no muestra cuánto falta para el envío gratis.
- **Arreglo:** el mismo toast de la tarjeta con "Ver carrito"; barra "Te faltan S/ X para envío gratis" — con mediana de S/ 43 es el incentivo más directo para sumar un segundo tomo.

### [Medio] Higiene de datos visible para el cliente
- **Evidencia:** editorial vacía en 2 productos; "SEGA"/"Sega" y "Banpresto"/"Banpresto (Bandai Spirits)" como editoriales distintas; 4 productos con su propio slug como etiqueta (se pinta como distintivo sobre la portada); 692 con `description = title` (su meta descripción es el título repetido); 107 sin serie; los 26 títulos `**RE**` y la imagen de Bluey ya conocidos.

### [Medio] El motor de promociones cobraría distinto de lo que muestra (latente)
- **Evidencia (código):** la tarjeta aplica `getDiscountedPrice`; la ficha, el carrito y `/api/orders` usan el precio completo. Hoy no hay promociones (0 filas), así que no se manifiesta.
- **Arreglo:** antes de lanzar la primera promoción, aplicar el descuento en ficha, carrito y API.

### [Bajo]
- La cantidad en el carrito no se limita al stock; el precio guardado en `localStorage` puede diferir del que recalcula el servidor.
- `og:url` de todas las páginas hereda la del home; `og:image` de producto declara 1200×630 para una portada vertical.
- `handleShare` no captura el rechazo cuando el usuario cancela el diálogo de compartir.
- El buscador no descarta respuestas que llegan fuera de orden; su API usa la service role key para una lectura pública y no filtra `*`.
- Las pestañas de la ficha no usan `role="tab"`; la de "Información" no está en el HTML inicial.
- `CLAUDE.md` describe una versión antigua del proyecto (Next 15, productos estáticos, `localStorage`).

## Lo que está bien (no romperlo)
- 6 019 fichas prerenderizadas con TTFB de ~92 ms, CLS 0 y 404 real para slugs inexistentes. El build ampliado desplegó sin problemas en Vercel.
- Las 6 019 fichas tienen imagen; Cloudinary entrega formato y tamaño por dispositivo.
- El servidor recalcula precios, cupones y descuento de bienvenida: el pedido no confía en el navegador.
- El catálogo ya pagina y cuenta facetas en el servidor, con el estado en la URL.
- Accesibilidad: axe en 0 violaciones y Lighthouse 100 en la auditoría del 9–10 de noviembre.
- El carrito no parpadea "vacío" al cargar con productos.

## No verificado
- Envío real de un pedido y apertura de WhatsApp en un iPhone (ver hallazgos críticos).
- Tráfico, tasa de conversión y abandono reales: no hay con qué medirlos.
- Estado de indexación en Search Console.
- axe no se volvió a correr hoy; los tres detalles nuevos de accesibilidad salen del recorrido manual.
- Recorrido de compra en escritorio y modo oscuro (se revisaron el 9–10 de noviembre).
- Vistas con sesión iniciada (`/profile`, `/orders`) y el panel `/admin`.

## Backlog sugerido

| # | Tanda | Hallazgos | Esfuerzo |
|---|---|---|---|
| 1 | Que ningún pedido se pierda | Campaña de preventa, respuesta de la API, teléfono obligatorio, número de pedido, enlace real a WhatsApp | bajo-medio |
| 2 | Medir | Vercel Analytics + Speed Insights, GA4 con eventos de compra, Search Console | bajo |
| 3 | Dominio y SEO técnico | `SITE_URL` con www, 308, `noindex`, canónicas, títulos, JSON-LD | bajo |
| 4 | Promesas coherentes | Textos MX/ES, medios de pago, tarifas, envío gratis anunciado, enlaces rotos del hero y banner, voseo | bajo |
| 5 | Comprar desde el móvil | Botón visible en la tarjeta, ficha con precio y CTA arriba, barra fija, toast, barra de envío gratis | medio |
| 6 | Encontrar el producto | Orden por defecto, buscador tolerante y visible, filtros sin ceros, secciones del home | medio |
| 7 | Velocidad | Prefetch, caché del catálogo, sugerencias del carrito, Auth diferido, imágenes | medio |
| 8 | Páginas de serie | `/series/[slug]`, tomo anterior/siguiente, demografía por serie | alto |
| 9 | Datos | Editoriales duplicadas, etiquetas basura, descripciones, promociones | medio |

## Decisiones que necesito de ti
1. **Preventas sin campaña:** ¿abres una campaña vigente, o prefieres que el pedido se guarde igual y se asigne a una campaña después?
2. **Dominio principal:** ¿`www.nekomangacix.com` (como está hoy) o sin `www`?
3. **Medios de pago y envío:** ¿aceptas tarjeta y efectivo? ¿La tarifa es S/ 15 fija o varía por destino como dice `/shipping`?
4. **México y España:** ¿están por llegar (y se deja el texto) o se quita?

## Siguiente paso
Tanda 1. Es la única donde hoy se pierde dinero de forma directa, y la 2 va
pegada para poder medir el efecto de todo lo demás.

Evidencia: capturas y JSON de Lighthouse en el scratchpad de la sesión
(`conv/shots/`, `conv/lh-*.json`).

---

# Corrección — tanda 1 y decisiones (2026-11-11)

Rama `fix/checkout-pedidos`. Decisiones del usuario: el pedido de preventa se
guarda aunque no haya campaña y se asigna después; solo pagos por transferencia;
el envío varía por destino; México y España quedan pendientes y no se muestran
mientras no tengan productos.

## Qué cambió

| Antes | Ahora |
|---|---|
| Preventa sin campaña vigente → la API respondía 400 y el pedido se perdía | Se guarda con `campaign_id` nulo; en `/admin/orders` aparece como "sin campaña" |
| El carrito no leía la respuesta de la API | Si falla, lo dice, **conserva el carrito** y ofrece enviar el pedido directo por WhatsApp |
| La API devolvía `success: true` aunque el insert fallara | Devuelve 500; si fallan las líneas del pedido, deshace la cabecera |
| "¡Pedido enviado!" sin número ni forma de reintentar | "Pedido #XXXXXXXX registrado" (mismo código que ve el admin), monto, datos de pago y botón **Enviar pedido por WhatsApp** siempre visible |
| WhatsApp dependía de un `window.open` tras un `await` | Se intenta abrir, pero el camino principal es un enlace real en la confirmación |
| Teléfono opcional | Obligatorio (9 dígitos), validado en el carrito y en la API |
| Envío S/ 15 fijo | Selector de destino con las tarifas de `/shipping` (S/ 5 Chiclayo … S/ 18 selva); la API calcula la tarifa por zona, no acepta montos del navegador |
| El envío gratis desde S/ 100 no se anunciaba | "Te faltan S/ X para el envío gratis" en el resumen |
| La ficha listaba tarjeta y efectivo | Yape, Plin y Transferencia BCP, igual que el checkout |
| Textos con México y España | El hero nombra los países que tienen productos (hoy "Argentina y Japón"); el resto de textos ya no enumera países |
| 9 opciones de filtro en cero | Se ocultan las opciones sin productos; "País" solo aparece si hay más de uno |
| "Ver coleccionables" y el banner de preventa llevaban al catálogo sin filtrar | `?type=figure` y `?stock=preorder` |
| El admin mostraba el teléfono solo si había nombre, y nunca la dirección | Muestra teléfono, destino y dirección |

Las tarifas viven en `lib/domain/shipping/zones.ts`, única fuente para
`/shipping`, el carrito y la API.

## Verificación

- Carrito en 375 y 1280 px con la llamada a `/api/orders` simulada: validación
  (3 errores, foco en el teléfono, la API no se llama), fallo de la API (alerta,
  carrito intacto, WhatsApp sin abrir) y éxito (número de pedido, enlace con el
  mismo mensaje, carrito vacío).
- `/api/orders` real, sin escribir: 400 sin teléfono, 400 sin destino, 400 con
  destino inexistente.
- axe-core en carrito con errores, carrito completo, confirmación y catálogo, en
  ambos anchos → **0 violaciones** (se corrigieron de paso 7 textos de preventa
  del carrito con contraste insuficiente).
- `tsc` limpio; `npm run lint` → 10 errores y 16 avisos, igual que antes;
  `npm run build` → compila, 6 065 páginas.

## Pedido real de prueba

Con autorización del usuario se hizo un pedido real desde el carrito del
servidor local (que escribe en la base de producción), con la ventana de
WhatsApp suprimida, y se borró al terminar.

- Carrito: ONE PIECE 016 (preventa) + CHAINSAW MAN 03 (en stock), destino
  Chiclayo, Transferencia BCP.
- La API respondió 200 con el código `7A511163`; la pantalla mostró "Pedido
  #7A511163 registrado" y el mensaje de WhatsApp empezaba con ese número.
- En la base: subtotal 72, envío 5, adelanto 18, saldo 18, **total 59**;
  `payment_type = split_preorder`; teléfono, destino y dirección guardados; dos
  líneas, la de preventa con `campaign_id` nulo.
- Borrado y comprobado: `orders` y `order_items` volvieron a 0 filas.

## No verificado

- La apertura de WhatsApp en un iPhone real.
- La vista del pedido en `/admin/orders` (requiere el PIN del panel).

## Pendiente de esta tanda

- Un pedido no descuenta stock: no hay nada en la API ni en la base que lo haga.

- `/api/admin/orders` (pedidos manuales) todavía rechaza preventas sin campaña.
- No hay forma de asignar la campaña a un ítem "sin campaña" desde el admin.
- Selva / zonas alejadas cobra S/ 18 y avisa que puede subir hasta S/ 25.

---

# Observaciones del home y tanda 2 — medición (2026-11-11)

Misma rama `fix/checkout-pedidos`.

## Observaciones del usuario

- **Coleccionables como carrusel horizontal.** `components/ProductCarousel.tsx`:
  fila con `scroll-snap`, se desliza con el dedo, flechas de 44 px en
  escritorio (solo la que tiene hacia dónde ir) y la tarjeta siguiente asoma
  para indicar que la fila continúa. No avanza sola. Antes eran 6 tarjetas en
  rejilla de 5, con una suelta en la segunda fila.
- **Degradado entre el hero y el banner: eliminado.** Era una franja blanca
  sobre una página gris claro; en tema oscuro no se veía.
- **Tema claro**, lo que era un defecto medible:
  - los medios de pago de la ficha eran fichas gris sobre fondo gris
    (invisibles) → blancas con borde;
  - "Catálogo" y "Preventas" se marcaban activos a la vez en `/products`;
  - etiqueta "En stock" de la ficha y el título de tarjeta al pasar el ratón no
    llegaban a 4,5:1;
  - "Solo 1 unidades" → "Solo queda 1 unidad".

  Queda por confirmar si la observación pedía algo más amplio (bloques oscuros
  del home en tema claro, o claro como tema por defecto).

## Tanda 2 — medición

- `@vercel/analytics` y `@vercel/speed-insights` cargados desde el layout,
  fuera de `/admin`.
- `lib/analytics.ts`: un `trackEvent` que reparte a GA4 (si existe
  `NEXT_PUBLIC_GA_ID`) y a Vercel. Sin la variable no se carga ningún script de
  Google.
- Embudo instrumentado: `view_item` → `add_to_cart` → `view_cart` →
  `begin_checkout` → `purchase` (con el número de pedido) → `whatsapp_open`.
  Además `search`, que registra las búsquedas **sin resultado** y las enviadas.
- `NEXT_PUBLIC_GSC_VERIFICATION` para verificar Search Console por etiqueta.

### Verificación

- Con un id de GA de prueba y las salidas a Google y Vercel bloqueadas, la cola
  quedó en orden: `js`, `config`, `view_item`, `add_to_cart`, `view_cart`,
  `begin_checkout`, `purchase{transaction_id=A1B2C3D4, value=51, shipping=15}`,
  `whatsapp_open`. Confirmar con datos incompletos no dispara
  `begin_checkout`. "spy x family" registró `search{results: 0}`. En `/admin`
  no se carga nada.
- Carrusel a 1280 y 375 px: 6 tarjetas de igual alto, sin desbordar la página,
  flechas correctas en cada extremo.
- axe en home, catálogo y ficha, claro y oscuro → 0 violaciones.
- `tsc` limpio; lint 10 errores y 16 avisos (sin cambios); build compila.

### Falta, y depende del usuario

- Activar **Web Analytics** y **Speed Insights** en el proyecto de Vercel.
- Crear la propiedad de GA4 y definir `NEXT_PUBLIC_GA_ID` en Vercel.
- Dar de alta el sitio en Search Console (por DNS o con
  `NEXT_PUBLIC_GSC_VERIFICATION`) y enviar el sitemap.
- Los eventos personalizados de Vercel requieren plan Pro; el embudo se lee en
  GA4. No se envió ningún dato real durante las pruebas.

## Tema claro: hero y figuras siguen al tema (2026-11-11)

Aclaración del usuario sobre "mejor el tema claro": aclarar el hero y el bloque
de figuras.

- **Hero** (`components/HeroSlider.tsx`): en tema claro, fondo de blanco a
  rosa y celeste muy suaves con dos manchas de color de marca, texto oscuro,
  botón secundario blanco con borde. En tema oscuro queda como estaba.
- **Figuras & Coleccionables** (`components/HomeProductSections.tsx`): panel
  con tinte claro y borde fino en tema claro; noche en oscuro.
- Verificado a 1280 y 375 px en ambos temas: axe 0 violaciones, sin desborde,
  y el texto del hero y del panel medido contra el tono más desfavorable del
  degradado: mínimo 6,8:1 en oscuro y por encima de 4,5:1 en claro.
- Lint sin cambios (10 errores, 16 avisos); el build compila.
- Pendiente de gusto: la portada decorativa de Jujutsu Kaisen es casi toda
  negra y sobre el hero claro se ve como un rectángulo oscuro.

## Tanda 3 — dominio y SEO técnico (2026-11-11)

Decisión del usuario: el dominio principal es **`www.nekomangacix.com`**.

### Lo que se encontró al empezar

- `NEXT_PUBLIC_SITE_URL` **está definida en Vercel** (producción, preview y
  desarrollo) con el dominio sin `www`. No era el valor por defecto del código:
  cambiar ese valor por defecto no habría arreglado nada.
- La redirección `nekomangacix.com → www` no tiene código configurado en
  Vercel (`redirectStatusCode: null`), por eso responde 307.
- **`/og-default.jpg` daba 404 en producción.** El home y todas las páginas sin
  imagen propia declaraban una imagen social que no existía: al compartir el
  sitio en WhatsApp o Instagram no salía ninguna vista previa.
- El título del home y el de "Nosotros" repetían la marca
  (`… · NEKO MANGA CIX` dos veces); `/links` también.
- `/links` estaba bloqueada en robots **y** con `noindex`: bloqueada, Google no
  puede leer el `noindex`, y es justo la página enlazada desde las redes.

### Lo que cambió

- **Dominio único** — `lib/site.ts` es la única fuente de `SITE_URL` (antes
  había cuatro copias). Si la variable apunta al dominio sin `www`, se corrige
  ahí mismo: canónicas, `og:url`, sitemap y robots salen con `www` aunque nadie
  toque la variable en Vercel.
- **Canónicas y Open Graph por página** — `lib/seo.ts` (`pageMetadata`) arma
  título, descripción, canónica, `og:*` y Twitter juntos. Antes cada página
  heredaba el `og:title` y el `og:url` del home. El layout raíz declara
  `canonical: './'` como red de seguridad para las que no usan el helper.
- **Catálogo** — `lib/domain/products/catalogSeo.ts` decide qué vistas se
  indexan. Con página propia (título, descripción, canónica y `h1` propios):
  catálogo general, un tipo (`?type=figure`), preventas, en stock, una
  editorial conocida y un país con productos. Todo lo demás —búsquedas,
  combinaciones, orden, precio, página 2 en adelante, valores desconocidos—
  sale con `noindex, follow` y sin canónica.
- **Ficha de producto** — `lib/domain/products/seo.ts`:
  - título `ONE PIECE 016 — Manga Ivrea en Perú · NEKO MANGA CIX` (antes
    `… — NekoMangaCix · NEKO MANGA CIX`);
  - descripción que ya no puede salir como `undefined | Ivrea | …` ni repetir
    el título: sinopsis recortada si existe, frase armada si no, siempre con
    disponibilidad y precio;
  - imagen social real de 1200×630 (portada completa sobre fondo oscuro, JPG);
    antes se declaraba 1200×630 para una portada vertical;
  - JSON-LD de producto con `image`, `category`, `itemCondition` y precio con
    dos decimales, más `BreadcrumbList`.
- **Home** — JSON-LD `OnlineStore` (logo, contacto, Chiclayo, redes) y
  `WebSite`; título sin la marca duplicada.
- **`noindex`** en carrito, inicio de sesión, registro y perfil (por layout,
  porque son componentes de cliente). `/contact`, que tampoco podía declarar
  metadata, ahora tiene título y descripción.
- **robots** — ya no bloquea `/links` (se queda con su `noindex`); bloquea
  `/admin` y `/api/`.
- **Sitemap** — URLs con `www`; `lastmod` real por producto (`updated_at`) en
  vez de la fecha del build en las 6 027; suma las cuatro vistas indexables del
  catálogo; las páginas fijas van sin fecha inventada.
- **`public/og-default.jpg`** — imagen social por defecto (1200×630) con el
  logo y los colores de marca. Es reemplazable por un diseño propio con el
  mismo nombre.
- Cierre de sesión: redirige al host de la petición, no a
  `NEXT_PUBLIC_SITE_URL` (en local mandaba a producción).

### Verificado

Con el servidor local y `NEXT_PUBLIC_SITE_URL` apuntando al dominio sin `www`
(como en Vercel):

- Canónica, `og:url`, robots y las 6 031 URLs del sitemap salen con
  `https://www.nekomangacix.com`; ninguna con el dominio sin `www`.
- 10 vistas del catálogo: 5 indexables con su título, canónica y `h1`; 5 con
  `noindex, follow` y sin canónica (`?editorial=asdf`, `?page=2`, búsqueda,
  país sin productos, dos filtros).
- Ficha: título, descripción, imagen 1200×630 comprobada en Cloudinary, dos
  bloques JSON-LD válidos.
- Carrito, login, registro, perfil y `/links`: `noindex`.
- `h1` nuevo del catálogo a 1280 y 375 px: un solo `h1`, sin desborde.
- `tsc` limpio; lint 10 errores y 16 avisos (sin cambios).

### No verificado

- Resultado en la prueba de resultados enriquecidos de Google y en Search
  Console: requiere el sitio desplegado.
- Vista previa real al compartir en WhatsApp.

### Falta, fuera del código

- **Redirección 308**: en Vercel → Domains → `nekomangacix.com` → redirigir a
  `www` con 308 (permanente). Conviene hacerlo después de desplegar esta tanda.
- Opcional: actualizar `NEXT_PUBLIC_SITE_URL` en Vercel a
  `https://www.nekomangacix.com` para que coincida con lo que el código ya
  emite.
- Enviar el sitemap en Search Console una vez desplegado.
- No hecho en esta tanda (van en la 8): páginas de serie, paginación con
  enlaces rastreables y enlaces entre tomos.

## Tanda 5 — comprar desde el móvil (2026-11-11)

Ficha de la vista (modo Construir): objetivo, que quien llega a una ficha o al
catálogo desde el móvil vea precio y botón sin buscarlos y no agregue nada
por error. Ajuste de vistas existentes, sin rediseño.

### Lo que cambió

| Antes | Ahora |
|---|---|
| Tarjeta en táctil: "Agregar/Reservar" y corazón con opacidad 0 pero tocables; un toque en la portada agregaba al carrito | En pantallas sin hover (`@media (hover: hover)` falso) el botón flotante no existe; la tarjeta muestra "Agregar"/"Reservar" de 44 px bajo el precio y el corazón siempre visible |
| En escritorio el botón flotante solo aparecía con el ratón | Aparece también al llegar con el teclado (`group-focus-within`) |
| Ficha a 375 px: precio en y=946, botón en y=1179 | Precio en y=543 y botón terminando en y=722 (en stock); en preventa, botón en y=794, dentro del primer pantallazo de 812 |
| Portada 3/4 a todo el ancho; miniatura repetida con una sola imagen | Portada apaisada en el móvil (la tapa entra completa); miniaturas solo si hay más de una imagen |
| SKU, categoría y serie entre el título y el precio | Pasan debajo de los botones |
| "Reservar/Agregar" y "Comprar ahora" compitiendo como primarios | Un primario; "Comprar ahora" (o "Reservar e ir al carrito") con borde |
| Sin barra de compra | Barra fija en el móvil con precio, adelanto o disponibilidad y botón; aparece cuando el bloque de compra sale de pantalla y se oculta al llegar al pie |
| La ficha no avisaba al agregar; el aviso del catálogo duraba 3,5 s y no llevaba a ningún lado | Aviso en ficha y catálogo con "Ver carrito" y "Te faltan S/ X para el envío gratis"; dura 6 s, se coloca sobre la barra fija, cierre de 36 px |
| Agotado en la ficha usaba un botón propio sin aviso | Mismo botón principal: entra al carrito como preventa, igual que desde la tarjeta |

También: precio de la tarjeta sin partirse en dos líneas, "¡Última unidad!"
en singular, verdes de "En stock", "Agregado" y "Serie completada" y el enlace
"Limpiar todo" de los filtros con contraste suficiente. Se borró
`components/product/ReserveButton.tsx`, que quedó sin uso.

### Verificado

- Móvil táctil emulado (375×812, `hover: none`): tocar la portada abre la
  ficha y no agrega (carrito 0 → 0); el botón visible agrega y muestra el aviso
  con "Ver carrito" y "Te faltan S/ 64.00".
- Barra fija: oculta al cargar, visible al bajar, oculta al llegar al pie; el
  aviso queda 31 px por encima de ella.
- Escritorio 1280: botón flotante oculto en reposo, visible con hover y con
  foco de teclado; el botón táctil no se pinta; la barra no existe.
- axe 0 violaciones en catálogo, ficha con barra y aviso abiertos, y carrito,
  en claro y oscuro a 375 y 1280 px.
- Sin desborde horizontal; `tsc` limpio; lint 10 errores y 14 avisos (dos
  avisos menos).

### No verificado

- Un iPhone real (la zona segura inferior de la barra usa
  `env(safe-area-inset-bottom)`).
- Lectores de pantalla reales sobre el aviso, que es una región `role=status`.
