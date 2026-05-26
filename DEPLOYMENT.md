# Neko Manga Cix - Guía de Deployment

## 🚀 Desplegar a Vercel (Recomendado)

### Opción 1: GitHub + Vercel (Automático)

1. **Subir a GitHub:**
```bash
cd /Users/gonzalo/DocsNeko/webs/nekomangacix
git remote add origin https://github.com/tu-usuario/neko-manga-cix.git
git branch -M main
git push -u origin main
```

2. **Conectar a Vercel:**
   - Ir a https://vercel.com
   - Importar proyecto desde GitHub
   - Seleccionar `nekomangacix` repositorio
   - Vercel auto-detectará Next.js
   - Click "Deploy"

3. **URL:** `https://neko-manga-cix.vercel.app` (automático)

---

### Opción 2: Vercel CLI (Local)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la carpeta del proyecto
cd /Users/gonzalo/DocsNeko/webs/nekomangacix

# Login a Vercel
vercel login

# Deploy
vercel

# Production
vercel --prod
```

---

## 🐳 Desplegar con Docker

### 1. Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Build
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando start
CMD ["npm", "start"]
```

### 2. Crear .dockerignore

```
node_modules
.next
.git
.env
.env.local
npm-debug.log
```

### 3. Build y Run

```bash
# Build imagen
docker build -t neko-manga-cix .

# Run container
docker run -p 3000:3000 neko-manga-cix

# Con puerto personalizado
docker run -p 8080:3000 neko-manga-cix
```

---

## 🌐 Deployment en AWS

### Amplify (Fácil)

1. **Subir a GitHub** (si no está)
2. **Conectar a AWS Amplify:**
   - Ir a AWS Amplify Console
   - "New app" → "Host web app"
   - Seleccionar GitHub
   - Conectar repositorio
   - Seleccionar branch `main`
   - Siguiente
   - Review → Deploy

3. **URL automática:** `https://xxx.amplify.aws`

### EC2 (Manual)

```bash
# 1. Conectar a instancia EC2
ssh -i tu-clave.pem ec2-user@tu-instancia.aws

# 2. Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Clonar repositorio
git clone https://github.com/tu-usuario/neko-manga-cix.git
cd neko-manga-cix

# 4. Instalar y build
npm install
npm run build

# 5. Instalar PM2 (process manager)
sudo npm install -g pm2

# 6. Start con PM2
pm2 start npm --name "neko-manga" -- start
pm2 startup
pm2 save

# 7. Verificar
curl http://localhost:3000
```

---

## 🌐 Desplegar en Netlify

1. **Build localmente:**
```bash
npm run build
```

2. **Crear `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  functions = "functions"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/"
  status = 200
```

3. **Deploy en Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

---

## 🌐 Railway

```bash
# Instalar Railway CLI
npm i -g railway

# Login
railway login

# Init project
railway init

# Deploy
railway up

# Ver logs
railway logs
```

---

## 🌐 DigitalOcean App Platform

1. Conectar GitHub
2. Seleccionar repositorio
3. Configurar:
   - Build: `npm install && npm run build`
   - Run: `npm start`
4. Esperar deployment
5. URL automática

---

## 📋 Pre-Deployment Checklist

- [ ] `npm run build` funciona sin errores
- [ ] `npm start` ejecuta correctamente
- [ ] Verificar variables de entorno
- [ ] Test en navegador local
- [ ] SEO meta tags completos
- [ ] robots.txt configurado
- [ ] sitemap.xml generado
- [ ] Favicon incluido
- [ ] Imágenes optimizadas
- [ ] No hay console.logs
- [ ] CORS configurado si necesita
- [ ] SecurityHeaders implementados

---

## 🔐 Variables de Entorno

### .env.local (Desarrollo)
```env
# Actualmente no requeridas para demo
# Agregar si conectas backend:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

### .env.production (Producción)
```env
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

---

## 📊 Monitoreo Post-Deploy

### Vercel Analytics
- Dashboard automático
- Core Web Vitals
- Performance tracking

### Sentry (Opcional)
```bash
npm install @sentry/nextjs
```

### Google Analytics
```html
<!-- app/layout.tsx -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## 🎯 Optimizaciones Post-Deploy

### Next.js Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/productos/manga.jpg"
  alt="Manga"
  width={200}
  height={300}
  priority
/>
```

### Compression
- Vercel auto-comprime
- Gzip activado por defecto

### CDN
- Vercel Edge Network
- Auto-distribución global
- Caching automático

---

## 🔍 Verificar Deployment

```bash
# Verificar headers de seguridad
curl -I https://tu-dominio.com

# Verificar Core Web Vitals
# Ir a Google PageSpeed Insights
# https://pagespeed.web.dev/

# Test de accesibilidad
# https://wave.webaim.org/

# Test de SEO
# https://www.seobility.net/
```

---

## 📱 Custom Domain

### Vercel
1. Dashboard → Settings → Domains
2. Agregar dominio
3. Configurar DNS:
   - Tipo: CNAME
   - Nombre: `www`
   - Valor: `cname.vercel-dns.com`

### AWS Route 53
1. Crear hosted zone
2. Agregar records A
3. Apuntar a IP de Vercel/AWS

---

## 🚨 Troubleshooting

### Build falla
```bash
# Limpiar y reconstruir
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Servidor no inicia
```bash
# Verificar puerto
lsof -i :3000

# Matar proceso
kill -9 PID

# Verificar logs
npm run dev 2>&1 | head -50
```

### 404 en producción
- Verificar routing en `app/` router
- Revisar `next.config.js`
- Limpiar caché del navegador

### Performance lenta
```bash
# Analizar bundle
npm run build -- --analyze

# Usar Lighthouse
# DevTools → Lighthouse → Generate report
```

---

## 📈 Escalabilidad Futura

### Si necesitas backend:
1. Node.js + Express
2. PostgreSQL o MongoDB
3. Vercel + Railway o Firebase

### Base de Datos:
- Supabase (PostgreSQL)
- Firebase (NoSQL)
- MongoDB Atlas
- PlanetScale (MySQL)

### Autenticación:
- NextAuth.js
- Auth0
- Firebase Auth

### Pagos:
- Stripe
- Paypal
- MercadoPago

---

## 📚 Recursos Útiles

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Railway Docs](https://railway.app/docs)
- [Docker Docs](https://docs.docker.com/)

---

**Opción Recomendada:** Vercel + GitHub (5 min setup, totalmente gratis)

**🐱 Neko Manga Cix** - Listo para producción 🚀
