-- ============================================
-- NekoMangaCix - 009: Seed de datos fake para probar el flujo completo
-- Inserta: figuras coleccionables, ediciones especiales, manga JP, mangas ES.
-- Idempotente: usa ON CONFLICT (sku) DO NOTHING.
-- ============================================
-- Requiere migraciones 005-007 aplicadas (type, country_code, series, etc.)

insert into public.products (
  sku, slug, title, type, editorial, country_code, country_group,
  series, volume_number, demographic, language,
  author, price_pen, stock, stock_status, eta_text, preorder_deposit,
  description, full_description, specifications,
  images, category, tags, figure_scale, manufacturer, is_active
) values
-- ─── FIGURAS COLECCIONABLES (Japón) ─────────────────────────────────────
(
  'FIG-OP-LUFFY-G5',
  'figura-luffy-gear-5-figuarts-zero',
  'Luffy Gear 5 — Figuarts Zero Extra Battle',
  'figure', 'Shueisha', 'JP', 'Japón',
  'One Piece', null, null, 'jp',
  'Bandai Spirits', 549.00, 3, 'in_stock', null, null,
  'Figura premium de Luffy en Gear 5 con efectos especiales',
  'Figura coleccionable de Monkey D. Luffy en su transformación Gear 5 (Sun God Nika). Material PVC/ABS, base con efectos de nubes incluidos. Pintura premium, articulación limitada (figura estática). Dimensiones: 22cm de altura aproximadamente.',
  '{"dimensions":"22 cm","weight":"450g","format":"Figura PVC/ABS"}'::jsonb,
  array['/images/placeholder.png'], 'action',
  array['premium','exclusivo','nuevo'],
  null, 'Bandai Spirits', true
),
(
  'FIG-AOT-MIKASA-POP',
  'figura-mikasa-pop-up-parade',
  'Mikasa Ackerman — POP UP PARADE',
  'figure', 'Kodansha', 'JP', 'Japón',
  'Shingeki no Kyojin', null, null, 'jp',
  'Good Smile Company', 189.00, 0, 'preorder', '3 meses tras pedido', null,
  'Figura POP UP PARADE de Mikasa con maillot militar',
  'Figura escala 1/8 de Mikasa Ackerman con su uniforme de la Tropa de Exploración. Pintura impecable, base incluida. Fabricada por Good Smile Company, línea POP UP PARADE. Llegada estimada: 3 meses tras confirmar pedido.',
  '{"dimensions":"17 cm","weight":"280g","format":"Figura PVC"}'::jsonb,
  array['/images/placeholder.png'], 'action',
  array['preventa','popup-parade'],
  '1/8', 'Good Smile Company', true
),
(
  'FIG-DEMON-NEZUKO-17',
  'figura-nezuko-kamado-escala-1-7',
  'Nezuko Kamado — Escala 1/7',
  'figure', 'Shueisha', 'JP', 'Japón',
  'Kimetsu no Yaiba', null, null, 'jp',
  'Aniplex', 749.00, 0, 'out_of_stock', null, null,
  'Figura escala 1/7 de Nezuko con efectos de fuego',
  'Figura premium de Nezuko Kamado en escala 1/7 con efectos de Hinokami Kagura. Edición limitada por Aniplex. Incluye base con efectos translúcidos.',
  '{"dimensions":"24 cm","weight":"520g"}'::jsonb,
  array['/images/placeholder.png'], 'action',
  array['agotado','edicion-limitada','premium'],
  '1/7', 'Aniplex', true
),
(
  'FIG-CHAINSAW-MAN-NENDO',
  'figura-denji-nendoroid',
  'Denji — Nendoroid #1944',
  'figure', 'Shueisha', 'JP', 'Japón',
  'Chainsaw Man', null, null, 'jp',
  'Good Smile Company', 299.00, 5, 'in_stock', null, null,
  'Nendoroid de Denji con motosierras intercambiables',
  'Nendoroid #1944 de Denji, protagonista de Chainsaw Man. Incluye 3 caras intercambiables, motosierras desmontables, y la cabeza de Pochita. Base articulada incluida.',
  '{"dimensions":"10 cm","weight":"150g"}'::jsonb,
  array['/images/placeholder.png'], 'action',
  array['nendoroid','nuevo'],
  null, 'Good Smile Company', true
),
(
  'FIG-JJK-GOJO-BANPRESTO',
  'figura-gojo-satoru-banpresto',
  'Satoru Gojo — Jukon no Kata',
  'figure', 'Shueisha', 'JP', 'Japón',
  'Jujutsu Kaisen', null, null, 'jp',
  'Banpresto', 159.00, 4, 'in_stock', null, null,
  'Figura prize de Gojo con técnica Infinito',
  'Figura de Satoru Gojo línea Jukon no Kata. Pose dinámica con efectos de su técnica Infinito. Fabricada por Banpresto, calidad prize.',
  '{"dimensions":"18 cm","weight":"230g"}'::jsonb,
  array['/images/placeholder.png'], 'action',
  array['banpresto'],
  null, 'Banpresto', true
),

-- ─── EDICIONES ESPECIALES / BOX SETS ────────────────────────────────────
(
  'BOX-DEATHNOTE-DELUXE',
  'death-note-edicion-deluxe-box',
  'Death Note — Edición Deluxe Box Set',
  'special_edition', 'Ivrea España', 'ES', 'España',
  'Death Note', null, 'seinen', 'es',
  'Tsugumi Ohba / Takeshi Obata', 489.00, 2, 'in_stock', null, null,
  'Box completo con los 12 tomos en edición deluxe',
  'Box especial que incluye los 12 tomos de Death Note en formato bunko premium, sobrecubiertas exclusivas, póster doble cara y guía oficial del autor. Edición numerada por Ivrea España.',
  '{"format":"Box deluxe (12 tomos)","weight":"3.5 kg","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'seinen',
  array['box-set','deluxe','exclusivo'],
  null, null, true
),
(
  'BOX-MONSTER-KANZENBAN',
  'monster-kanzenban-edicion-completa',
  'Monster — Edición Kanzenban Completa',
  'special_edition', 'Planeta Cómic', 'ES', 'España',
  'Monster', null, 'seinen', 'es',
  'Naoki Urasawa', 1199.00, 0, 'preorder', 'Fin de julio 2026', null,
  '9 tomos kanzenban + caja exclusiva',
  'Edición Kanzenban completa de Monster por Naoki Urasawa. 9 volúmenes de gran formato con páginas a color, caja recolectora exclusiva, ilustraciones inéditas y comentarios del autor. Pre-venta a 50% de adelanto.',
  '{"format":"Kanzenban (9 tomos)","weight":"6.8 kg","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'seinen',
  array['preventa','kanzenban','box-set'],
  null, null, true
),

-- ─── MANGA EN JAPONÉS (coleccionable / edición especial) ────────────────
(
  'MAN-OP-VOL106-JP',
  'one-piece-volumen-106-japones',
  'One Piece Vol. 106 — Edición Japonesa Original',
  'manga', 'Shueisha', 'JP', 'Japón',
  'One Piece', 106, 'shonen', 'jp',
  'Eiichiro Oda', 89.00, 6, 'in_stock', null, null,
  'Tomo 106 importado directamente de Japón',
  'Edición original japonesa del tomo 106 de One Piece. Texto completamente en japonés (incluye furigana). Ideal para coleccionistas y estudiantes avanzados de japonés.',
  '{"pages":192,"dimensions":"11.4 x 17.6 cm","weight":"180g","format":"Tankobon JP","language":"Japonés","isbn":"978-4-08-883543-5"}'::jsonb,
  array['/images/placeholder.png'], 'shonen',
  array['importado','original-jp','coleccionable'],
  null, null, true
),
(
  'MAN-JJK-VOL26-JP',
  'jujutsu-kaisen-vol-26-japones',
  'Jujutsu Kaisen Vol. 26 — Edición Japonesa',
  'manga', 'Shueisha', 'JP', 'Japón',
  'Jujutsu Kaisen', 26, 'shonen', 'jp',
  'Gege Akutami', 79.00, 0, 'preorder', 'Mediados de junio 2026', null,
  'Volumen 26 en japonés, edición original',
  'Tomo 26 de Jujutsu Kaisen en su edición japonesa original. Reserva con 50% de adelanto, llegada estimada a mediados de junio 2026.',
  '{"pages":192,"dimensions":"11.4 x 17.6 cm","format":"Tankobon JP","language":"Japonés"}'::jsonb,
  array['/images/placeholder.png'], 'shonen',
  array['preventa','importado','original-jp'],
  null, null, true
),

-- ─── MANGAS REGULARES (para llenar el catálogo) ─────────────────────────
(
  'MAN-CSM-VOL5-AR',
  'chainsaw-man-vol-5-ivrea',
  'Chainsaw Man Vol. 5',
  'manga', 'Ivrea', 'AR', 'Argentina',
  'Chainsaw Man', 5, 'shonen', 'es',
  'Tatsuki Fujimoto', 45.00, 8, 'in_stock', null, null,
  'Continúa la cacería de los demonios',
  'Quinto tomo de Chainsaw Man. La saga del Demonio de la Oscuridad continúa mientras Denji enfrenta a sus enemigos más peligrosos. Edición Ivrea Argentina.',
  '{"pages":192,"dimensions":"13.5 x 19 cm","weight":"190g","format":"Tankobon","language":"Español","isbn":"978-987-720-810-5"}'::jsonb,
  array['/images/placeholder.png'], 'shonen',
  array['bestseller','nuevo'],
  null, null, true
),
(
  'MAN-SPYFAMILY-VOL12-AR',
  'spy-family-vol-12-ivrea',
  'Spy x Family Vol. 12',
  'manga', 'Ivrea', 'AR', 'Argentina',
  'Spy x Family', 12, 'shonen', 'es',
  'Tatsuya Endo', 45.00, 12, 'in_stock', null, null,
  'Nuevas misiones para la familia Forger',
  'Volumen 12 de Spy x Family. Loid, Yor y Anya enfrentan una nueva crisis familiar que pondrá a prueba sus secretos.',
  '{"pages":192,"dimensions":"13.5 x 19 cm","format":"Tankobon","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'comedy',
  array['bestseller','nuevo'],
  null, null, true
),
(
  'MAN-BERSERK-DELUXE3-MX',
  'berserk-edicion-deluxe-vol-3-panini',
  'Berserk Edición Deluxe Vol. 3',
  'manga', 'Panini México', 'MX', 'México',
  'Berserk', 3, 'seinen', 'es',
  'Kentaro Miura', 159.00, 4, 'in_stock', null, null,
  'Tres tomos en una edición deluxe',
  'Edición Deluxe de Berserk que recopila los tomos 7, 8 y 9 en un solo volumen de gran formato. Tapa dura, sobrecubierta con estampado especial, páginas a color. Edición Panini México.',
  '{"pages":696,"dimensions":"18 x 26 cm","weight":"1.4 kg","format":"Deluxe HC","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'seinen',
  array['deluxe','tapa-dura','premium'],
  null, null, true
),
(
  'MAN-BLEACH-VOL15-MX',
  'bleach-vol-15-panini-mexico',
  'Bleach Vol. 15',
  'manga', 'Panini México', 'MX', 'México',
  'Bleach', 15, 'shonen', 'es',
  'Tite Kubo', 38.00, 0, 'preorder', 'Fin de junio 2026', null,
  'La saga Soul Society se intensifica',
  'Continúa la saga de la Soul Society con Ichigo y compañía enfrentando a los capitanes shinigami. Edición regular Panini México.',
  '{"pages":192,"dimensions":"13.5 x 19 cm","format":"Tankobon","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'shonen',
  array['preventa'],
  null, null, true
),
(
  'MAN-FRUITS-BASKET-VOL1-ES',
  'fruits-basket-vol-1-norma',
  'Fruits Basket Vol. 1 — Edición Coleccionista',
  'manga', 'Norma Editorial', 'ES', 'España',
  'Fruits Basket', 1, 'shojo', 'es',
  'Natsuki Takaya', 55.00, 6, 'in_stock', null, null,
  'Edición coleccionista en tapa dura',
  'Primer tomo de Fruits Basket en edición coleccionista. Tapa dura, papel de calidad superior, ilustraciones a color exclusivas. Edición española de Norma Editorial.',
  '{"pages":400,"format":"HC","language":"Español"}'::jsonb,
  array['/images/placeholder.png'], 'shojo',
  array['coleccionista','tapa-dura'],
  null, null, true
)
on conflict (sku) do nothing;
