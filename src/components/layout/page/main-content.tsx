import { PageCategory, PageChild } from "@/types/payload";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { LocalTime } from "@/components/features/local-time";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
      // Match github-slugger (used by rehype-slug): keeps unicode letters/diacritics
      const id = text
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\-]/gu, "");
      headings.push({ id, text, level });
    }
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
}: {
  text: string;
  pageChildren: PageChild[];
  pageCategory?: PageCategory;
  timezone?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number | null;
}) => {
  const placeCategories: PageCategory[] = [
    PageCategory.Misto_k_navstiveni,
    PageCategory.Mista,
    PageCategory.Turisticky_cil,
  ];
  const showAktualniInfo = !!pageCategory && placeCategories.includes(pageCategory);
  const showTableOfContents = pageCategory === PageCategory.Vstupni_podminky;
  const headings = showTableOfContents ? extractHeadings(text) : [];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-18 py-12 md:py-20 flex flex-col md:flex-row gap-16 lg:gap-24">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>{text}</ReactMarkdown>
        </div>
      </div>

      {/* Sidebar / Info Column */}
      <aside className="w-full md:w-80 flex flex-col gap-12 relative">
        {/* Time & Exchange Info — for place-type pages */}
        {showAktualniInfo && (timezone || exchangeRate) && (
          <div className="pl-5 border-l border-[#e4e4e4]">
            <div className="text-center bg-white py-7 px-0">
              <h2 className="text-base font-bold text-[#1a3f6c] mb-4">
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
                    <div className="w-[250px] mx-auto border-b border-[#e4e4e4] mt-3 mb-3" />
                  )}
                </>
              )}

              {exchangeRate && currencyCode && (
                <div className="text-[26px] tracking-[0.01rem] text-[#333] mt-3">
                  1 {currencyCode} = {exchangeRate.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CZK
                </div>
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
