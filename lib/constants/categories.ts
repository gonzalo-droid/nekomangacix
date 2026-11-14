/** Nombre visible de cada género. Sin dependencias: lo usa la ficha en el navegador. */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    shonen: 'Shonen', seinen: 'Seinen', shojo: 'Shojo', josei: 'Josei',
    kodomo: 'Kodomo', isekai: 'Isekai', slice_of_life: 'Slice of Life',
    horror: 'Horror', romance: 'Romance', action: 'Acción', comedy: 'Comedia',
    drama: 'Drama', fantasy: 'Fantasía', 'sci-fi': 'Ciencia Ficción',
    sports: 'Deportes', mystery: 'Misterio',
  };
  return labels[category] || category;
}
