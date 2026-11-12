'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

/**
 * Por ahora el sitio va solo en tema claro (decisión del 2026-11-12): la marca
 * ya usa bloques oscuros (pie de página, carteles de eventos) y el claro les da
 * contraste. Las clases `dark:` siguen en los componentes; para volver a
 * ofrecer el oscuro basta con quitar `forcedTheme` y devolver el
 * `ThemeToggle` al encabezado.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
