import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstagramFeed from "@/components/InstagramFeed";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neko Manga Cix - Tienda de Manga Online",
  description: "Tu tienda de manga online en Perú. Envíos a nivel nacional. Encuentra tus mangas favoritos.",
  keywords: "manga, tienda online, perú, chiclayo, neko manga",
  authors: [{ name: "Neko Manga Cix" }],
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
          <FavoritesProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <InstagramFeed />
              <Footer />
              <WhatsAppFloatingButton />
            </CartProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
