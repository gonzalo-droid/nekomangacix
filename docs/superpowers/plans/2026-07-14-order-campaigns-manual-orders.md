# Preventa Campaigns + Manual Order Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `campaigns` entity representing time-boxed monthly preventa windows (one open window per country at a time), auto-assign preorder order items to the currently open campaign for their product's country, and add an admin flow to load orders manually for in-person/direct sales.

**Architecture:** New `campaigns` table + `order_items.campaign_id` FK. A shared helper (`lib/campaigns.ts`) resolves "the open campaign for country X right now" and is called from both the existing public checkout endpoint (`app/api/orders/route.ts`) and a new admin-only manual order endpoint (`app/api/admin/orders/route.ts`). Admin UI follows the existing `PromotionsManager`/`BannersManager` tab pattern for campaign CRUD, and a new `/admin/orders/new` page for manual entry.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + RLS), Tailwind CSS. No test framework configured — verification is manual (curl against dev server + SQL checks in Supabase SQL Editor) per `CLAUDE.md`.

## Global Constraints

- **Node version:** the default `node`/`npx` on PATH resolves to v12.22.12 (too old — lacks `node:` protocol imports and modern syntax used by this project's tooling). Every command in this plan that invokes `node`, `npx`, or `npm` must be run with `/Users/gonzalo/.nvm/versions/node/v24.15.0/bin` prepended to `PATH`, e.g.:
  `export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npm run build`
- **No test framework.** Do not write `*.test.ts` files. Verification steps use `npx tsc --noEmit`, `npm run build`, `npm run lint`, and manual `curl`/SQL checks.
- **No Supabase CLI / local DB.** There is no `supabase` CLI installed and no local Postgres — migrations are plain `.sql` files under `supabase/migrations/` that get applied by pasting into the Supabase Dashboard SQL Editor (this is how `001`–`011` were applied; there is no automated migration runner in this repo). Any task that adds/changes schema must include the exact SQL for the user to paste, and a `select` query to confirm it applied.
- **Admin auth pattern:** every admin-mutating API route must start with `const auth = await verifyAdminRequest(); if (!auth.ok) return auth.response;` (from `lib/adminAuth.ts`), matching every existing route under `app/api/admin/**`.
- **Country enum:** campaigns and products both use `country_code in ('AR','MX','ES','JP')` — the canonical TS union is `CountryCode` from `lib/constants/countries.ts`.
- **camelCase/snake_case boundary:** domain types facing the UI (`lib/campaigns.ts`) are camelCase; DB rows are snake_case, mapped at the boundary — follow the exact pattern already used in `lib/promotions.ts`.

---

### Task 1: `campaigns` table + `order_items.campaign_id` column

**Files:**
- Create: `supabase/migrations/012_campaigns.sql`
- Modify: `types/database.types.ts:217-239` (the `order_items` table block)

**Interfaces:**
- Produces: DB table `public.campaigns` (columns: `id uuid`, `name text`, `country_code text`, `starts_at timestamptz`, `ends_at timestamptz`, `status text`, `notes text|null`, `created_at timestamptz`), and `public.order_items.campaign_id uuid|null`.
- Produces: TS types `Database['public']['Tables']['order_items']['Row'].campaign_id: string | null` and the matching `Insert` field.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/012_campaigns.sql`:

```sql
-- ============================================
-- NekoMangaCix - 012: Preventa campaigns
-- Time-boxed monthly preorder windows, one open window per
-- country at a time. order_items link to the campaign that
-- was open when a preorder line was created, so a single
-- order can mix stock items (no campaign) with preorder
-- items from a campaign.
-- ============================================

create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  country_code  text not null check (country_code in ('AR','MX','ES','JP')),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'open' check (status in ('open','closed')),
  notes         text,
  created_at    timestamptz not null default now()
);

alter table public.order_items
  add column if not exists campaign_id uuid references public.campaigns(id);

create index if not exists campaigns_country_status_idx
  on public.campaigns (country_code, status);

create index if not exists order_items_campaign_idx
  on public.order_items (campaign_id);

alter table public.campaigns enable row level security;

-- Público (checkout) puede leer campañas abiertas para calcular
-- si hay preventa vigente antes de armar el pedido.
create policy "campaigns_read_open"
  on public.campaigns for select
  using (status = 'open');

-- Solo el service role (rutas /api/admin/**) puede crear/editar/cerrar.
create policy "campaigns_admin_all"
  on public.campaigns for all
  using (auth.role() = 'service_role');
```

- [ ] **Step 2: Apply the migration**

This project has no Supabase CLI or local DB. Open the Supabase Dashboard → SQL Editor for this project, paste the full contents of `supabase/migrations/012_campaigns.sql`, and run it.

- [ ] **Step 3: Verify the migration applied**

In the same SQL Editor, run:

```sql
select column_name, data_type from information_schema.columns
where table_name = 'campaigns' order by ordinal_position;

select column_name from information_schema.columns
where table_name = 'order_items' and column_name = 'campaign_id';
```

Expected: the first query returns 7 rows (`id, name, country_code, starts_at, ends_at, status, notes, created_at` — 8 actually, count them), the second returns exactly 1 row (`campaign_id`).

- [ ] **Step 4: Update `order_items` TypeScript types**

In `types/database.types.ts`, find the `order_items` block (currently lines 217-239):

```ts
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          title: string;
          item_type: OrderItemType;
          estimated_arrival: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          title: string;
          item_type?: OrderItemType;
          estimated_arrival?: string | null;
        };
        Update: never;
      };
```

Replace it with (adds `campaign_id` to `Row` and `Insert`):

```ts
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          title: string;
          item_type: OrderItemType;
          estimated_arrival: string | null;
          campaign_id: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          title: string;
          item_type?: OrderItemType;
          estimated_arrival?: string | null;
          campaign_id?: string | null;
        };
        Update: never;
      };
```

- [ ] **Step 5: Type-check**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output (exit code 0).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/012_campaigns.sql types/database.types.ts
git commit -m "feat: add campaigns table and order_items.campaign_id column"
```

---

### Task 2: `lib/campaigns.ts` — domain types + active-campaign lookup

**Files:**
- Create: `lib/campaigns.ts`

**Interfaces:**
- Consumes: `CountryCode` from `lib/constants/countries.ts`.
- Produces:
  - `export interface Campaign { id, name, countryCode: CountryCode, startsAt: string, endsAt: string, status: 'open' | 'closed', notes?: string, createdAt: string }`
  - `export interface DbCampaign { id, name, country_code, starts_at, ends_at, status, notes, created_at }`
  - `export function dbRowToCampaign(row: DbCampaign): Campaign`
  - `export function campaignToDbRow(c: Partial<Campaign>): Partial<DbCampaign>`
  - `export async function getActiveCampaignForCountry(countryCode: CountryCode, supabase: SupabaseClient): Promise<Campaign | null>`
  - `export function campaignsOverlap(a: { startsAt: string; endsAt: string }, b: { startsAt: string; endsAt: string }): boolean`

- [ ] **Step 1: Write `lib/campaigns.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CountryCode } from './constants/countries';

export type CampaignStatus = 'open' | 'closed';

export interface Campaign {
  id: string;
  name: string;
  countryCode: CountryCode;
  startsAt: string;
  endsAt: string;
  status: CampaignStatus;
  notes?: string;
  createdAt: string;
}

export interface DbCampaign {
  id: string;
  name: string;
  country_code: CountryCode;
  starts_at: string;
  ends_at: string;
  status: CampaignStatus;
  notes: string | null;
  created_at: string;
}

export function dbRowToCampaign(row: DbCampaign): Campaign {
  return {
    id: row.id,
    name: row.name,
    countryCode: row.country_code,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export function campaignToDbRow(c: Partial<Campaign>): Partial<DbCampaign> {
  return {
    ...(c.name !== undefined && { name: c.name }),
    ...(c.countryCode !== undefined && { country_code: c.countryCode }),
    ...(c.startsAt !== undefined && { starts_at: c.startsAt }),
    ...(c.endsAt !== undefined && { ends_at: c.endsAt }),
    ...(c.status !== undefined && { status: c.status }),
    ...(c.notes !== undefined && { notes: c.notes || null }),
  };
}

/**
 * Busca la campaña abierta ahora mismo para un país. Devuelve null si no hay
 * ninguna vigente — quien llame debe rechazar la compra en preventa en ese caso.
 */
export async function getActiveCampaignForCountry(
  countryCode: CountryCode,
  supabase: SupabaseClient
): Promise<Campaign | null> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('country_code', countryCode)
    .eq('status', 'open')
    .lte('starts_at', nowIso)
    .gte('ends_at', nowIso)
    .limit(1)
    .maybeSingle();

  return data ? dbRowToCampaign(data as DbCampaign) : null;
}

/** True si dos ventanas [startsAt, endsAt] se superponen (bordes inclusive). */
export function campaignsOverlap(
  a: { startsAt: string; endsAt: string },
  b: { startsAt: string; endsAt: string }
): boolean {
  return new Date(a.startsAt) <= new Date(b.endsAt) && new Date(b.startsAt) <= new Date(a.endsAt);
}
```

- [ ] **Step 2: Type-check**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 3: Verify `getActiveCampaignForCountry` against the real DB**

This project has no test runner, so verify with a throwaway script using the credentials already in `.env.local`.

Create a temporary file `/tmp/check-campaign.mjs`:

```js
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('campaigns').select('*').limit(5);
console.log({ data, error });
```

Run it:

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && node /tmp/check-campaign.mjs
```

Expected: `{ data: [], error: null }` (empty array — no campaigns created yet, but no error, confirming the anon client can read the table per the `campaigns_read_open` RLS policy). Delete `/tmp/check-campaign.mjs` afterward.

- [ ] **Step 4: Commit**

```bash
git add lib/campaigns.ts
git commit -m "feat: add campaigns domain module with active-campaign lookup"
```

---

### Task 3: Admin API routes for campaign CRUD

**Files:**
- Create: `app/api/admin/campaigns/route.ts`
- Create: `app/api/admin/campaigns/[id]/route.ts`

**Interfaces:**
- Consumes: `verifyAdminRequest` from `@/lib/adminAuth`, `campaignsOverlap` and `DbCampaign` from `@/lib/campaigns`.
- Produces: `GET /api/admin/campaigns` → `{ data: DbCampaign[] }`; `POST /api/admin/campaigns` (body: `Partial<DbCampaign>` minus `id`/`created_at`) → `{ data: DbCampaign }` (201) or `{ error }` (400/500); `PATCH /api/admin/campaigns/[id]` → `{ data: DbCampaign }`; `DELETE /api/admin/campaigns/[id]` → `{ ok: true }`.

- [ ] **Step 1: Write the list+create route**

Create `app/api/admin/campaigns/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { campaignsOverlap, type DbCampaign } from '@/lib/campaigns';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const supabase = getClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('starts_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as Partial<DbCampaign>;
  if (!body.name || !body.country_code || !body.starts_at || !body.ends_at) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const supabase = getClient();
  const status = body.status ?? 'open';

  if (status === 'open') {
    const { data: existingOpen } = await supabase
      .from('campaigns')
      .select('id, name, starts_at, ends_at')
      .eq('country_code', body.country_code)
      .eq('status', 'open');

    const conflict = (existingOpen ?? []).find((c) =>
      campaignsOverlap(
        { startsAt: body.starts_at!, endsAt: body.ends_at! },
        { startsAt: c.starts_at, endsAt: c.ends_at }
      )
    );
    if (conflict) {
      return NextResponse.json(
        { error: `Se superpone con la campaña abierta "${conflict.name}" (${new Date(conflict.starts_at).toLocaleDateString('es-PE')} – ${new Date(conflict.ends_at).toLocaleDateString('es-PE')})` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...body, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
```

- [ ] **Step 2: Write the edit+close route**

Create `app/api/admin/campaigns/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { campaignsOverlap, type DbCampaign } from '@/lib/campaigns';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await req.json()) as Partial<DbCampaign>;
  const supabase = getClient();

  const willBeOpen = body.status === 'open' || (body.status === undefined && body.starts_at !== undefined);
  if (willBeOpen && (body.country_code || body.starts_at || body.ends_at)) {
    const { data: current } = await supabase
      .from('campaigns')
      .select('country_code, starts_at, ends_at')
      .eq('id', id)
      .single();

    const countryCode = body.country_code ?? current?.country_code;
    const startsAt = body.starts_at ?? current?.starts_at;
    const endsAt = body.ends_at ?? current?.ends_at;

    if (countryCode && startsAt && endsAt) {
      const { data: existingOpen } = await supabase
        .from('campaigns')
        .select('id, name, starts_at, ends_at')
        .eq('country_code', countryCode)
        .eq('status', 'open')
        .neq('id', id);

      const conflict = (existingOpen ?? []).find((c) =>
        campaignsOverlap({ startsAt, endsAt }, { startsAt: c.starts_at, endsAt: c.ends_at })
      );
      if (conflict) {
        return NextResponse.json(
          { error: `Se superpone con la campaña abierta "${conflict.name}"` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const supabase = getClient();

  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Type-check**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 4: Start the dev server and verify manually**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npm run dev
```

In another terminal, log in as admin first to get the session cookie (replace `1234` with your real `ADMIN_PIN` if set in `.env.local`), then exercise the endpoints:

```bash
curl -s -c /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" -d '{"pin":"1234"}'

curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Preventa Julio AR","country_code":"AR","starts_at":"2026-07-01T00:00:00Z","ends_at":"2026-07-15T23:59:59Z"}'
```

Expected: JSON with `data.id`, `data.status = "open"`.

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Preventa Julio AR (duplicada)","country_code":"AR","starts_at":"2026-07-10T00:00:00Z","ends_at":"2026-07-20T23:59:59Z"}'
```

Expected: `{"error":"Se superpone con la campaña abierta \"Preventa Julio AR\"..."}` with HTTP 400 — confirms overlap validation works.

```bash
curl -s -b /tmp/admin-cookie.txt http://localhost:3000/api/admin/campaigns
```

Expected: `{"data":[...]}` with the one campaign created (the overlapping POST must have been rejected, not inserted).

Delete `/tmp/admin-cookie.txt` when done. Leave the dev server running for the next tasks.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/campaigns/
git commit -m "feat: add admin campaigns CRUD API with overlap validation"
```

---

### Task 4: Admin campaigns UI (`CampaignsManager` + new tab)

**Files:**
- Create: `app/admin/campaigns/CampaignsManager.tsx`
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/admin/campaigns`, `PATCH /api/admin/campaigns/[id]` (Task 3); `dbRowToCampaign`, `Campaign` from `@/lib/campaigns`; `COUNTRY_CODES`, `COUNTRIES` from `@/lib/constants/countries`.
- Produces: `export default function CampaignsManager()` rendered as a new "Campañas" tab in `AdminPage`.

- [ ] **Step 1: Write `CampaignsManager.tsx`**

Create `app/admin/campaigns/CampaignsManager.tsx`:

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Lock, Unlock, Calendar } from 'lucide-react';
import { dbRowToCampaign, type Campaign, type DbCampaign } from '@/lib/campaigns';
import { COUNTRY_CODES, COUNTRIES, type CountryCode } from '@/lib/constants/countries';

type FormState = {
  name: string;
  countryCode: CountryCode;
  startsAt: string;
  endsAt: string;
  notes: string;
};

const EMPTY: FormState = {
  name: '',
  countryCode: 'AR',
  startsAt: '',
  endsAt: '',
  notes: '',
};

function toDbPayload(f: FormState) {
  return {
    name: f.name,
    country_code: f.countryCode,
    starts_at: f.startsAt ? new Date(f.startsAt).toISOString() : null,
    ends_at: f.endsAt ? new Date(f.endsAt).toISOString() : null,
    notes: f.notes || null,
  };
}

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/campaigns');
    const json = await res.json();
    setCampaigns(((json.data ?? []) as DbCampaign[]).map(dbRowToCampaign));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY);
    setEditing(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      name: c.name,
      countryCode: c.countryCode,
      startsAt: c.startsAt.slice(0, 16),
      endsAt: c.endsAt.slice(0, 16),
      notes: c.notes ?? '',
    });
    setEditing(c.id);
    setError(null);
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!form.startsAt || !form.endsAt) { setError('Definí inicio y fin'); return; }
    if (new Date(form.startsAt) >= new Date(form.endsAt)) { setError('El inicio debe ser anterior al fin'); return; }
    setSaving(true);
    setError(null);
    const payload = toDbPayload(form);
    const url = editing ? `/api/admin/campaigns/${editing}` : '/api/admin/campaigns';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error al guardar'); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleStatus(c: Campaign) {
    await fetch(`/api/admin/campaigns/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: c.status === 'open' ? 'closed' : 'open' }),
    });
    load();
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar size={20} /> Campañas de preventa
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#ec4899] hover:bg-[#d63384] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nueva campaña
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay campañas aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">País</th>
                <th className="px-4 py-3 text-left">Ventana</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {COUNTRIES[c.countryCode].flag} {COUNTRIES[c.countryCode].name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(c.startsAt).toLocaleDateString('es-PE')} → {new Date(c.endsAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatus(c)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                        c.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {c.status === 'open' ? <Unlock size={12} /> : <Lock size={12} />}
                      {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#2b496d] transition-colors">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? 'Editar campaña' : 'Nueva campaña'}
            </h3>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nombre *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
                  placeholder="Ej: Preventa Julio Argentina"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">País *</span>
                <select
                  value={form.countryCode}
                  onChange={(e) => set({ countryCode: e.target.value as CountryCode })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc} value={cc}>{COUNTRIES[cc].flag} {COUNTRIES[cc].name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Inicio *</span>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => set({ startsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Fin *</span>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => set({ endsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Notas</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  placeholder="Series incluidas, condiciones especiales, etc."
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 py-2 text-sm font-semibold bg-[#ec4899] hover:bg-[#d63384] text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear campaña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire the new tab into `app/admin/page.tsx`**

Modify `app/admin/page.tsx`. Change the import block (currently lines 1-11):

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, Package, ShoppingBag, ChevronLeft, Tag, BookMarked, Megaphone } from 'lucide-react';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import CloudinaryManager from '@/components/CloudinaryManager';
import ProductsManager from './products/ProductsManager';
import PromotionsManager from './promotions/PromotionsManager';
import LegendView from './legend/LegendView';
import BannersManager from './banners/BannersManager';
```

to:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, Package, ShoppingBag, ChevronLeft, Tag, BookMarked, Megaphone, Calendar } from 'lucide-react';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import CloudinaryManager from '@/components/CloudinaryManager';
import ProductsManager from './products/ProductsManager';
import PromotionsManager from './promotions/PromotionsManager';
import LegendView from './legend/LegendView';
import BannersManager from './banners/BannersManager';
import CampaignsManager from './campaigns/CampaignsManager';
```

Change the tab type (currently line 13):

```tsx
type AdminTab = 'products' | 'promotions' | 'images' | 'legend' | 'banners';
```

to:

```tsx
type AdminTab = 'products' | 'promotions' | 'campaigns' | 'images' | 'legend' | 'banners';
```

In the `<nav>` block, after the "Promociones" button (currently lines 53-55):

```tsx
            <button onClick={() => setActiveTab('promotions')} className={tabClass('promotions')}>
              <Tag size={18} /> Promociones
            </button>
```

add:

```tsx
            <button onClick={() => setActiveTab('promotions')} className={tabClass('promotions')}>
              <Tag size={18} /> Promociones
            </button>
            <button onClick={() => setActiveTab('campaigns')} className={tabClass('campaigns')}>
              <Calendar size={18} /> Campañas
            </button>
```

After the "Promotions Tab" render block (currently lines 71-72):

```tsx
        {/* Promotions Tab */}
        {activeTab === 'promotions' && <PromotionsManager />}
```

add:

```tsx
        {/* Promotions Tab */}
        {activeTab === 'promotions' && <PromotionsManager />}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && <CampaignsManager />}
```

- [ ] **Step 3: Type-check and lint**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json && npm run lint
```

Expected: no type errors; lint passes (warnings about pre-existing code are fine, no new errors introduced by these two files).

- [ ] **Step 4: Manual verification in browser**

With the dev server running (`npm run dev`), navigate to `http://localhost:3000/admin/login`, log in with the PIN, go to `http://localhost:3000/admin`, click the "Campañas" tab. Confirm the campaign created in Task 3 Step 4 shows up in the table with its correct country flag and date range. Click the "Abierta" badge to toggle it closed, confirm it flips to "Cerrada" and persists after a page refresh.

- [ ] **Step 5: Commit**

```bash
git add app/admin/campaigns/ app/admin/page.tsx
git commit -m "feat: add campaigns admin tab"
```

---

### Task 5: Wire campaign assignment into the public checkout endpoint

**Files:**
- Modify: `app/api/orders/route.ts`

**Interfaces:**
- Consumes: `getActiveCampaignForCountry` from `@/lib/campaigns`; needs each preorder item's product `country_code`, so the DB product lookup query must select it too.
- Produces: `order_items` rows now include `campaign_id`; the endpoint returns `{ error: string }` with 400 when a preorder item's country has no open campaign (instead of silently succeeding).

- [ ] **Step 1: Select `country_code` in the existing product lookup**

In `app/api/orders/route.ts`, find (currently lines 51-64):

```ts
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const priceMap = new Map<string, { price: number; stockStatus: StockStatus; title: string }>();
  if (productIds.length > 0) {
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, title, price_pen, stock_status')
      .in('id', productIds);
    for (const p of dbProducts ?? []) {
      priceMap.set(p.id as string, {
        price: Number(p.price_pen),
        stockStatus: p.stock_status as StockStatus,
        title: p.title as string,
      });
    }
  }
```

Replace with:

```ts
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const priceMap = new Map<string, { price: number; stockStatus: StockStatus; title: string; countryCode: CountryCode }>();
  if (productIds.length > 0) {
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, title, price_pen, stock_status, country_code')
      .in('id', productIds);
    for (const p of dbProducts ?? []) {
      priceMap.set(p.id as string, {
        price: Number(p.price_pen),
        stockStatus: p.stock_status as StockStatus,
        title: p.title as string,
        countryCode: p.country_code as CountryCode,
      });
    }
  }
```

- [ ] **Step 2: Add the `CountryCode` and `getActiveCampaignForCountry` imports**

At the top of the file, find (currently lines 1-8):

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import { dbRowToPromotion, validateCoupon, applyCouponDiscount, type DbPromotion } from '@/lib/promotions';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';
```

Replace with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import { dbRowToPromotion, validateCoupon, applyCouponDiscount, type DbPromotion } from '@/lib/promotions';
import { getActiveCampaignForCountry } from '@/lib/campaigns';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';
import type { CountryCode } from '@/lib/constants/countries';
```

- [ ] **Step 3: Resolve campaign per preorder item and block missing ones, before the order insert**

Find the block that builds `cartItems` (currently lines 77-87):

```ts
  const cartItems: CartItem[] = items.map((i) => {
    const db = priceMap.get(i.productId);
    return {
      productId: i.productId,
      title: db?.title ?? i.title,
      price: db?.price ?? i.price,
      quantity: i.quantity,
      editorial: '',
      stockStatus: db?.stockStatus ?? i.stockStatus,
    };
  });

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase });
```

Replace with (adds campaign resolution right after `cartItems` is built, before totals so a rejection short-circuits before any DB writes):

```ts
  const cartItems: CartItem[] = items.map((i) => {
    const db = priceMap.get(i.productId);
    return {
      productId: i.productId,
      title: db?.title ?? i.title,
      price: db?.price ?? i.price,
      quantity: i.quantity,
      editorial: '',
      stockStatus: db?.stockStatus ?? i.stockStatus,
    };
  });

  // Resolver campaña vigente para cada ítem de preventa. Si un país no tiene
  // ninguna campaña abierta ahora mismo, se rechaza el pedido completo con un
  // mensaje claro en vez de crear un ítem de preventa "huérfano".
  const campaignIdByProductId = new Map<string, string | null>();
  for (const item of cartItems) {
    if (item.stockStatus !== 'preorder') continue;
    const db = priceMap.get(item.productId);
    if (!db) continue;
    const campaign = await getActiveCampaignForCountry(db.countryCode, supabase);
    if (!campaign) {
      return NextResponse.json(
        { error: `No hay preventa abierta para ${db.countryCode} en este momento (producto: ${item.title})` },
        { status: 400 }
      );
    }
    campaignIdByProductId.set(item.productId, campaign.id);
  }

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase });
```

- [ ] **Step 4: Attach `campaign_id` when inserting `order_items`**

Find (currently lines 138-145):

```ts
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
  }));
```

Replace with:

```ts
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
    campaign_id: campaignIdByProductId.get(item.productId) ?? null,
  }));
```

- [ ] **Step 5: Type-check**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 6: Verify with curl — blocked case (no open campaign)**

First, close the campaign created in Task 3 (or use a country with no campaign, e.g. `MX`). Find a real `preorder` product id for a country with no open campaign:

```sql
select id, title, country_code, stock_status from products where stock_status = 'preorder' limit 5;
```

Run against `/api/orders` with that product id (replace `<PREORDER_PRODUCT_ID>`):

```bash
curl -s -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<PREORDER_PRODUCT_ID>","title":"Test","quantity":1,"price":50,"stockStatus":"preorder"}],"paymentMethod":"yape"}'
```

Expected: `{"error":"No hay preventa abierta para ... en este momento (producto: ...)"}` with HTTP 400.

- [ ] **Step 7: Verify with curl — success case (open campaign)**

Re-open (or create) a campaign for that product's country covering right now (via the admin UI from Task 4, or the curl from Task 3 Step 4), then repeat the same request. Expected: `{"success":true,"orderId":"<uuid>"}`.

Confirm the `campaign_id` was actually written:

```sql
select oi.id, oi.item_type, oi.campaign_id, c.name
from order_items oi
left join campaigns c on c.id = oi.campaign_id
order by oi.id desc limit 1;
```

Expected: the newest row has a non-null `campaign_id` matching the campaign's `name`.

- [ ] **Step 8: Commit**

```bash
git add app/api/orders/route.ts
git commit -m "feat: block preorder checkout without an open campaign, tag items with campaign_id"
```

---

### Task 6: Manual order creation endpoint (`POST /api/admin/orders`)

**Files:**
- Create: `app/api/admin/orders/route.ts`

**Interfaces:**
- Consumes: `verifyAdminRequest`, `calculateCartTotals`, `getActiveCampaignForCountry`, `ORDER_STATES`/`isOrderState` from `@/lib/constants/orderStates`.
- Produces: `POST /api/admin/orders` — body `{ items: { productId: string; quantity: number }[], status: OrderState, paymentMethod: string, customerName?: string, customerPhone?: string, overrideStock?: boolean }` → `{ success: true, orderId: string }` or `{ error: string }` (400/500).

- [ ] **Step 1: Write the route**

Create `app/api/admin/orders/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import { getActiveCampaignForCountry } from '@/lib/campaigns';
import { isOrderState } from '@/lib/constants/orderStates';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';
import type { CountryCode } from '@/lib/constants/countries';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ManualOrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateManualOrderBody {
  items: ManualOrderItemInput[];
  status: string;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  overrideStock?: boolean;
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as CreateManualOrderBody;
  const { items, status, paymentMethod, customerName, customerPhone, overrideStock } = body;

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  if (!isOrderState(status)) {
    return NextResponse.json({ error: 'Estado inicial inválido' }, { status: 400 });
  }

  const supabase = getClient();

  const productIds = items.map((i) => i.productId);
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, title, price_pen, stock, stock_status, country_code')
    .in('id', productIds);

  if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 });

  const productMap = new Map((dbProducts ?? []).map((p) => [p.id as string, p]));

  const cartItems: CartItem[] = [];
  const campaignIdByProductId = new Map<string, string | null>();

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado: ${item.productId}` }, { status: 400 });
    }
    const stockStatus = product.stock_status as StockStatus;

    if (stockStatus === 'in_stock' && Number(product.stock) < item.quantity && !overrideStock) {
      return NextResponse.json(
        { error: `Sin stock suficiente para "${product.title}" (disponible: ${product.stock})` },
        { status: 400 }
      );
    }

    if (stockStatus === 'preorder') {
      const campaign = await getActiveCampaignForCountry(product.country_code as CountryCode, supabase);
      if (!campaign) {
        return NextResponse.json(
          { error: `No hay preventa abierta para ${product.country_code} en este momento (producto: ${product.title})` },
          { status: 400 }
        );
      }
      campaignIdByProductId.set(item.productId, campaign.id);
    }

    cartItems.push({
      productId: item.productId,
      title: product.title as string,
      price: Number(product.price_pen),
      quantity: item.quantity,
      editorial: '',
      stockStatus,
    });
  }

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase: false });
  const paymentType = totals.preorderSubtotal > 0 ? 'split_preorder' : 'full';

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: null,
      status,
      payment_type: paymentType,
      subtotal_pen: totals.subtotal,
      discount_pen: totals.discount,
      shipping_cost: totals.shipping,
      deposit_pen: totals.preorderDeposit,
      balance_pen: totals.balanceDue,
      total_pen: totals.totalToPayNow,
      payment_method: paymentMethod,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      notes: 'Carga manual (venta presencial)',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? 'Error al crear el pedido' }, { status: 500 });
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
    campaign_id: campaignIdByProductId.get(item.productId) ?? null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ success: true, orderId: order.id });
}
```

- [ ] **Step 2: Type-check**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 3: Verify with curl — in-stock item, confirmed status**

Find a real `in_stock` product with `stock > 0`:

```sql
select id, title, stock, stock_status from products where stock_status = 'in_stock' and stock > 0 limit 1;
```

```bash
curl -s -c /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" -d '{"pin":"1234"}'

curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<IN_STOCK_PRODUCT_ID>","quantity":1}],"status":"confirmed","paymentMethod":"efectivo","customerName":"Venta mostrador"}'
```

Expected: `{"success":true,"orderId":"<uuid>"}`.

- [ ] **Step 4: Verify with curl — out-of-stock rejected, then overridden**

```sql
select id, title, stock, stock_status from products where stock_status = 'in_stock' and stock = 0 limit 1;
```

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<ZERO_STOCK_PRODUCT_ID>","quantity":1}],"status":"confirmed","paymentMethod":"efectivo"}'
```

Expected: `{"error":"Sin stock suficiente para \"...\" (disponible: 0)"}` HTTP 400.

```bash
curl -s -b /tmp/admin-cookie.txt -X POST http://localhost:3000/api/admin/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<ZERO_STOCK_PRODUCT_ID>","quantity":1}],"status":"confirmed","paymentMethod":"efectivo","overrideStock":true}'
```

Expected: `{"success":true,"orderId":"<uuid>"}` — confirms the override flag works.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/orders/route.ts
git commit -m "feat: add manual order creation endpoint for admin"
```

---

### Task 7: Manual order admin UI (`/admin/orders/new`)

**Files:**
- Create: `app/admin/orders/new/page.tsx`
- Create: `app/admin/orders/new/ManualOrderForm.tsx`
- Create: `app/admin/orders/new/ProductPicker.tsx`
- Modify: `app/admin/orders/page.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/orders` (Task 6), `GET /api/admin/products?search=...` (existing route, returns `{ data: AdminProduct[] }`), `ORDER_STATES`/`ORDER_STATE_INFO` from `@/lib/constants/orderStates`, `calculateCartTotals` from `@/lib/domain/cart/calculate`.
- Produces: page at `/admin/orders/new` with a link back from `/admin/orders`.

- [ ] **Step 1: Write the product picker**

Create `app/admin/orders/new/ProductPicker.tsx`:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';

export interface PickableProduct {
  id: string;
  title: string;
  price_pen: number;
  stock: number;
  stock_status: string;
  country_code: string;
}

interface Props {
  onPick: (product: PickableProduct) => void;
}

export default function ProductPicker({ onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickableProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: '1', pageSize: '10', search: query, category: '', status: '', editorial: '', country_code: '', active: 'true' });
      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar producto por título o SKU..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
        />
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 shadow-xl">
          {loading ? (
            <p className="px-3 py-2 text-sm text-gray-400">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onPick(p); setQuery(''); setResults([]); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-[#ec4899]/10 transition-colors"
              >
                <span className="truncate">
                  {p.title}
                  <span className="text-xs text-gray-400 ml-2">
                    {p.stock_status === 'preorder' ? 'Preventa' : `Stock: ${p.stock}`}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#2b496d] dark:text-[#5a7a9e] shrink-0">
                  <Plus size={12} /> S/ {Number(p.price_pen).toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the manual order form**

Create `app/admin/orders/new/ManualOrderForm.tsx`:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import ProductPicker, { type PickableProduct } from './ProductPicker';
import { ORDER_STATES, ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import type { CartItem } from '@/context/CartContext';
import type { StockStatus } from '@/lib/products';

interface LineItem extends PickableProduct {
  quantity: number;
}

const PAYMENT_METHODS = ['yape', 'plin', 'transferencia', 'efectivo'];

export default function ManualOrderForm() {
  const router = useRouter();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [status, setStatus] = useState<OrderState>('confirmed');
  const [overrideStock, setOverrideStock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addProduct(p: PickableProduct) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === p.id);
      if (existing) return prev.map((l) => (l.id === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { ...p, quantity: 1 }];
    });
  }

  function setQuantity(id: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l)));
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const totals = useMemo(() => {
    const cartItems: CartItem[] = lines.map((l) => ({
      productId: l.id,
      title: l.title,
      price: Number(l.price_pen),
      quantity: l.quantity,
      editorial: '',
      stockStatus: l.stock_status as StockStatus,
    }));
    return calculateCartTotals({ items: cartItems, isFirstPurchase: false });
  }, [lines]);

  async function submit() {
    if (lines.length === 0) { setError('Agregá al menos un producto'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
        status,
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        overrideStock,
      }),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) { setError(json.error ?? 'Error al crear el pedido'); return; }
    router.push('/admin/orders');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Productos</span>
        <div className="mt-1">
          <ProductPicker onPick={addProduct} />
        </div>

        {lines.length > 0 && (
          <ul className="mt-3 space-y-2">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                  {l.title}
                  {l.stock_status === 'preorder' && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                      Preventa
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => setQuantity(l.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                  S/ {(Number(l.price_pen) * l.quantity).toFixed(2)}
                </span>
                <button type="button" onClick={() => removeLine(l.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nombre cliente</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            placeholder="Opcional"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Teléfono</span>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            placeholder="Opcional"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Método de pago</span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          >
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estado inicial</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderState)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          >
            {ORDER_STATES.map((s) => <option key={s} value={s}>{ORDER_STATE_INFO[s].label}</option>)}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={overrideStock}
          onChange={(e) => setOverrideStock(e.target.checked)}
          className="w-4 h-4 rounded accent-[#ec4899]"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Forzar aunque no haya stock registrado</span>
      </label>

      {lines.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>S/ {totals.subtotal.toFixed(2)}</span></div>
          {totals.preorderDeposit > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Depósito preventa (50%)</span><span>S/ {totals.preorderDeposit.toFixed(2)}</span></div>
          )}
          {totals.balanceDue > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Saldo pendiente</span><span>S/ {totals.balanceDue.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>S/ {totals.shipping.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200 dark:border-gray-700">
            <span>Total a cobrar hoy</span><span>S/ {totals.totalToPayNow.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || lines.length === 0}
        className="w-full py-2.5 text-sm font-semibold bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50 transition-colors"
      >
        {saving ? 'Guardando...' : 'Crear pedido'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write the page**

Create `app/admin/orders/new/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ManualOrderForm from './ManualOrderForm';

export const metadata: Metadata = {
  title: 'Admin — Cargar pedido manual',
  robots: { index: false },
};

export default function NewManualOrderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/orders" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
        <ChevronLeft size={16} />
        Volver a Pedidos
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Cargar pedido manual</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Para ventas presenciales o directas que no pasaron por el checkout web.
      </p>
      <ManualOrderForm />
    </div>
  );
}
```

- [ ] **Step 4: Link from the orders list**

In `app/admin/orders/page.tsx`, find the header block (currently lines 108-119):

```tsx
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
          <ChevronLeft size={16} />
          Volver al Admin
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Pedidos</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {orders?.length ?? 0} pedidos totales
        </p>
      </div>
```

Replace with:

```tsx
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
          <ChevronLeft size={16} />
          Volver al Admin
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Pedidos</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {orders?.length ?? 0} pedidos totales
            </p>
          </div>
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-2 bg-[#ec4899] hover:bg-[#d63384] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Cargar pedido manual
          </Link>
        </div>
      </div>
```

- [ ] **Step 5: Type-check and lint**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json && npm run lint
```

Expected: no type errors, no new lint errors.

- [ ] **Step 6: Manual verification in browser**

With the dev server running, go to `http://localhost:3000/admin/orders`, click "Cargar pedido manual". Search for a real in-stock product, add it, set quantity 2, confirm the totals preview updates. Fill in a customer name, pick "efectivo" as payment method, leave status as "Confirmado", click "Crear pedido". Confirm it redirects to `/admin/orders` and the new order appears at the top of the list with the right total.

Repeat with a `preorder` product while a campaign is open for its country — confirm the totals preview shows "Depósito preventa (50%)" and the created order's item shows the "Preventa" badge on the orders list.

- [ ] **Step 7: Commit**

```bash
git add app/admin/orders/new/ app/admin/orders/page.tsx
git commit -m "feat: add manual order entry UI for admin"
```

---

### Task 8: Campaign filter and display on `/admin/orders`

**Files:**
- Modify: `app/admin/orders/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/campaigns` data shape (`DbCampaign[]`) fetched server-side directly via Supabase (this is a server component, so query `campaigns` directly rather than calling the API route).
- Produces: a campaign filter `<select>` synced to `?campaign=<id>` query param, and each preorder order-item line shows its campaign name.

- [ ] **Step 1: Accept and apply the `campaign` search param, fetch campaigns for the filter and for name lookup**

In `app/admin/orders/page.tsx`, update the `OrderItem` type (currently lines 15-22) to include `campaign_id`:

```tsx
type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  item_type: string | null;
  estimated_arrival: string | null;
};
```

Replace with:

```tsx
type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  item_type: string | null;
  estimated_arrival: string | null;
  campaign_id: string | null;
};
```

Change the component signature (currently line 74) from:

```tsx
export default async function AdminOrdersPage() {
```

to:

```tsx
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign: campaignFilter } = await searchParams;
```

Find the Supabase query block (currently lines 93-100):

```tsx
  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, status, payment_type, total_pen, subtotal_pen, discount_pen, deposit_pen, balance_pen, shipping_cost, estimated_arrival, payment_proof_url, payment_proof_confirmed_at, payment_method, customer_name, customer_phone, notes, created_at, order_items(id, title, quantity, unit_price, item_type, estimated_arrival)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();
```

Replace with (adds `campaign_id` to the selected columns, fetches all campaigns for the filter dropdown + name lookup, and filters orders in memory when a campaign is selected — filtering at the DB level would need a join, but 100 rows is small enough):

```tsx
  const supabase = await createSupabaseServerClient();

  // Campañas cerradas quedan fuera del policy "campaigns_read_open" (RLS) para el
  // cliente anon-key, así que usamos el cliente admin (service role) para poder
  // listar TODAS las campañas en el filtro, no solo las abiertas.
  const supabaseAdmin = await createSupabaseAdminClient();
  const { data: campaigns } = await supabaseAdmin
    .from('campaigns')
    .select('id, name')
    .order('starts_at', { ascending: false });
  const campaignNameById = new Map((campaigns ?? []).map((c) => [c.id as string, c.name as string]));

  const { data: allOrders } = await supabase
    .from('orders')
    .select(
      'id, status, payment_type, total_pen, subtotal_pen, discount_pen, deposit_pen, balance_pen, shipping_cost, estimated_arrival, payment_proof_url, payment_proof_confirmed_at, payment_method, customer_name, customer_phone, notes, created_at, order_items(id, title, quantity, unit_price, item_type, estimated_arrival, campaign_id)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();

  const orders = campaignFilter
    ? (allOrders ?? []).filter((o) => o.order_items?.some((i) => i.campaign_id === campaignFilter))
    : allOrders;
```

Add the `createSupabaseAdminClient` import. Find the top of the file (currently line 1):

```tsx
import { createSupabaseServerClient } from '@/core/supabase/server';
```

Replace with:

```tsx
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/core/supabase/server';
```

- [ ] **Step 2: Add the filter dropdown to the header**

Find the header `<div>` block you just modified in Task 7 Step 4 (the one with the "Cargar pedido manual" link). Right after the closing `</div>` of that flex container (still inside the outer `mb-6` div), add the filter. `AdminOrdersPage` is a Server Component (no `'use client'` boundary), so this must be a plain HTML `<form method="get">` with a submit button — no `onChange` JS handler, since that requires client interactivity this file doesn't have:

```tsx
        {(campaigns ?? []).length > 0 && (
          <form className="mt-4 flex items-center gap-2" method="get">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Filtrar por campaña
            </label>
            <select
              name="campaign"
              defaultValue={campaignFilter ?? ''}
              className="text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            >
              <option value="">Todas</option>
              {(campaigns ?? []).map((c) => (
                <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
              ))}
            </select>
            <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2b496d] hover:bg-[#1e3550] text-white transition-colors">
              Filtrar
            </button>
          </form>
        )}
```

This is a plain HTML form GET submit (no JS needed), works inside a Server Component without any client boundary.

- [ ] **Step 3: Show the campaign name per preorder line item**

Find the item list rendering (currently lines 198-213):

```tsx
                {order.order_items?.length > 0 && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 mb-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex flex-wrap gap-2 items-baseline">
                        <span>
                          {item.title} × {item.quantity} — S/ {(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                        {item.item_type === 'preorder' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                            Preventa
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
```

Replace with:

```tsx
                {order.order_items?.length > 0 && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 mb-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex flex-wrap gap-2 items-baseline">
                        <span>
                          {item.title} × {item.quantity} — S/ {(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                        {item.item_type === 'preorder' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                            Preventa
                          </span>
                        )}
                        {item.item_type === 'preorder' && (
                          <span className="text-[10px] text-gray-400">
                            {item.campaign_id ? campaignNameById.get(item.campaign_id) ?? 'campaña eliminada' : 'sin campaña'}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
```

- [ ] **Step 4: Type-check and lint**

```bash
export PATH="/Users/gonzalo/.nvm/versions/node/v24.15.0/bin:$PATH" && npx tsc --noEmit -p tsconfig.json && npm run lint
```

Expected: no type errors, no new lint errors.

- [ ] **Step 5: Manual verification in browser**

Go to `http://localhost:3000/admin/orders`. Confirm the "Filtrar por campaña" dropdown appears (it only shows if at least one campaign exists — there should be one from Task 3/5's verification). Confirm the preorder order created in Task 5 Step 7 shows its campaign name next to the "Preventa" badge. Select the campaign in the dropdown, click "Filtrar", confirm the URL becomes `/admin/orders?campaign=<id>` and only orders with that campaign's items are shown. Select "Todas" and confirm the full list returns.

- [ ] **Step 6: Commit**

```bash
git add app/admin/orders/page.tsx
git commit -m "feat: filter and display campaign on admin orders list"
```

---

## Post-plan cleanup

- [ ] Remove any `/tmp/admin-cookie.txt` or other throwaway files created during manual verification (they're outside the repo, but confirm nothing was accidentally created inside `/Volumes/Neko/webs/nekomangacix`).
- [ ] Run the full verification suite once more end-to-end: `npx tsc --noEmit -p tsconfig.json && npm run lint && npm run build` (with the Node v24 PATH prefix) to confirm the whole feature builds cleanly together, not just per-task.
