# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

## Architecture

This is a Next.js 15 App Router manga e-commerce store for the Peruvian market ("Neko Manga Cix"). It uses React 19, TypeScript, and Tailwind CSS 4.

### Data Flow

**Product data** lives in [lib/products.ts](lib/products.ts) as a static array. The admin panel allows importing products from Excel (via [lib/excelParser.ts](lib/excelParser.ts)) and saving them to `localStorage` under key `'neko-manga-uploaded-products'`. At runtime, products from localStorage are merged with the static array.

**Images** are hosted on Cloudinary. [lib/cloudinary.ts](lib/cloudinary.ts) resolves image references — which can be local paths (`/images/...`), Cloudinary public IDs, or full URLs — into Cloudinary URLs using the folder `neko-manga/products`. Uploads go through the API route at [app/api/cloudinary/upload/route.ts](app/api/cloudinary/upload/route.ts).

**Cart and favorites** use React Context ([context/CartContext.tsx](context/CartContext.tsx), [context/FavoritesContext.tsx](context/FavoritesContext.tsx)) backed by localStorage.

### Product Type

The `Product` interface (in [lib/products.ts](lib/products.ts)) includes:
- `stockStatus`: `'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock'`
- `category`: 16 manga genres (shonen, seinen, shojo, etc.)
- `countryGroup`: `'Argentina' | 'México'` (editorial sourcing origin)
- `pricePEN`: price in Peruvian Soles
- `slug`: generated from title via `generateSlug()`

### Key Pages

- `/` — Homepage with hero and featured product sections
- `/products` — Product grid with search/filter (by editorial, price, stock); filters sync to URL params
- `/products/[slug]` — Dynamic product detail page
- `/admin` — Admin panel: Excel import, Cloudinary image upload, localStorage management
- `/cart` — Cart with WhatsApp order integration (pre-filled message to +51 924 462 641)

### Theme

Dark/light mode via `next-themes`, toggled via [components/ThemeToggle.tsx](components/ThemeToggle.tsx) and applied in the root layout.
