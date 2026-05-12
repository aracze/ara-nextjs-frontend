import React from "react";
import { PageCategory, PageChild, RichTextRoot } from "@/types/payload";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { LocalTime } from "@/components/features/local-time";
import { richTextToHtml } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /<(h[23])>(.*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1][1], 10);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\-]/gu, "");
    headings.push({ id, text, level });
  }
  return headings;
}

export const MainContent = ({
  text,
  pageChildren = [],
  pageCategory,
  timezone,
  currencyCode,
  exchangeRate,
  pageTitle,
  genitive,
}: {
  text: string | RichTextRoot;
  pageChildren: PageChild[];
  pageCategory?: PageCategory;
  timezone?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number | null;
  pageTitle?: string | null;
  genitive?: string | null;
}) => {
  const placeCategories: PageCategory[] = [
    PageCategory.Misto_k_navstiveni,
    PageCategory.Mista,
    PageCategory.Turisticky_cil,
  ];
  const showAktualniInfo =
    !!pageCategory && placeCategories.includes(pageCategory);
  const textHtml = richTextToHtml(text, { currencyCode, exchangeRate });
  const tocCategories: PageCategory[] = [
    PageCategory.Vstupni_podminky,
    PageCategory.Mena_a_ceny,
    PageCategory.Pocasi,
    PageCategory.Cesta,
    PageCategory.Doprava,
    PageCategory.Zdravi_a_bezpeci,
    PageCategory.Jazyk_a_kultura,
    PageCategory.Jidlo_a_pit,
    PageCategory.Prakticke_informace,
  ];
  const showTableOfContents =
    !!pageCategory && tocCategories.includes(pageCategory);
  const headings = showTableOfContents ? extractHeadings(textHtml) : [];

  const practicalInfoChild = pageChildren.find(
    (c) =>
      c.title === "Praktické informace" ||
      c.fullSlug.includes("/prakticke-informace"),
  );

  const cleanGenitive = genitive?.replace(/^do\s+/i, "");
  const displayName = cleanGenitive || pageTitle;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-18 py-12 md:py-20 flex flex-col md:flex-row gap-16 lg:gap-24">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>
            {textHtml}
          </ReactMarkdown>
        </div>
      </div>

      {/* Sidebar / Info Column */}
      <aside className="w-full md:w-80 flex flex-col gap-12 relative">
        {/* Time, Exchange & Practical Info — for place-type pages */}
        {showAktualniInfo &&
          (timezone || exchangeRate || practicalInfoChild) && (
            <div className="relative pl-8">
              {/* Vertical line (shortened) */}
              <div className="absolute left-0 top-[20%] h-[70%] w-px bg-[#e4e4e4]" />

              <div className="text-center bg-white py-4 px-0">
                {/* Section 1: Time and Exchange Rate */}
                {(timezone || exchangeRate) && (
                  <div className="mb-6">
                    <h2 className="text-[20px] font-bold text-[#1a3f6c] mb-4">
                      {timezone && exchangeRate
                        ? "Aktuální čas a kurz měny"
                        : exchangeRate
                          ? "Aktuální měnový kurz"
                          : "Aktuální čas"}
                    </h2>
                    {timezone && (
                      <>
                        <LocalTime timezone={timezone} />
                        {exchangeRate && (
                          <div className="w-[250px] mx-auto border-b border-[#e4e4e4] mt-4 mb-4" />
                        )}
                      </>
                    )}
                    {exchangeRate && currencyCode && (
                      <Link
                        href={
                          practicalInfoChild
                            ? `${practicalInfoChild.fullSlug}#mena-a-ceny`
                            : "#"
                        }
                        className="block text-[26px] tracking-[0.01rem] text-[#333] mt-4 hover:no-underline"
                      >
                        1 {currencyCode} ={" "}
                        {exchangeRate.toLocaleString("cs-CZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        CZK
                      </Link>
                    )}
                  </div>
                )}

                {/* Section 2: Practical Info */}
                {practicalInfoChild && pageTitle && (
                  <Link
                    href={practicalInfoChild.fullSlug}
                    className="block hover:no-underline group relative mt-6 pt-4"
                  >
                    <h2 className="text-[22px] font-bold text-[#1a3f6c] mb-6 group-hover:underline leading-tight">
                      Praktické informace <br />
                      do {displayName}
                    </h2>
                    <div className="relative inline-block w-full">
                      <div className="absolute top-1/2 -translate-y-1/2 left-[calc(50%+70px)] w-[55px] h-[55px] bg-[url('/assets/information/essentials-gray.gif')] bg-no-repeat bg-contain opacity-20 z-0" />
                      <div className="relative z-10 text-[18px] text-[#888] leading-[1.5]">
                        <p className="m-0">
                          Praktické cestovní informace <br />
                          při cestě do {displayName}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

        {/* Table of Contents — for "Vstupní podmínky" */}
        {showTableOfContents && headings.length > 0 && (
          <nav className="hidden lg:block sticky top-24">
            <ul>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className={`block py-4 border-b border-[#e4e4e4] transition-colors duration-300 hover:text-black no-underline ${
                      heading.level === 2
                        ? "font-semibold text-gray-800/85"
                        : "font-normal text-gray-800/65"
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Sub-pages list */}
        {pageChildren.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-gray-900 font-bold mb-6 text-xl">Podstránky</h3>
            <ul className="space-y-4">
              {pageChildren.map((child: PageChild) => (
                <li key={child.id}>
                  <Link
                    href={child.fullSlug}
                    className="flex items-center group"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#215491]/30 mr-3 group-hover:bg-[#215491] transition-colors" />
                    <span className="text-gray-700 font-semibold group-hover:text-[#215491] transition-colors font-heading">
                      {child.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </main>
  );
};
