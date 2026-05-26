# Neko Manga Cix

Tienda de manga online para el mercado peruano. Construida con Next.js 15 App Router, Supabase, Cloudinary y Tailwind CSS 4.

## Stack

- **Next.js 15** — App Router, ISR, Server Components
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — Auth, base de datos PostgreSQL
- **Cloudinary** — Almacenamiento y optimización de imágenes
- **next-themes** — Modo oscuro/claro

## Instalación

```bash
npm install
```

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_PIN=...
GMAIL_APP_PASSWORD=...   # opcional — fallback graceful si falta
```

```bash
npm run dev   # http://localhost:3000
```

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # ESLint
```

## Estructura

```
nekomangacix/
├── app/
│   ├── auth/           # Login y registro (split-screen con collage manga)
│   ├── products/       # Grid con filtros + página de detalle [slug]
│   ├── cart/           # Carrito con integración WhatsApp
│   ├── profile/        # Datos, favoritos y pedidos del usuario
│   ├── admin/          # Panel admin (import Excel, gestión de productos)
│   ├── about/
│   ├── contact/
│   ├── faq/
│   ├── shipping/
│   ├── terms/
│   └── privacy/
├── components/         # Wordmark, ProductCard, Hero, PageHero, etc.
├── context/            # CartContext, FavoritesContext (localStorage)
├── hooks/              # useProducts, useDebouncedValue
├── lib/
│   ├── products.ts     # Tipos e interfaz Product
│   ├── productMappers.ts  # DB row → Product
│   ├── productsServer.ts  # Fetch server-side (ISR)
│   ├── cloudinary.ts   # Resolución de URLs de imágenes
│   └── excelParser.ts  # Importación desde Excel
└── supabase/
    └── migrations/     # SQL migrations
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero y secciones de productos destacados |
| `/products` | Grid con filtros por editorial, precio y stock (Server Component, ISR 5 min) |
| `/products/[slug]` | Detalle de producto |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro de cuenta |
| `/cart` | Carrito con pedido automático por WhatsApp (+51 924 462 641) |
| `/profile` | Perfil: datos personales, favoritos y pedidos |
| `/admin` | Panel admin: import Excel, upload Cloudinary, gestión de productos |

## Modelo de Producto

```typescript
interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  editorial: string;
  author: string;
  pricePEN: number;
  stock: number;
  stockStatus: 'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock';
  volume?: number;
  series?: string;
  seriesStatus?: 'single' | 'ongoing' | 'completed';
  category: Category;         // 16 géneros manga
  countryGroup: 'Argentina' | 'México' | 'España' | 'Japón';
  images: string[];
  tags: string[];
  description: string;
  fullDescription: string;
  specifications: { pages?, format?, language?, isbn?, releaseDate?, dimensions?, weight? };
  estimatedArrival?: string;
  preorderDeposit?: number;
}
```

## Base de Datos (Supabase)

Tablas principales: `products`, `profiles`, `orders`, `order_items`.

Para aplicar las migraciones en un proyecto nuevo, ejecuta en orden los archivos de `supabase/migrations/`.

## Imágenes (Cloudinary)

Las imágenes se referencian como public IDs de Cloudinary bajo la carpeta `neko-manga/products`. El helper `getCloudinaryUrl()` resuelve public IDs, rutas locales y URLs completas.

Upload disponible en `/admin` o vía la API route `POST /api/cloudinary/upload`.

---

Neko Manga Cix — Manga original para Perú
