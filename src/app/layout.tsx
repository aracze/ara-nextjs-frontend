/**
 * KOŘENOVÝ LAYOUT (Root Layout)
 * ----------------------------
 * Tento soubor definuje strukturu HTML, která obaluje všechny stránky v aplikaci.
 * Next.js ho automaticky použije pro každou trasu (route).
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isProduction } from "@/lib/utils";
import Search from "@/components/layout/search/search";
import { Header } from "@/components/layout/header/header";
import { WebVitals } from "@/components/features/web-vitals";
import { fetchParentPages } from "@/lib/strapi";

// 1. NASTAVENÍ PÍSEM (Google Fonts)
// Používá moderní Geist font, proměnné se pak používají v CSS (Tailwind)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. SEO METADATA
// Definují <title> a <meta name="description"> v hlavičce webu
export const metadata: Metadata = {
  title: {
    template: "%s | Ara.cz - Cestovní průvodce",
    default: "Ara.cz - Cestovní průvodce",
  },
  description: "Váš průvodce po světě",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await fetchParentPages();

  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!isProduction() && <WebVitals />}

        {/* HLAVNÍ KONTEJNER: flex rozložení pro menu a obsah */}
        <div className="flex h-screen flex-row md:flex-col md:overflow-hidden">
          {data.pages?.length > 0 && (
            <Header pages={data.pages} header={data.global?.header} />
          )}
          {/* B) VYHLEDÁVÁNÍ: Fixní tlačítko vpravo dole */}
          <div className="fixed bottom-4 right-4">
            <Search />
          </div>
          <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
      </body>
    </html>
  );
}
