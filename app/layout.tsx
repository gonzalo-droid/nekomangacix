import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstagramFeed from "@/components/InstagramFeed";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nekomangacix.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Neko Manga Cix - Tienda de Manga Online en Perú",
    template: "%s — NekoMangaCix",
  },
  description: "Tu tienda de manga online en Perú. Mangas de Argentina y México. Envíos a todo el país desde Chiclayo.",
  keywords: ["manga", "tienda manga", "manga perú", "manga chiclayo", "comprar manga", "neko manga", "anime"],
  authors: [{ name: "Neko Manga Cix" }],
  creator: "Neko Manga Cix",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_URL,
    siteName: "NekoMangaCix",
    title: "Neko Manga Cix - Tienda de Manga Online en Perú",
    description: "Tu tienda de manga online en Perú. Mangas de Argentina y México. Envíos a todo el país.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "NekoMangaCix" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neko Manga Cix - Tienda de Manga Online en Perú",
    description: "Tu tienda de manga online en Perú. Mangas de Argentina y México. Envíos a todo el país.",
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
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <WhatsAppFloatingButton />
            </CartProvider>
          </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
