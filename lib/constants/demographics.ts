export const DEMOGRAPHICS = ['shonen', 'seinen', 'shojo', 'josei', 'kodomo'] as const;
export type Demographic = (typeof DEMOGRAPHICS)[number];

export const DEMOGRAPHIC_LABELS: Record<Demographic, string> = {
  shonen: 'Shōnen',
  seinen: 'Seinen',
  shojo: 'Shōjo',
  josei: 'Josei',
  kodomo: 'Kodomo',
};

export function isDemographic(value: string): value is Demographic {
  return (DEMOGRAPHICS as readonly string[]).includes(value);
}
