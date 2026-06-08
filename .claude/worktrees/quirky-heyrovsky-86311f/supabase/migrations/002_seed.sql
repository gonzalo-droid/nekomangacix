-- ============================================
-- Seed: 16 productos iniciales de NekoMangaCix
-- Ejecutar DESPUÉS de 001_initial.sql
-- ============================================

insert into public.products (sku, slug, title, editorial, author, price_pen, stock, stock_status, description, full_description, specifications, images, category, country_group, tags) values

('ncm-jujutsu-kaisen-vol-1', 'jujutsu-kaisen-vol-1', 'Jujutsu Kaisen Vol. 1', 'Ivrea Argentina', 'Gege Akutami', 45.00, 12, 'in_stock',
 'El primer volumen de la épica serie Jujutsu Kaisen',
 'Yuji Itadori es un estudiante con habilidades físicas excepcionales. Un día, para proteger a un compañero atacado por espíritus malditos, come un dedo de Ryomen Sukuna y se convierte en su recipiente.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-882027-1", "releaseDate": "2023-05-15", "dimensions": "13.5 x 19 cm", "weight": "180g"}',
 array['jjk-1', 'jjk-1-back'], 'shonen', 'Argentina', array['nuevo']),

('ncm-chainsaw-man-vol-2', 'ncm-chainsaw-man-vol-2', 'Chainsaw Man Vol. 2', 'Ivrea Argentina', 'Tatsuki Fujimoto', 48.50, 8, 'in_stock',
 'Continúa la acción de Chainsaw Man',
 'Denji continúa su trabajo como Cazador de Demonios junto a Aki y Power. Sin embargo, el pasado oscuro de cada uno comienza a revelar secretos perturbadores.',
 '{"pages": 200, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-882128-5", "releaseDate": "2023-06-20", "dimensions": "13.5 x 19 cm", "weight": "185g"}',
 array['csm-2'], 'shonen', 'Argentina', array['bestseller']),

('ncm-my-hero-academia-vol-5', 'ncm-my-hero-academia-vol-5', 'My Hero Academia Vol. 5', 'Ivrea Argentina', 'Kohei Horikoshi', 42.00, 15, 'in_stock',
 'Aventuras heroicas en el mundo de Academia Heroica',
 'El Festival Deportivo de U.A. está en pleno apogeo. Izuku Midoriya debe demostrar su valía frente a toda la nación.',
 '{"pages": 208, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-880606-0", "releaseDate": "2022-03-10", "dimensions": "13.5 x 19 cm", "weight": "190g"}',
 array['mha-5'], 'shonen', 'Argentina', array[]::text[]),

('ncm-death-note-vol-3', 'ncm-death-note-vol-3', 'Death Note Vol. 3', 'Ivrea Argentina', 'Tsugumi Ohba / Takeshi Obata', 40.00, 5, 'in_stock',
 'El thriller psicológico que cambió el manga',
 'La batalla de ingenio entre Light Yagami y L se intensifica. El detective más brillante del mundo está cada vez más cerca de descubrir la identidad de Kira.',
 '{"pages": 184, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-873632-5", "releaseDate": "2021-08-25", "dimensions": "13.5 x 19 cm", "weight": "175g"}',
 array['dn-3'], 'mystery', 'Argentina', array['clásico']),

('ncm-vinland-saga-vol-1', 'ncm-vinland-saga-vol-1', 'Vinland Saga Vol. 1', 'Ovni Press', 'Makoto Yukimura', 50.00, 10, 'in_stock',
 'Una épica de vikingos y venganza',
 'Thorfinn, hijo del guerrero más fuerte del norte, solo desea una cosa: vengar la muerte de su padre.',
 '{"pages": 448, "format": "Tomo Deluxe (15 x 21 cm)", "language": "Español", "isbn": "978-4-06-352814-7", "releaseDate": "2023-01-15", "dimensions": "15 x 21 cm", "weight": "380g"}',
 array['vs-1'], 'seinen', 'Argentina', array['histórico']),

('ncm-attack-on-titan-vol-8', 'ncm-attack-on-titan-vol-8', 'Attack on Titan Vol. 8', 'Ovni Press', 'Hajime Isayama', 46.00, 0, 'on_demand',
 'La batalla continúa contra los titanes',
 'El Escuadrón de Reconocimiento emprende una misión fuera de las murallas. Eren Jaeger deberá enfrentar no solo a los titanes, sino también verdades devastadoras.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-06-395468-4", "releaseDate": "2022-09-10", "dimensions": "13.5 x 19 cm", "weight": "180g"}',
 array['aot-8'], 'shonen', 'Argentina', array['a pedido']),

('ncm-demon-slayer-vol-1', 'ncm-demon-slayer-vol-1', 'Demon Slayer Vol. 1', 'Ovni Press', 'Koyoharu Gotouge', 44.00, 20, 'in_stock',
 'El comienzo de la aventura de Tanjiro',
 'Tanjiro Kamado vivía una vida pacífica en las montañas hasta que un demonio masacró a toda su familia.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-880723-4", "releaseDate": "2023-02-28", "dimensions": "13.5 x 19 cm", "weight": "178g"}',
 array['ds-1'], 'shonen', 'Argentina', array['bestseller']),

('ncm-tokyo-ghoul-vol-4', 'ncm-tokyo-ghoul-vol-4', 'Tokyo Ghoul Vol. 4', 'Ovni Press', 'Sui Ishida', 43.50, 6, 'in_stock',
 'El mundo subterráneo de los ghouls',
 'Ken Kaneki se adentra más en el mundo de los ghouls mientras lucha por mantener su humanidad.',
 '{"pages": 208, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-879597-1", "releaseDate": "2022-11-20", "dimensions": "13.5 x 19 cm", "weight": "185g"}',
 array['tg-4'], 'seinen', 'Argentina', array['oscuro']),

('ncm-one-piece-vol-100', 'ncm-one-piece-vol-100', 'One Piece Vol. 100', 'Panini MX', 'Eiichiro Oda', 52.00, 25, 'in_stock',
 'El volumen 100 de la serie más popular',
 '¡El volumen centenario de One Piece! La guerra en Onigashima alcanza su punto álgido.',
 '{"pages": 216, "format": "Tomo Especial (14 x 20 cm)", "language": "Español", "isbn": "978-4-08-882609-9", "releaseDate": "2023-09-01", "dimensions": "14 x 20 cm", "weight": "200g"}',
 array['op-100'], 'shonen', 'México', array['nuevo', 'bestseller']),

('ncm-naruto-shippuden-vol-45', 'ncm-naruto-shippuden-vol-45', 'Naruto Shippuden Vol. 45', 'Panini MX', 'Masashi Kishimoto', 39.00, 18, 'in_stock',
 'Aventuras ninja en el mundo de Naruto',
 'La Cuarta Guerra Ninja continúa con batallas épicas en todos los frentes.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-874795-6", "releaseDate": "2021-06-15", "dimensions": "13.5 x 19 cm", "weight": "175g"}',
 array['naruto-45'], 'shonen', 'México', array['clásico']),

('ncm-black-clover-vol-25', 'ncm-black-clover-vol-25', 'Black Clover Vol. 25', 'Panini MX', 'Yuki Tabata', 41.00, 12, 'in_stock',
 'Magia y determinación en Black Clover',
 'Asta y los Toros Negros continúan su batalla contra los demonios.',
 '{"pages": 200, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-882156-8", "releaseDate": "2023-04-10", "dimensions": "13.5 x 19 cm", "weight": "182g"}',
 array['bc-25'], 'shonen', 'México', array['acción']),

('ncm-the-promised-neverland-vol-15', 'ncm-the-promised-neverland-vol-15', 'The Promised Neverland Vol. 15', 'Panini MX', 'Kaiu Shirai / Posuka Demizu', 44.50, 9, 'in_stock',
 'Misterio y escapada en The Promised Neverland',
 'Emma y sus hermanos descubren más verdades sobre el mundo que los rodea.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-881426-3", "releaseDate": "2022-07-25", "dimensions": "13.5 x 19 cm", "weight": "178g"}',
 array['tpn-15'], 'mystery', 'México', array['suspenso']),

('ncm-dragon-ball-super-vol-10', 'ncm-dragon-ball-super-vol-10', 'Dragon Ball Super Vol. 10', 'Viz Media México', 'Akira Toriyama / Toyotarou', 47.00, 14, 'in_stock',
 'Las nuevas aventuras de Goku',
 'El Torneo del Poder llega a su clímax con Goku dominando el Ultra Instinto.',
 '{"pages": 192, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-08-881456-0", "releaseDate": "2023-03-20", "dimensions": "13.5 x 19 cm", "weight": "180g"}',
 array['dbs-10'], 'shonen', 'México', array['clásico']),

('ncm-steins-gate-manga-vol-3', 'ncm-steins-gate-manga-vol-3', 'Steins;Gate Manga Vol. 3', 'Viz Media México', '5pb. / Yomi Sarachi', 49.50, 0, 'on_demand',
 'Viajes en el tiempo y paradojas',
 'Okabe Rintaro continúa experimentando con la máquina del tiempo casera del Laboratorio de Gadgets del Futuro.',
 '{"pages": 180, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-04-729124-3", "releaseDate": "2022-12-05", "dimensions": "13.5 x 19 cm", "weight": "170g"}',
 array['sg-3'], 'sci-fi', 'México', array['sci-fi', 'a pedido']),

('ncm-sword-art-online-vol-12', 'ncm-sword-art-online-vol-12', 'Sword Art Online Vol. 12', 'Viz Media México', 'Reki Kawahara / abec', 46.50, 3, 'preorder',
 'Realidad virtual y aventuras épicas',
 'El arco de Alicization continúa con Kirito atrapado en el Underworld.',
 '{"pages": 200, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-04-865758-2", "releaseDate": "2024-03-15", "dimensions": "13.5 x 19 cm", "weight": "185g"}',
 array['sao-12'], 'isekai', 'México', array['preventa']),

('ncm-rezero-vol-5', 'ncm-rezero-vol-5', 'Re:ZERO Vol. 5', 'Viz Media México', 'Tappei Nagatsuki / Shinichirou Otsuka', 48.00, 0, 'preorder',
 'Reencarnación y bucles temporales',
 'Subaru Natsuki enfrenta uno de sus mayores desafíos. Los bucles temporales se vuelven cada vez más brutales.',
 '{"pages": 196, "format": "Tomo (13.5 x 19 cm)", "language": "Español", "isbn": "978-4-04-068057-9", "releaseDate": "2024-04-20", "dimensions": "13.5 x 19 cm", "weight": "182g"}',
 array['rezero-5'], 'isekai', 'México', array['preventa']);
