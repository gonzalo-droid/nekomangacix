# Neko Manga Cix - Tienda de Manga Online

Una aplicación e-commerce moderna de manga construida con **Next.js 16**, **TypeScript**, **Tailwind CSS** y **React Context** para gestión de estado.

## Características

- ✨ **Diseño moderno y responsivo** - Mobile-first con Tailwind CSS
- 🛒 **Carrito de compras funcional** - Con persistencia en localStorage
- 🔍 **Búsqueda y filtros** - Por editorial, precio, disponibilidad
- 📱 **Header sticky** - Navegación siempre visible
- 💬 **Integración WhatsApp** - Para consultas y pedidos
- ♿ **Accesibilidad** - HTML semántico, labels ARIA, navegación por teclado
- 🇪🇸 **Contenido en español** - Precios en soles peruanos (S/)

## Instalación Rápida

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará en **http://localhost:3000**

## Estructura del Proyecto

```
nekomangacix/
├── app/                        # App Router pages
│   ├── layout.tsx              # Layout global
│   ├── page.tsx                # Home
│   ├── products/page.tsx       # Productos
│   ├── cart/page.tsx           # Carrito
│   ├── about/page.tsx          # Nosotros
│   └── contact/page.tsx        # Contacto
├── components/                 # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── Filters.tsx
│   └── WhatsAppFloatingButton.tsx
├── context/
│   └── CartContext.tsx         # Estado del carrito
├── lib/
│   └── products.ts             # Mock data
└── package.json
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio - Hero, secciones editoriales |
| `/products` | Grid de productos con filtros y búsqueda |
| `/cart` | Carrito de compras |
| `/about` | Información de la tienda (Nosotros) |
| `/contact` | Formulario de contacto |

## Características Principales

### 🛒 Carrito (CartContext)
- Persistencia en localStorage
- Hook `useCart()` para acceso global
- Funciones: add, remove, update, clear

### 🔍 Búsqueda y Filtros
- Búsqueda por nombre/editorial
- Filtro por editorial
- Rango de precio
- Stock disponible
- URL params para compartir búsquedas

### 📦 Productos
- 16 productos mock
- Editoriales: Argentina (Ivrea, Ovni) y México (Panini, Viz)
- Tags: nuevo, bestseller, clásico, etc.
- Placeholders con emojis

### ♿ Accesibilidad
- Etiquetas ARIA en inputs/buttons
- HTML semántico
- Navegación por teclado
- Alto contraste

### 💬 WhatsApp
- Botón flotante en todas las páginas
- Números pre-llenados: +51 924 462 641
- Carrito integrado con pedido automático

## Datos de Productos

```typescript
{
  id: "1",
  title: "Jujutsu Kaisen Vol. 1",
  editorial: "Ivrea Argentina",
  pricePEN: 45.00,
  stock: 12,
  tags: ["nuevo"],
  description: "...",
  imageUrl: "...",
  countryGroup: "Argentina"
}
```

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build
npm start        # Producción
npm run lint     # Linting
```

## Tecnologías

- **Next.js** 16 (App Router)
- **React** 19
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (iconos)
- **Context API** (estado)

## Notas

- Precios en S/ (soles peruanos)
- Envío base: S/ 20.00
- Mock data - sin backend real
- Imágenes placeholders (emojis)
- Mensajes de contacto simulados

## Mejoras Futuras

- Backend real
- Autenticación
- Base de datos
- Pasarela de pago
- Imágenes reales
- Reseñas
- Favoritos

## Licencia

MIT

---

🐱 **Neko Manga Cix** - Tienda de manga online 2024
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
