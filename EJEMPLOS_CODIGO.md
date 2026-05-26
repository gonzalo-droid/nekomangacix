# Neko Manga Cix - Ejemplos de Código

## 1. Hook useCart() - Uso

```typescript
import { useCart } from '@/context/CartContext';

export default function MyComponent() {
  const { items, addToCart, removeFromCart, getTotalPrice } = useCart();

  return (
    <div>
      <p>Total: S/ {getTotalPrice().toFixed(2)}</p>
      <button onClick={() => addToCart('1', 'Jujutsu Kaisen', 45, 'Ivrea')}>
        Agregar
      </button>
    </div>
  );
}
```

---

## 2. Filtrado de Productos

```typescript
import { filterProducts, getAllEditorials } from '@/lib/products';

// Filtrar con parámetros
const results = filterProducts(
  query: 'jujutsu',
  editorial: 'Ivrea Argentina',
  minPrice: 40,
  maxPrice: 50,
  inStockOnly: true
);

// Obtener todas las editoriales
const editorials = getAllEditorials();
// ["Ivrea Argentina", "Ovni Press", "Panini MX", "Viz Media México"]
```

---

## 3. Agregar Producto al Carrito

```typescript
const handleAddToCart = (product: Product) => {
  addToCart(
    product.id,           // "1"
    product.title,        // "Jujutsu Kaisen Vol. 1"
    product.pricePEN,     // 45.00
    product.editorial     // "Ivrea Argentina"
  );
  // El carrito se actualiza automáticamente
  // y se guarda en localStorage
};
```

---

## 4. Validación de Email en Formulario

```typescript
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateEmail(formData.email)) {
    setErrors(prev => ({
      ...prev,
      email: 'El email no es válido'
    }));
    return;
  }
  
  // Procesar formulario
};
```

---

## 5. Búsqueda con URL Params

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const editorial = searchParams.get('editorial') || '';
  
  // Generar URL de búsqueda
  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    params.set('search', query);
    window.location.href = `/products?${params.toString()}`;
  };
  
  return (
    <input 
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(searchQuery);
      }}
    />
  );
}
```

---

## 6. Componente Reutilizable - ProductCard

```typescript
interface ProductCardProps {
  id: string;
  title: string;
  editorial: string;
  pricePEN: number;
  stock: number;
  tags: string[];
  description: string;
}

export default function ProductCard(props: ProductCardProps) {
  const { addToCart } = useCart();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold">{props.title}</h3>
      <p className="text-gray-600 text-sm">{props.editorial}</p>
      <p className="text-2xl font-bold text-purple-600">S/ {props.pricePEN}</p>
      
      <button 
        onClick={() => addToCart(props.id, props.title, props.pricePEN, props.editorial)}
        disabled={props.stock === 0}
      >
        Agregar al carrito
      </button>
    </div>
  );
}
```

---

## 7. Paginación

```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 12;

const paginatedProducts = filteredProducts.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

// Botones de paginación
{Array.from({ length: totalPages }).map((_, i) => (
  <button
    key={i + 1}
    onClick={() => setCurrentPage(i + 1)}
    className={currentPage === i + 1 ? 'bg-purple-600' : 'border'}
  >
    {i + 1}
  </button>
))}
```

---

## 8. Header con Búsqueda

```typescript
const [searchQuery, setSearchQuery] = useState('');

const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
  }
};

return (
  <header className="sticky top-0 z-50 bg-white border-b">
    <form onSubmit={handleSearchSubmit}>
      <input
        type="text"
        placeholder="Buscar manga..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type="submit">🔍</button>
    </form>
  </header>
);
```

---

## 9. Integración WhatsApp

```typescript
// En cualquier componente
const whatsappNumber = '51924462641';
const message = 'Hola, quiero consultar sobre Jujutsu Kaisen Vol. 1';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

// Botón
<a 
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-8 right-8 bg-green-500 p-4 rounded-full"
>
  💬 WhatsApp
</a>
```

---

## 10. Carrito a WhatsApp

```typescript
const handleWhatsAppCheckout = () => {
  const cartDetails = items
    .map((item) => `${item.title} (${item.quantity}x) - S/ ${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const total = getTotalPrice();
  const message = `Quiero hacer este pedido:\n\n${cartDetails}\n\nTotal: S/ ${total.toFixed(2)}`;

  const whatsappUrl = `https://wa.me/51924462641?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
```

---

## 11. Interfaz de Producto

```typescript
interface Product {
  id: string;
  title: string;
  editorial: string;
  pricePEN: number;
  stock: number;
  tags: string[];        // ["nuevo", "bestseller", etc]
  description: string;
  imageUrl: string;
  countryGroup: "Argentina" | "México";
}
```

---

## 12. Interfaz de Item del Carrito

```typescript
interface CartItem {
  productId: string;
  title: string;
  price: number;         // PEN
  quantity: number;
  editorial: string;
}
```

---

## 13. Context API Setup

```typescript
// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

interface CartContextType {
  items: CartItem[];
  addToCart: (id: string, title: string, price: number, editorial: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Implementación...

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
```

---

## 14. Filters Colapsibles

```typescript
const [expandedSection, setExpandedSection] = useState<string | null>('search');

{expandedSection === 'search' && (
  <div className="mt-3">
    <input
      type="text"
      placeholder="Buscar manga..."
      onChange={(e) => handleSearch(e.target.value)}
    />
  </div>
)}
```

---

## 15. Validación de Formulario

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.nombre.trim()) {
    newErrors.nombre = 'El nombre es requerido';
  }

  if (!validateEmail(formData.email)) {
    newErrors.email = 'Email inválido';
  }

  return newErrors;
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const newErrors = validateForm();

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Procesar...
};
```

---

## Tailwind Classes Personalizadas

```css
/* Botón principal */
.btn-primary {
  @apply bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors;
}

/* Tarjeta */
.card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
}

/* Badge */
.badge {
  @apply inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded;
}
```

---

## Estructura de Respuesta de Filtros

```typescript
{
  products: Product[],           // Array filtrado
  total: number,                 // Total de productos
  page: number,                  // Página actual
  totalPages: number,            // Total de páginas
  filters: {
    search?: string,
    editorial?: string,
    minPrice?: number,
    maxPrice?: number,
    inStockOnly?: boolean
  }
}
```

---

**🐱 Neko Manga Cix** - Referencia rápida de código
