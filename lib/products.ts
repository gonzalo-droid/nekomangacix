export interface Product {
  id: string;
  title: string;
  editorial: string;
  pricePEN: number;
  stock: number;
  tags: string[];
  description: string;
  imageUrl: string;
  countryGroup: "Argentina" | "México";
}

export const products: Product[] = [
  // Editorial Argentina - Ivrea Argentina
  {
    id: "1",
    title: "Jujutsu Kaisen Vol. 1",
    editorial: "Ivrea Argentina",
    pricePEN: 45.00,
    stock: 12,
    tags: ["nuevo"],
    description: "El primer volumen de la épica serie Jujutsu Kaisen",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "2",
    title: "Chainsaw Man Vol. 2",
    editorial: "Ivrea Argentina",
    pricePEN: 48.50,
    stock: 8,
    tags: ["bestseller"],
    description: "Continúa la acción de Chainsaw Man",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "3",
    title: "My Hero Academia Vol. 5",
    editorial: "Ivrea Argentina",
    pricePEN: 42.00,
    stock: 15,
    tags: [],
    description: "Aventuras heroicas en el mundo de Academia Heroica",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "4",
    title: "Death Note Vol. 3",
    editorial: "Ivrea Argentina",
    pricePEN: 40.00,
    stock: 5,
    tags: ["clásico"],
    description: "El thriller psicológico que cambió el manga",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },

  // Editorial Argentina - Ovni Press
  {
    id: "5",
    title: "Vinland Saga Vol. 1",
    editorial: "Ovni Press",
    pricePEN: 50.00,
    stock: 10,
    tags: ["histórico"],
    description: "Una épica de vikingos y venganza",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "6",
    title: "Attack on Titan Vol. 8",
    editorial: "Ovni Press",
    pricePEN: 46.00,
    stock: 7,
    tags: ["nuevo"],
    description: "La batalla continúa contra los titanes",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "7",
    title: "Demon Slayer Vol. 1",
    editorial: "Ovni Press",
    pricePEN: 44.00,
    stock: 20,
    tags: ["bestseller"],
    description: "El comienzo de la aventura de Tanjiro",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },
  {
    id: "8",
    title: "Tokyo Ghoul Vol. 4",
    editorial: "Ovni Press",
    pricePEN: 43.50,
    stock: 6,
    tags: ["oscuro"],
    description: "El mundo subterráneo de los ghouls",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "Argentina",
  },

  // Editorial México - Panini MX
  {
    id: "9",
    title: "One Piece Vol. 100",
    editorial: "Panini MX",
    pricePEN: 52.00,
    stock: 25,
    tags: ["nuevo", "bestseller"],
    description: "El volumen 100 de la serie más popular",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "10",
    title: "Naruto Shippuden Vol. 45",
    editorial: "Panini MX",
    pricePEN: 39.00,
    stock: 18,
    tags: ["clásico"],
    description: "Aventuras ninja en el mundo de Naruto",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "11",
    title: "Black Clover Vol. 25",
    editorial: "Panini MX",
    pricePEN: 41.00,
    stock: 12,
    tags: ["acción"],
    description: "Magia y determinación en Black Clover",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "12",
    title: "The Promised Neverland Vol. 15",
    editorial: "Panini MX",
    pricePEN: 44.50,
    stock: 9,
    tags: ["suspenso"],
    description: "Misterio y escapada en The Promised Neverland",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },

  // Editorial México - Viz Media
  {
    id: "13",
    title: "Dragon Ball Super Vol. 10",
    editorial: "Viz Media México",
    pricePEN: 47.00,
    stock: 14,
    tags: ["clásico"],
    description: "Las nuevas aventuras de Goku",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "14",
    title: "Steins; Gate Manga Vol. 3",
    editorial: "Viz Media México",
    pricePEN: 49.50,
    stock: 8,
    tags: ["sci-fi"],
    description: "Viajes en el tiempo y paradojas",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "15",
    title: "Sword Art Online Vol. 12",
    editorial: "Viz Media México",
    pricePEN: 46.50,
    stock: 11,
    tags: ["preventa"],
    description: "Realidad virtual y aventuras épicas",
    imageUrl: "/product-placeholder.jpg",
    countryGroup: "México",
  },
  {
    id: "16",
    title: "Re:ZERO Vol. 5",
    editorial: "Viz Media México",
    pricePEN: 48.00,
    stock: 0,
    tags: ["preventa"],
    description: "Reencarnación y bucles temporales",
    imageUrl: "/product-placeholder.jpg",
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
