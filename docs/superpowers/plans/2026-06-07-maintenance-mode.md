# Maintenance Mode (Coming Soon) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar una página "trabajo en progreso" con countdown en producción cuando `MAINTENANCE_MODE=true`, mientras que localmente se ve el sitio completo; `/admin` y `/api` siempre accesibles.

**Architecture:** Un `middleware.ts` en la raíz intercepta todas las requests. Si `MAINTENANCE_MODE=true`, redirige a `/coming-soon` excepto para rutas de admin, api y la propia página. La página `/coming-soon` es una ruta de Next.js que muestra logo, título, countdown y links a redes sociales.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS 4, React 19

---

### Task 1: Middleware de mantenimiento

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Crear middleware**

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BYPASS_PATHS = ['/coming-soon', '/admin', '/api', '/_next', '/favicon.ico']

export function middleware(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE === 'true'
  if (!maintenance) return NextResponse.next()

  const { pathname } = request.nextUrl
  const isBypassed = BYPASS_PATHS.some((p) => pathname.startsWith(p))
  if (isBypassed) return NextResponse.next()

  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add maintenance mode middleware"
```

---

### Task 2: Página Coming Soon

**Files:**
- Create: `app/coming-soon/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/coming-soon/page.tsx
import type { Metadata } from 'next'
import ComingSoonClient from './ComingSoonClient'

export const metadata: Metadata = {
  title: 'Próximamente · NEKO MANGA CIX',
  description: 'Estamos trabajando en algo increíble. ¡Vuelve pronto!',
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  const launchDate = process.env.LAUNCH_DATE ?? '2026-09-01'
  return <ComingSoonClient launchDate={launchDate} />
}
```

- [ ] **Step 2: Commit**

```bash
git add app/coming-soon/page.tsx
git commit -m "feat: add coming-soon page (server)"
```

---

### Task 3: Componente cliente con countdown y diseño

**Files:**
- Create: `app/coming-soon/ComingSoonClient.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// app/coming-soon/ComingSoonClient.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  launchDate: string
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
  }
}

export default function ComingSoonClient({ launchDate }: Props) {
  const target = new Date(launchDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [launchDate])

  const units = [
    { label: 'Días', value: timeLeft.dias },
    { label: 'Horas', value: timeLeft.horas },
    { label: 'Minutos', value: timeLeft.minutos },
    { label: 'Segundos', value: timeLeft.segundos },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 gap-10">
      {/* Logo / título */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🐱</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">NEKO MANGA CIX</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Chiclayo · Perú</p>
      </div>

      {/* Mensaje */}
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Estamos trabajando en algo increíble</h2>
        <p className="text-gray-400">Nuestra tienda online está en construcción. Muy pronto podrás comprar manga y coleccionables directo desde aquí.</p>
      </div>

      {/* Countdown */}
      <div className="flex gap-4 sm:gap-8">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-4xl sm:text-5xl font-mono font-bold tabular-nums text-purple-400">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Redes sociales */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-500 text-sm">Síguenos mientras tanto</p>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center gap-1"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@nekomangacix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            TikTok
          </a>
          <a
            href="https://wa.me/51924462641"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-1"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/coming-soon/ComingSoonClient.tsx
git commit -m "feat: add coming-soon countdown client component"
```

---

### Task 4: Variables de entorno documentadas

**Files:**
- Modify: `.env.local` — agregar las nuevas vars (solo para referencia local, no activar en dev)

- [ ] **Step 1: Agregar vars al `.env.local` comentadas**

Agregar al final de `.env.local`:

```bash
# Modo mantenimiento — cambiar a true en producción para activar la página coming soon
# MAINTENANCE_MODE=true

# Fecha de lanzamiento para el countdown (formato YYYY-MM-DD)
LAUNCH_DATE=2026-09-01
```

- [ ] **Step 2: Verificar que en local el sitio corre con normalidad**

```bash
npm run dev
# Navegar a http://localhost:3000 — debe mostrar el sitio completo
# Navegar a http://localhost:3000/coming-soon — debe mostrar la página coming soon directamente
```

- [ ] **Step 3: Commit**

```bash
git add .env.local
git commit -m "chore: document MAINTENANCE_MODE and LAUNCH_DATE env vars"
```

---

### Task 5: Verificación en modo mantenimiento simulado

**Files:** ninguno nuevo

- [ ] **Step 1: Activar temporalmente en local para probar**

En `.env.local`, descomentar `MAINTENANCE_MODE=true` y reiniciar el servidor:

```bash
npm run dev
```

- [ ] **Step 2: Verificar comportamiento**

- `http://localhost:3000` → redirige a `/coming-soon` ✓
- `http://localhost:3000/products` → redirige a `/coming-soon` ✓
- `http://localhost:3000/admin` → carga admin normal ✓
- `http://localhost:3000/coming-soon` → muestra página ✓
- Countdown hace tick cada segundo ✓

- [ ] **Step 3: Volver a comentar `MAINTENANCE_MODE` en `.env.local`**

Dejar comentado para que en local siempre corra el sitio completo.

- [ ] **Step 4: Commit final**

```bash
git add .env.local
git commit -m "chore: disable local maintenance mode after testing"
```
