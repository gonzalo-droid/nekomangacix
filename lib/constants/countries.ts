export const COUNTRY_CODES = ['AR', 'MX', 'ES', 'JP'] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export const COUNTRIES: Record<CountryCode, { name: string; flag: string }> = {
  AR: { name: 'Argentina', flag: '🇦🇷' },
  MX: { name: 'México', flag: '🇲🇽' },
  ES: { name: 'España', flag: '🇪🇸' },
  JP: { name: 'Japón', flag: '🇯🇵' },
};

export function getCountryName(code: CountryCode | null | undefined): string {
  if (!code) return '';
  return COUNTRIES[code]?.name ?? '';
}

export function getCountryFlag(code: CountryCode | null | undefined): string {
  if (!code) return '';
  return COUNTRIES[code]?.flag ?? '';
}

export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}
