import type { CountryCode } from './countries';

export const EDITORIALS_BY_COUNTRY: Record<CountryCode, readonly string[]> = {
  AR: ['Ivrea', 'Ovnipress', 'Panini Argentina'],
  MX: ['Panini México', 'Kamite', 'Distrito Manga'],
  ES: ['Ivrea España', 'Planeta Cómic', 'Norma Editorial', 'Milky Way', 'ECC Ediciones'],
  JP: ['Shueisha', 'Kodansha', 'Shogakukan', 'Kadokawa', 'Square Enix'],
};

export const ALL_EDITORIALS: readonly string[] = Object.values(EDITORIALS_BY_COUNTRY).flat();

export function getEditorialsForCountry(code: CountryCode | null | undefined): readonly string[] {
  if (!code) return ALL_EDITORIALS;
  return EDITORIALS_BY_COUNTRY[code] ?? [];
}

export function getCountryForEditorial(editorial: string): CountryCode | null {
  for (const [code, list] of Object.entries(EDITORIALS_BY_COUNTRY) as [CountryCode, readonly string[]][]) {
    if (list.includes(editorial)) return code;
  }
  return null;
}
