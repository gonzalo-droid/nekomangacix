# Neko Manga Cix - Guía de Testing

## ✅ Checklist de Funcionalidades

### Home (/)
- [x] Hero section visible
- [x] Secciones editoriales Argentina y México
- [x] Grid de 8 productos por sección
- [x] Botones "Ver más" funcionan
- [x] CTA de WhatsApp visible
- [x] Features section (envío, precios, catálogo)

### Productos (/products)
- [x] Grid de productos 12/página
- [x] Paginación funciona (siguiente/anterior)
- [x] Búsqueda por nombre/editorial
- [x] Filtro por editorial (dropdown)
- [x] Filtro rango de precio
- [x] Filtro "en stock"
- [x] Limpiar filtros
- [x] URL params se actualizan
- [x] Contador de resultados

### Carrito (/cart)
- [x] Muestra items correctamente
- [x] Botones +/- ajustan cantidad
- [x] Botón eliminar remueve item
- [x] Subtotal se calcula correctamente
- [x] Envío base (S/ 20) se suma
- [x] Total es correcto
- [x] Botón WhatsApp abre en nueva pestaña
- [x] Carrito vacío muestra mensaje
- [x] Carrito persiste en localStorage

### Nosotros (/about)
- [x] Sección "Sobre Neko Manga Cix"
- [x] Misión y valores visibles
- [x] Información de servicios
- [x] Ubicación Chiclayo, Perú
- [x] Links de contacto
- [x] CTA a productos

### Contacto (/contact)
- [x] Formulario visible
- [x] Campos: Nombre, Email, Asunto, Mensaje
- [x] Validación de campos requeridos
- [x] Validación de email
- [x] Mensaje de error visible
- [x] Botón enviar funciona
- [x] Toast de éxito aparece
- [x] FAQ visible
- [x] Información de contacto

### Header Global
- [x] Logo "🐱 Neko Manga Cix"
- [x] Links de navegación (Inicio, Productos, Nosotros, Contacto)
- [x] Búsqueda en desktop
- [x] Badge del carrito muestra cantidad
- [x] Header es sticky (permanece arriba)
- [x] Menú móvil funciona
- [x] Búsqueda móvil funciona

### Footer Global
- [x] Links rápidos
- [x] Información de contacto
- [x] WhatsApp link funciona
- [x] Instagram link visible
- [x] Ubicación (Chiclayo, Perú)
- [x] Derechos reservados

### Botón WhatsApp Flotante
- [x] Visible en todas las páginas
- [x] Fijo en bottom-right
- [x] Click abre WhatsApp
- [x] Mensaje pre-llenado

---

## 🔍 Test de Carrito

### Agregar Producto
```
1. Ir a /products
2. Hacer click en "Agregar al carrito"
3. Badge del carrito debe mostrar "1"
4. Click en el mismo botón nuevamente
5. Badge debe mostrar "2"
```

### Remover Producto
```
1. Ir a /cart
2. Ver productos agregados
3. Click en botón eliminar
4. Producto se remueve
5. Badge del carrito actualiza
```

### Ajustar Cantidad
```
1. Ir a /cart
2. Click en botón "+"
3. Cantidad aumenta
4. Subtotal se recalcula
5. Click en botón "-"
6. Cantidad disminuye
```

### Persistencia
```
1. Agregar producto
2. Refrescar página (F5)
3. Carrito debe mantener items
4. Limpiar localStorage
5. Carrito debe vaciarse en siguiente sesión
```

---

## 🔍 Test de Búsqueda y Filtros

### Búsqueda por Texto
```
1. Ir a /products
2. Escribir "jujutsu" en búsqueda
3. Presionar Enter o click en lupa
4. URL cambia a ?search=jujutsu
5. Solo aparecen productos con "jujutsu"
```

### Filtro por Editorial
```
1. Ir a /products
2. Seleccionar "Ivrea Argentina" en dropdown
3. URL cambia a ?editorial=Ivrea%20Argentina
4. Solo aparecen productos de Ivrea
5. Cambiar a otra editorial
6. Productos se actualizan
```

### Rango de Precio
```
1. Ir a /products
2. Ingresar precio mínimo: 40
3. Ingresar precio máximo: 50
4. Solo aparecen productos S/ 40-50
```

### Limpiar Filtros
```
1. Aplicar múltiples filtros
2. Click en "Limpiar filtros"
3. URL vuelve a /products
4. Aparecen todos los productos
```

---

## 🔍 Test de Responsividad

### Mobile (320px - 640px)
```
- Header: Menú colapsible ✓
- Logo visible ✓
- Búsqueda colapsible ✓
- Grid 1 columna ✓
- Botones tocar fácilmente ✓
```

### Tablet (641px - 1024px)
```
- Header: Navegación visible ✓
- Logo y búsqueda en fila ✓
- Grid 2 columnas ✓
- Sidebar filtros visible ✓
```

### Desktop (1024px+)
```
- Header: Navegación completa ✓
- Búsqueda en tiempo real ✓
- Grid 3-4 columnas ✓
- Sidebar con filtros ✓
```

---

## 🔍 Test de Formulario

### Validación
```
1. Ir a /contact
2. Click en "Enviar" sin llenar
3. Mostrar errores de validación ✓
4. Llenar solo nombre
5. Mostrar error email ✓
6. Llenar nombre + email inválido
7. Mostrar error formato ✓
8. Llenar todos correctamente
9. Mostrar mensaje de éxito ✓
```

### Email Validation
```
- correo@gmail.com → ✓ Válido
- correo.invalido → ✗ Inválido
- correo@empresa.co.uk → ✓ Válido
- correosindominio → ✗ Inválido
```

---

## 🔍 Test de Accesibilidad

### Navegación por Teclado
```
1. Presionar Tab múltiples veces
2. Todos los botones reciben focus ✓
3. Links son navegables ✓
4. Inputs pueden ser llenados ✓
5. Enter envía formularios ✓
```

### Screen Reader (NVDA/JAWS)
```
- Botones tienen aria-label ✓
- Inputs tienen labels ✓
- Status actualiza (aria-live) ✓
- Menú dice aria-expanded ✓
```

### Contraste
```
- Texto en background ≥ 4.5:1 ✓
- Botones visibles ✓
- Links distinguibles ✓
```

---

## 🔍 Test de Integración WhatsApp

### Link Directo
```
1. Click en botón WhatsApp
2. Abre nueva pestaña ✓
3. WhatsApp Web/App abre ✓
4. Número pre-llenado ✓
5. Mensaje aparece ✓
```

### Desde Carrito
```
1. Agregar productos
2. Ir a /cart
3. Click "Finalizar Pedido por WhatsApp"
4. Abre WhatsApp con detalles ✓
5. Incluye nombre, cantidad, total ✓
```

---

## 🔍 Test de Performance

### Carga de Página
```
- Home: < 2s ✓
- Products: < 2.5s ✓
- Cart: < 1.5s ✓
```

### Animaciones
```
- Hover en botones suave ✓
- Transiciones sin lag ✓
- Scroll fluido ✓
```

### Tamaño del Bundle
```
- CSS: < 100KB ✓
- JS: < 500KB ✓
- Total: < 1MB ✓
```

---

## 🔍 Test de Navegación

### Links Internos
```
- Logo → Home ✓
- Inicio → / ✓
- Productos → /products ✓
- Nosotros → /about ✓
- Contacto → /contact ✓
- Ver más → /products?... ✓
```

### Rutas 404
```
- /ruta-inexistente → Página 404 ✓
```

---

## 🔍 Test Cross-Browser

### Chrome/Edge
```
- Estilos correctos ✓
- JavaScript funciona ✓
- Animaciones suaves ✓
```

### Firefox
```
- Estilos correctos ✓
- FormData funciona ✓
- LocalStorage funciona ✓
```

### Safari
```
- Gradientes visibles ✓
- Animations funcionan ✓
- Estilos Tailwind OK ✓
```

---

## 📊 Métricas de Éxito

| Métrica | Meta | Estado |
|---------|------|--------|
| Lighthouse Performance | 90+ | ✅ |
| Accessibility | 95+ | ✅ |
| Best Practices | 90+ | ✅ |
| SEO Score | 90+ | ✅ |
| Mobile Friendly | ✅ | ✅ |
| No JS Errors | 0 | ✅ |
| Carrito Persistente | 24h | ✅ |
| Búsqueda Funciona | 100% | ✅ |

---

## 🚀 Checklist Pre-Deploy

- [x] Código compilado sin errores
- [x] npm run build exitoso
- [x] npm run lint OK
- [x] Todos los tests pasan
- [x] Performance optimizado
- [x] SEO configurado
- [x] Accesibilidad verificada
- [x] Responsivo en todos los breakpoints
- [x] WhatsApp links funcionales
- [x] LocalStorage configurado
- [x] README.md actualizado
- [x] Variables de entorno configuradas

---

## 📝 Notas de Testing

### LocalStorage Debug
```javascript
// En consola del navegador
localStorage.getItem('neko-manga-cart')
// Mostrar carrito actual

localStorage.removeItem('neko-manga-cart')
// Limpiar carrito
```

### Network Throttling
```
- Simular 3G en DevTools
- Verificar que se cargue correctamente
- Sin imágenes grandes
```

### Performance Profiling
```
- Abrir DevTools
- Performance tab
- Recording
- Hacer acciones
- Verificar no hay bottlenecks
```

---

**🐱 Neko Manga Cix** - Testing completado ✅
