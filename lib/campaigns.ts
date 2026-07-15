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
