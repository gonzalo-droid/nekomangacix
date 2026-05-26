# 🐱 NEKO MANGA CIX - ARQUITECTURA DEL PROYECTO

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEKO MANGA CIX                              │
│                    (Next.js 16 App)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            Pages          Components      Context
        (App Router)       (Reusable)    (State Mgmt)
            │             │             │
    ┌───────┴────────┐   ├─ Header  ┌─ CartContext
    │                │   ├─ Footer  │  ├─ addToCart
    ├─ /             │   ├─ ProductCard│  ├─ removeFromCart
    ├─ /products     │   ├─ Filters    │  ├─ updateQuantity
    ├─ /cart         │   └─ WhatsAppBtn│  └─ getTotalPrice
    ├─ /about        │
    └─ /contact      │
                     │
                  Global Layout
                  (Header, Footer, WhatsApp)
                     │
                  CartProvider
                     │
                  localStorage
```

---

## 🔄 Flujo de Datos

```
User Action
    │
    ├─ Click "Agregar al carrito"
    │  └─ addToCart(id, title, price, editorial)
    │     └─ CartContext.items updated
    │        └─ Header badge updates
    │           └─ localStorage saved
    │
    ├─ Ir a /cart
    │  └─ useCart() hook
    │     └─ Mostrar items
    │        └─ Calcular totales
    │
    └─ Click "Finalizar por WhatsApp"
       └─ Generate message con items + total
          └─ Open wa.me link
             └─ Chat pre-filled
```

---

## 📋 Componentes y Props

### Header
```
Header
├─ Props: (none - usa useCart)
├─ State: mobileMenuOpen, searchOpen, searchQuery
├─ Children:
│  ├─ Logo/Link → /
│  ├─ Nav Links (Desktop)
│  ├─ Search Input
│  ├─ Cart Icon (badge)
│  ├─ Mobile Menu Button
│  └─ Mobile Menu
└─ Global: Sticky, Z-50
```

### ProductCard
```
ProductCard
├─ Props:
│  ├─ id: string
│  ├─ title: string
│  ├─ editorial: string
│  ├─ pricePEN: number
│  ├─ stock: number
│  ├─ tags: string[]
│  └─ description: string
├─ State: addedToCart (feedback)
├─ Actions:
│  └─ handleAddToCart → useCart().addToCart()
└─ Display:
   ├─ Emoji placeholder
   ├─ Tags
   ├─ Stock status
   └─ Button feedback
```

### Filters
```
Filters
├─ Props:
│  ├─ onSearch: (query) => void
│  ├─ onEditorialChange: (editorial) => void
│  ├─ onPriceChange: (min, max) => void
│  ├─ onStockChange: (inStockOnly) => void
│  └─ editorials: string[]
├─ State: All filters + expandedSection
├─ Features:
│  ├─ Collapsible sections
│  ├─ Clear filters button
│  └─ Real-time updates
└─ Updates URL params
```

### CartContext
```
CartContext
├─ State:
│  └─ items: CartItem[]
├─ Hooks:
│  └─ localStorage persistence
├─ Functions:
│  ├─ addToCart(id, title, price, editorial)
│  ├─ removeFromCart(id)
│  ├─ updateQuantity(id, qty)
│  ├─ clearCart()
│  ├─ getTotalItems()
│  └─ getTotalPrice()
└─ Provider:
   └─ Envuelve toda la app
```

---

## 📊 Estructura de Datos

### Product
```typescript
{
  id: "1",
  title: "Jujutsu Kaisen Vol. 1",
  editorial: "Ivrea Argentina",
  pricePEN: 45.00,
  stock: 12,
  tags: ["nuevo"],
  description: "El primer volumen...",
  imageUrl: "/placeholder.jpg",
  countryGroup: "Argentina"
}
```

### CartItem
```typescript
{
  productId: "1",
  title: "Jujutsu Kaisen Vol. 1",
  price: 45.00,
  quantity: 2,
  editorial: "Ivrea Argentina"
}
```

### CartState
```typescript
{
  items: CartItem[],                    // [...]
  addToCart: Function,
  removeFromCart: Function,
  updateQuantity: Function,
  clearCart: Function,
  getTotalItems: Function,
  getTotalPrice: Function
}
```

---

## 🗂️ File Tree Completo

```
nekomangacix/
│
├── app/                              # App Router (Next.js)
│   ├── layout.tsx                   # Root layout + providers
│   │   ├─ CartProvider
│   │   ├─ Header
│   │   ├─ Main (children)
│   │   ├─ Footer
│   │   └─ WhatsAppFloatingButton
│   │
│   ├── page.tsx                     # Home page
│   │   ├─ Hero section
│   │   ├─ Editorial Argentina
│   │   ├─ Editorial México
│   │   ├─ CTA
│   │   └─ Features
│   │
│   ├── globals.css                  # Tailwind imports
│   │
│   ├── products/
│   │   └── page.tsx                # Products page
│   │       ├─ Suspense boundary
│   │       ├─ Filters sidebar
│   │       ├─ Products grid
│   │       └─ Pagination
│   │
│   ├── cart/
│   │   └── page.tsx                # Cart page
│   │       ├─ Items list
│   │       ├─ Item quantity controls
│   │       ├─ Remove buttons
│   │       ├─ Summary
│   │       └─ WhatsApp checkout
│   │
│   ├── about/
│   │   └── page.tsx                # About page
│   │       ├─ Company info
│   │       ├─ Mission & values
│   │       ├─ Services
│   │       └─ Contact CTA
│   │
│   └── contact/
│       └── page.tsx                # Contact page
│           ├─ Contact form
│           ├─ Validation
│           ├─ Contact info
│           └─ FAQ
│
├── components/                       # Reusable components
│   ├── Header.tsx
│   │   ├─ Logo
│   │   ├─ Nav links
│   │   ├─ Search
│   │   ├─ Cart badge
│   │   └─ Mobile menu
│   │
│   ├── Footer.tsx
│   │   ├─ Quick links
│   │   ├─ Contact info
│   │   ├─ Social links
│   │   └─ Copyright
│   │
│   ├── ProductCard.tsx
│   │   ├─ Image placeholder
│   │   ├─ Tags
│   │   ├─ Title
│   │   ├─ Price
│   │   ├─ Stock status
│   │   └─ Add to cart button
│   │
│   ├── Filters.tsx
│   │   ├─ Search input
│   │   ├─ Editorial select
│   │   ├─ Price range
│   │   ├─ Stock filter
│   │   └─ Clear button
│   │
│   └── WhatsAppFloatingButton.tsx
│       └─ Floating button
│           └─ Opens WhatsApp
│
├── context/
│   └── CartContext.tsx              # State management
│       ├─ CartProvider component
│       ├─ useCart hook
│       ├─ localStorage persistence
│       └─ Cart operations
│
├── lib/
│   └── products.ts                  # Mock data
│       ├─ Product interface
│       ├─ 16 mock products
│       ├─ filterProducts()
│       ├─ searchProducts()
│       ├─ getProductsByEditorial()
│       ├─ getProductById()
│       └─ getAllEditorials()
│
├── public/                           # Static files
│   └── (favicon, etc)
│
├── node_modules/                     # Dependencies
│
├── .next/                           # Build output
│
├── Config files
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.ts           # Tailwind config
│   ├── next.config.ts               # Next.js config
│   ├── postcss.config.mjs           # PostCSS config
│   └── eslint.config.mjs            # ESLint config
│
└── Documentation
    ├── README.md                    # Quick start
    ├── RESUMEN_EJECUTIVO.md         # Executive summary
    ├── PROYECTO_COMPLETADO.md       # Technical details
    ├── EJEMPLOS_CODIGO.md           # Code snippets
    ├── TESTING.md                   # Testing checklist
    └── DEPLOYMENT.md                # Deployment guide
```

---

## 🔌 Routing Map

```
/
├─ GET → app/page.tsx
├─ Metadata: title, description
├─ Components: Header, Footer, WhatsAppBtn
└─ Features: Hero, Editoriales, Features

/products
├─ GET → app/products/page.tsx
├─ Suspense: useSearchParams hook
├─ Components: Filters, ProductCard, Pagination
├─ Query Params: search, editorial, min/max price
└─ Features: Grid, Filtrado, Búsqueda

/products?search=jujutsu
└─ Redirige con parámetros pre-llenados

/cart
├─ GET → app/cart/page.tsx
├─ Components: CartItems, Summary, WhatsApp button
├─ Context: useCart() para items
└─ Features: +/-, remove, checkout

/about
├─ GET → app/about/page.tsx
├─ Metadata: About Neko Manga
├─ Components: Hero, Info, Services, Contact
└─ Features: Misión, Valores, Ubicación

/contact
├─ GET → app/contact/page.tsx
├─ Metadata: Contacto
├─ Components: Form, Contact Info, FAQ
└─ Features: Validación, Éxito, Info contacto

/404
└─ Not found page (automática)
```

---

## 🔐 Security & Performance

### Security
```
✓ No direct database access
✓ Input validation (email regex)
✓ XSS prevention (React escaping)
✓ CORS ready (for future API)
✓ HTTPS recommended
```

### Performance
```
✓ Code splitting (App Router)
✓ Image optimization (next/image)
✓ CSS minification (Tailwind)
✓ JS tree shaking
✓ Lazy loading components
✓ localStorage caching
```

### Accessibility
```
✓ Semantic HTML
✓ ARIA labels
✓ Keyboard navigation
✓ Color contrast
✓ Alt text ready
```

---

## 🔄 Data Flow Diagram

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Next.js    │
                    │  App Router │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Server Side        Client Side       Static
   - Layouts          - useCart()       - Products
   - SSG Pages        - useSearchParams - Config
   - Metadata         - State           - Styles
                      - Interactivity
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ localStorage │
                    │  (Carrito)    │
                    └───────────────┘
```

---

## 🚀 Deployment Architecture

```
Local Development
├─ npm run dev (PORT 3000)
└─ localhost:3000

Build Process
├─ npm run build
├─ TypeScript compilation
├─ Next.js optimization
├─ Tailwind CSS minification
└─ .next/ folder (production)

Production Options
├─ Vercel (Recommended)
│  └─ Auto-deploy from GitHub
├─ Docker
│  └─ Containerized deployment
├─ AWS EC2/Amplify
│  └─ Self-hosted option
└─ Railway/DigitalOcean
   └─ PaaS option
```

---

## 📈 Escalabilidad Futura

```
Current State
└─ Frontend only (static/mock data)

Phase 1: Backend Integration
├─ Node.js API server
├─ PostgreSQL database
└─ Authentication

Phase 2: E-Commerce Features
├─ Payment gateway (Stripe)
├─ Order management
└─ User accounts

Phase 3: Advanced Features
├─ Admin dashboard
├─ Analytics
├─ Email notifications
└─ Recommendations
```

---

## 💾 Database Schema (Future)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password HASH,
  name VARCHAR,
  created_at TIMESTAMP
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  title VARCHAR,
  editorial VARCHAR,
  price_pen DECIMAL,
  stock INT,
  description TEXT,
  tags ARRAY,
  country_group VARCHAR
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  total DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP,
  items JSON
);

-- Cart (current - localStorage)
-- Will migrate to database if needed
```

---

## 🎯 Key Metrics

```
Performance
├─ Load time: <2s
├─ Lighthouse: 90+
└─ Core Web Vitals: Good

Accessibility
├─ WCAG 2.1 AA: ✓
├─ Keyboard nav: ✓
└─ Screen reader: ✓

SEO
├─ Meta tags: ✓
├─ Structured data: Ready
└─ Mobile friendly: ✓

Users
├─ Responsive: All devices
├─ Intuitive: 3-click navigation
└─ Fast: Instant feedback
```

---

**🐱 NEKO MANGA CIX** - Arquitectura Completa

Proyecto profesional listo para escalar 🚀
