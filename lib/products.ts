export type StockStatus = 'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock';
export type Category = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kodomo' | 'isekai' | 'slice_of_life' | 'horror' | 'romance' | 'action' | 'comedy' | 'drama' | 'fantasy' | 'sci-fi' | 'sports' | 'mystery';

export interface Product {
  id: string;
  sku: string;
  title: string;
  editorial: string;
  author: string;
  pricePEN: number;
  stock: number;
  stockStatus: StockStatus;
  estimatedArrival?: string; // Fecha estimada para on_demand o preorder
  preorderDeposit?: number; // Monto de reserva para preventa
  tags: string[];
  description: string;
  fullDescription: string;
  specifications: {
    pages?: number;
    format?: string;
    language?: string;
    isbn?: string;
    releaseDate?: string;
    dimensions?: string;
    weight?: string;
  };
  images: string[];
  category: Category;
  countryGroup: "Argentina" | "México";
}

export const products: Product[] = [
  // Editorial Argentina - Ivrea Argentina
  {
    id: "1",
    sku: "NMC-JJK-001",
    title: "Jujutsu Kaisen Vol. 1",
    editorial: "Ivrea Argentina",
    author: "Gege Akutami",
    pricePEN: 45.00,
    stock: 12,
    stockStatus: "in_stock",
    tags: ["nuevo"],
    description: "El primer volumen de la épica serie Jujutsu Kaisen",
    fullDescription: "Yuji Itadori es un estudiante con habilidades físicas excepcionales. Un día, para proteger a un compañero atacado por espíritus malditos, come un dedo de Ryomen Sukuna y se convierte en su recipiente. Ahora, bajo la tutela de Satoru Gojo, deberá aprender a controlar esta maldición mientras busca los dedos restantes de Sukuna.",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-882027-1",
      releaseDate: "2023-05-15",
      dimensions: "13.5 x 19 cm",
      weight: "180g"
    },
    images: ["/images/products/jjk-1.jpg", "/images/products/jjk-1-back.jpg"],
    category: "shonen",
    countryGroup: "Argentina",
  },
  {
    id: "2",
    sku: "NMC-CSM-002",
    title: "Chainsaw Man Vol. 2",
    editorial: "Ivrea Argentina",
    author: "Tatsuki Fujimoto",
    pricePEN: 48.50,
    stock: 8,
    stockStatus: "in_stock",
    tags: ["bestseller"],
    description: "Continúa la acción de Chainsaw Man",
    fullDescription: "Denji continúa su trabajo como Cazador de Demonios junto a Aki y Power. Sin embargo, el pasado oscuro de cada uno comienza a revelar secretos perturbadores. La Agencia de Seguridad Pública tiene sus propios planes para el joven que puede transformarse en el temible Chainsaw Man.",
    specifications: {
      pages: 200,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-882128-5",
      releaseDate: "2023-06-20",
      dimensions: "13.5 x 19 cm",
      weight: "185g"
    },
    images: ["/images/products/csm-2.jpg"],
    category: "shonen",
    countryGroup: "Argentina",
  },
  {
    id: "3",
    sku: "NMC-MHA-005",
    title: "My Hero Academia Vol. 5",
    editorial: "Ivrea Argentina",
    author: "Kohei Horikoshi",
    pricePEN: 42.00,
    stock: 15,
    stockStatus: "in_stock",
    tags: [],
    description: "Aventuras heroicas en el mundo de Academia Heroica",
    fullDescription: "El Festival Deportivo de U.A. está en pleno apogeo. Izuku Midoriya debe demostrar su valía frente a toda la nación y superar a sus compañeros con poderes increíbles. Es la oportunidad perfecta para mostrar el resultado de su entrenamiento con All Might.",
    specifications: {
      pages: 208,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-880606-0",
      releaseDate: "2022-03-10",
      dimensions: "13.5 x 19 cm",
      weight: "190g"
    },
    images: ["/images/products/mha-5.jpg"],
    category: "shonen",
    countryGroup: "Argentina",
  },
  {
    id: "4",
    sku: "NMC-DN-003",
    title: "Death Note Vol. 3",
    editorial: "Ivrea Argentina",
    author: "Tsugumi Ohba / Takeshi Obata",
    pricePEN: 40.00,
    stock: 5,
    stockStatus: "in_stock",
    tags: ["clásico"],
    description: "El thriller psicológico que cambió el manga",
    fullDescription: "La batalla de ingenio entre Light Yagami y L se intensifica. El detective más brillante del mundo está cada vez más cerca de descubrir la identidad de Kira. Light debe usar toda su astucia para mantener su doble vida mientras elimina a los criminales que considera indignos de vivir.",
    specifications: {
      pages: 184,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-873632-5",
      releaseDate: "2021-08-25",
      dimensions: "13.5 x 19 cm",
      weight: "175g"
    },
    images: ["/images/products/dn-3.jpg"],
    category: "mystery",
    countryGroup: "Argentina",
  },
  {
    id: "5",
    sku: "NMC-VS-001",
    title: "Vinland Saga Vol. 1",
    editorial: "Ovni Press",
    author: "Makoto Yukimura",
    pricePEN: 50.00,
    stock: 10,
    stockStatus: "in_stock",
    tags: ["histórico"],
    description: "Una épica de vikingos y venganza",
    fullDescription: "Thorfinn, hijo del guerrero más fuerte del norte, solo desea una cosa: vengar la muerte de su padre. Para ello, deberá seguir a Askeladd, el hombre responsable de su tragedia, a través de campos de batalla ensangrentados en la era vikinga. Una historia épica de guerra, honor y redención.",
    specifications: {
      pages: 448,
      format: "Tomo Deluxe (15 x 21 cm)",
      language: "Español",
      isbn: "978-4-06-352814-7",
      releaseDate: "2023-01-15",
      dimensions: "15 x 21 cm",
      weight: "380g"
    },
    images: ["/images/products/vs-1.jpg"],
    category: "seinen",
    countryGroup: "Argentina",
  },
  {
    id: "6",
    sku: "NMC-AOT-008",
    title: "Attack on Titan Vol. 8",
    editorial: "Ovni Press",
    author: "Hajime Isayama",
    pricePEN: 46.00,
    stock: 0,
    stockStatus: "on_demand",
    estimatedArrival: "2-3 semanas",
    tags: ["a pedido"],
    description: "La batalla continúa contra los titanes",
    fullDescription: "El Escuadrón de Reconocimiento emprende una misión fuera de las murallas. Eren Jaeger deberá enfrentar no solo a los titanes, sino también verdades devastadoras sobre su propia existencia. La revelación de la titán hembra cambiará todo lo que creían saber.",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-06-395468-4",
      releaseDate: "2022-09-10",
      dimensions: "13.5 x 19 cm",
      weight: "180g"
    },
    images: ["/images/products/aot-8.jpg"],
    category: "shonen",
    countryGroup: "Argentina",
  },
  {
    id: "7",
    sku: "NMC-DS-001",
    title: "Demon Slayer Vol. 1",
    editorial: "Ovni Press",
    author: "Koyoharu Gotouge",
    pricePEN: 44.00,
    stock: 20,
    stockStatus: "in_stock",
    tags: ["bestseller"],
    description: "El comienzo de la aventura de Tanjiro",
    fullDescription: "Tanjiro Kamado vivía una vida pacífica en las montañas hasta que un demonio masacró a toda su familia. Solo su hermana Nezuko sobrevivió, pero fue convertida en demonio. Ahora Tanjiro debe entrenar como cazador de demonios para encontrar una cura y vengar a su familia.",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-880723-4",
      releaseDate: "2023-02-28",
      dimensions: "13.5 x 19 cm",
      weight: "178g"
    },
    images: ["/images/products/ds-1.jpg"],
    category: "shonen",
    countryGroup: "Argentina",
  },
  {
    id: "8",
    sku: "NMC-TG-004",
    title: "Tokyo Ghoul Vol. 4",
    editorial: "Ovni Press",
    author: "Sui Ishida",
    pricePEN: 43.50,
    stock: 6,
    stockStatus: "in_stock",
    tags: ["oscuro"],
    description: "El mundo subterráneo de los ghouls",
    fullDescription: "Ken Kaneki se adentra más en el mundo de los ghouls mientras lucha por mantener su humanidad. La organización Anteiku le ha dado refugio, pero las investigaciones del CCG se acercan peligrosamente. Kaneki deberá elegir entre dos mundos que parecen incompatibles.",
    specifications: {
      pages: 208,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-879597-1",
      releaseDate: "2022-11-20",
      dimensions: "13.5 x 19 cm",
      weight: "185g"
    },
    images: ["/images/products/tg-4.jpg"],
    category: "seinen",
    countryGroup: "Argentina",
  },
  {
    id: "9",
    sku: "NMC-OP-100",
    title: "One Piece Vol. 100",
    editorial: "Panini MX",
    author: "Eiichiro Oda",
    pricePEN: 52.00,
    stock: 25,
    stockStatus: "in_stock",
    tags: ["nuevo", "bestseller"],
    description: "El volumen 100 de la serie más popular",
    fullDescription: "¡El volumen centenario de One Piece! La guerra en Onigashima alcanza su punto álgido mientras Luffy y sus aliados se enfrentan a Kaido y Big Mom. Este tomo conmemorativo incluye momentos icónicos que han definido una era del manga shonen.",
    specifications: {
      pages: 216,
      format: "Tomo Especial (14 x 20 cm)",
      language: "Español",
      isbn: "978-4-08-882609-9",
      releaseDate: "2023-09-01",
      dimensions: "14 x 20 cm",
      weight: "200g"
    },
    images: ["/images/products/op-100.jpg"],
    category: "shonen",
    countryGroup: "México",
  },
  {
    id: "10",
    sku: "NMC-NRT-045",
    title: "Naruto Shippuden Vol. 45",
    editorial: "Panini MX",
    author: "Masashi Kishimoto",
    pricePEN: 39.00,
    stock: 18,
    stockStatus: "in_stock",
    tags: ["clásico"],
    description: "Aventuras ninja en el mundo de Naruto",
    fullDescription: "La Cuarta Guerra Ninja continúa con batallas épicas en todos los frentes. Naruto debe enfrentar a enemigos del pasado resucitados mediante el Edo Tensei. El destino del mundo shinobi pende de un hilo mientras los secretos de los Uchiha salen a la luz.",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-874795-6",
      releaseDate: "2021-06-15",
      dimensions: "13.5 x 19 cm",
      weight: "175g"
    },
    images: ["/images/products/naruto-45.jpg"],
    category: "shonen",
    countryGroup: "México",
  },
  {
    id: "11",
    sku: "NMC-BC-025",
    title: "Black Clover Vol. 25",
    editorial: "Panini MX",
    author: "Yuki Tabata",
    pricePEN: 41.00,
    stock: 12,
    stockStatus: "in_stock",
    tags: ["acción"],
    description: "Magia y determinación en Black Clover",
    fullDescription: "Asta y los Toros Negros continúan su batalla contra los demonios. A pesar de no tener magia, Asta demuestra que la determinación y el trabajo duro pueden superar cualquier limitación. Nuevas alianzas se forman mientras el Reino del Trébol se prepara para lo peor.",
    specifications: {
      pages: 200,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-882156-8",
      releaseDate: "2023-04-10",
      dimensions: "13.5 x 19 cm",
      weight: "182g"
    },
    images: ["/images/products/bc-25.jpg"],
    category: "shonen",
    countryGroup: "México",
  },
  {
    id: "12",
    sku: "NMC-TPN-015",
    title: "The Promised Neverland Vol. 15",
    editorial: "Panini MX",
    author: "Kaiu Shirai / Posuka Demizu",
    pricePEN: 44.50,
    stock: 9,
    stockStatus: "in_stock",
    tags: ["suspenso"],
    description: "Misterio y escapada en The Promised Neverland",
    fullDescription: "Emma y sus hermanos descubren más verdades sobre el mundo que los rodea. La búsqueda de los Siete Muros continúa mientras enfrentan a demonios y humanos por igual. ¿Podrán encontrar la manera de cambiar el destino de todos los niños de las granjas?",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-881426-3",
      releaseDate: "2022-07-25",
      dimensions: "13.5 x 19 cm",
      weight: "178g"
    },
    images: ["/images/products/tpn-15.jpg"],
    category: "mystery",
    countryGroup: "México",
  },
  {
    id: "13",
    sku: "NMC-DBS-010",
    title: "Dragon Ball Super Vol. 10",
    editorial: "Viz Media México",
    author: "Akira Toriyama / Toyotarou",
    pricePEN: 47.00,
    stock: 14,
    stockStatus: "in_stock",
    tags: ["clásico"],
    description: "Las nuevas aventuras de Goku",
    fullDescription: "El Torneo del Poder llega a su clímax con Goku dominando el Ultra Instinto. El Universo 7 lucha por su supervivencia contra guerreros de otros universos. Jiren, el guerrero más fuerte, se interpone entre Goku y la victoria final.",
    specifications: {
      pages: 192,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-08-881456-0",
      releaseDate: "2023-03-20",
      dimensions: "13.5 x 19 cm",
      weight: "180g"
    },
    images: ["/images/products/dbs-10.jpg"],
    category: "shonen",
    countryGroup: "México",
  },
  {
    id: "14",
    sku: "NMC-SG-003",
    title: "Steins; Gate Manga Vol. 3",
    editorial: "Viz Media México",
    author: "5pb. / Yomi Sarachi",
    pricePEN: 49.50,
    stock: 0,
    stockStatus: "on_demand",
    estimatedArrival: "3-4 semanas",
    tags: ["sci-fi", "a pedido"],
    description: "Viajes en el tiempo y paradojas",
    fullDescription: "Okabe Rintaro continúa experimentando con la máquina del tiempo casera del Laboratorio de Gadgets del Futuro. Cada mensaje al pasado altera el presente de formas inesperadas. ¿Podrá encontrar la línea temporal donde puede salvar a todos los que ama?",
    specifications: {
      pages: 180,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-04-729124-3",
      releaseDate: "2022-12-05",
      dimensions: "13.5 x 19 cm",
      weight: "170g"
    },
    images: ["/images/products/sg-3.jpg"],
    category: "sci-fi",
    countryGroup: "México",
  },
  {
    id: "15",
    sku: "NMC-SAO-012",
    title: "Sword Art Online Vol. 12",
    editorial: "Viz Media México",
    author: "Reki Kawahara / abec",
    pricePEN: 46.50,
    stock: 3,
    stockStatus: "preorder",
    estimatedArrival: "15 de Marzo 2024",
    preorderDeposit: 10.00,
    tags: ["preventa"],
    description: "Realidad virtual y aventuras épicas",
    fullDescription: "El arco de Alicization continúa con Kirito atrapado en el Underworld. Alice Synthesis Thirty se une a él en una misión para llegar a la torre central. Mientras tanto, en el mundo real, sus amigos luchan por mantenerlo con vida.",
    specifications: {
      pages: 200,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-04-865758-2",
      releaseDate: "2024-03-15",
      dimensions: "13.5 x 19 cm",
      weight: "185g"
    },
    images: ["/images/products/sao-12.jpg"],
    category: "isekai",
    countryGroup: "México",
  },
  {
    id: "16",
    sku: "NMC-RZ-005",
    title: "Re:ZERO Vol. 5",
    editorial: "Viz Media México",
    author: "Tappei Nagatsuki / Shinichirou Otsuka",
    pricePEN: 48.00,
    stock: 0,
    stockStatus: "preorder",
    estimatedArrival: "20 de Abril 2024",
    preorderDeposit: 10.00,
    tags: ["preventa"],
    description: "Reencarnación y bucles temporales",
    fullDescription: "Subaru Natsuki enfrenta uno de sus mayores desafíos. Los bucles temporales se vuelven cada vez más brutales mientras intenta proteger a Emilia y descubrir los secretos de la Bruja de la Envidia. Cada muerte es un nuevo comienzo lleno de dolor y desesperación.",
    specifications: {
      pages: 196,
      format: "Tomo (13.5 x 19 cm)",
      language: "Español",
      isbn: "978-4-04-068057-9",
      releaseDate: "2024-04-20",
      dimensions: "13.5 x 19 cm",
      weight: "182g"
    },
    images: ["/images/products/rezero-5.jpg"],
    category: "isekai",
    countryGroup: "México",
  },
];

export function getProductsByEditorial(editorial: string): Product[] {
  return products.filter((p) => p.editorial === editorial);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.editorial.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}

export function filterProducts(
  query?: string,
  editorial?: string,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean
): Product[] {
  let filtered = [...products];

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.editorial.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (editorial) {
    filtered = filtered.filter((p) => p.editorial === editorial);
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.pricePEN >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.pricePEN <= maxPrice);
  }

  if (inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  return filtered;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAllEditorials(): string[] {
  return Array.from(new Set(products.map((p) => p.editorial))).sort();
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  // Get products from same category or editorial, excluding current product
  return products
    .filter(p => p.id !== productId && (p.category === product.category || p.editorial === product.editorial))
    .slice(0, limit);
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    shonen: 'Shonen',
    seinen: 'Seinen',
    shojo: 'Shojo',
    josei: 'Josei',
    kodomo: 'Kodomo',
    isekai: 'Isekai',
    slice_of_life: 'Slice of Life',
    horror: 'Horror',
    romance: 'Romance',
    action: 'Acción',
    comedy: 'Comedia',
    drama: 'Drama',
    fantasy: 'Fantasía',
    'sci-fi': 'Ciencia Ficción',
    sports: 'Deportes',
    mystery: 'Misterio'
  };
  return labels[category] || category;
}

export function getStockStatusLabel(status: StockStatus): { label: string; color: string } {
  const statusInfo: Record<StockStatus, { label: string; color: string }> = {
    in_stock: { label: 'En Stock', color: 'text-green-600' },
    on_demand: { label: 'A Pedido', color: 'text-orange-600' },
    preorder: { label: 'Preventa', color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado', color: 'text-red-600' }
  };
  return statusInfo[status];
}
