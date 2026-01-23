/**
 * KOŘENOVÝ LAYOUT (Root Layout)
 * ----------------------------
 * Tento soubor definuje strukturu HTML, která obaluje všechny stránky v aplikaci.
 * Next.js ho automaticky použije pro každou trasu (route).
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getStrapiURL } from "@/lib/utils";
import Search from "@/components/layout/search/search";
import { Header } from "@/components/layout/header/header";

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
  title: "Ara.cz - Cestovní průvodce",
  description: "Váš průvodce po světě",
};

async function getData() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(getStrapiURL() + "/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        query {
          global {
            header {
              logo {
                svgCode
              }
            }
          }
          pages(filters: { parent: { documentId: { null: true } } }) {
            documentId
            title
            slug
            children {
              title
              slug
              documentId
            }
          }
        }`,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await getData();

  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
