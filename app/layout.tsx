import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { PromotionsProvider } from "@/context/PromotionsContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChromeLayout from "@/components/ChromeLayout";
import SiteAnalytics from "@/components/SiteAnalytics";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// El sistema de diseño declara `--font-geist-sans` / `--font-geist-mono` en
// `@theme`, pero nadie cargaba las fuentes: las variables quedaban vacías y
// todo el sitio caía al Arial del `body`.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const HOME_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const SOCIAL_DESCRIPTION = "Manga en español y coleccionables originales. Envíos a todo el Perú.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "neko manga cix", "nekomangacix", "manga", "tienda manga", "manga perú",
    "manga chiclayo", "comprar manga", "coleccionables anime", "anime perú",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  // `./` se resuelve contra la ruta de cada página: una página que no declara
  // su propia canónica recibe la suya, no la del home.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "./",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Verificación de Search Console por etiqueta. Sin la variable no se emite.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <AuthProvider>
            <PromotionsProvider>
            <FavoritesProvider>
              <CartProvider>
                <ToastProvider>
                  <ChromeLayout>{children}</ChromeLayout>
                </ToastProvider>
              </CartProvider>
            </FavoritesProvider>
            </PromotionsProvider>
          </AuthProvider>
        </ThemeProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
