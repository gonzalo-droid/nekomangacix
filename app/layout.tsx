import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChromeLayout from "@/components/ChromeLayout";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nekomangacix.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NEKO MANGA CIX — Tu tienda de manga y coleccionables en Perú",
    template: "%s · NEKO MANGA CIX",
  },
  description:
    "NEKO MANGA CIX — la tienda online peruana de manga y coleccionables. Editoriales Argentina, México y España. Envíos a todo el país desde Chiclayo.",
  keywords: [
    "neko manga cix", "nekomangacix", "manga", "tienda manga", "manga perú",
    "manga chiclayo", "comprar manga", "coleccionables anime", "anime perú",
  ],
  authors: [{ name: "NEKO MANGA CIX" }],
  creator: "NEKO MANGA CIX",
  applicationName: "NEKO MANGA CIX",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_URL,
    siteName: "NEKO MANGA CIX",
    title: "NEKO MANGA CIX — Tu tienda de manga y coleccionables en Perú",
    description:
      "Editoriales Argentina, México y España + coleccionables originales. Envíos a todo el Perú.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "NEKO MANGA CIX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEKO MANGA CIX — Tu tienda de manga y coleccionables en Perú",
    description: "Manga de Argentina, México y España + coleccionables originales. Envíos a todo el Perú.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <ChromeLayout>{children}</ChromeLayout>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
