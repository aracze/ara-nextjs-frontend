"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Page, GlobalHeader } from "@/types/strapi";
import Search from "@/components/features/search/search";

export function Header({
  pages,
  header,
}: {
  pages: Page[];
  header?: GlobalHeader;
}) {
  const logo = header?.logo;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header
      className={`absolute top-0 left-0 w-full z-[200] transition-colors duration-300 ${
        activeDropdown ? "bg-[#215491]" : "bg-transparent"
      } group/header`}
    >
      {/* Background Gradient overlay like Grails :after */}
      <div
        className={`absolute inset-0 h-[65px] bg-gradient-to-b from-black/50 to-transparent z-[-1] transition-opacity duration-300 ${activeDropdown ? "opacity-0" : "opacity-100"}`}
      />

      {/* MAIN NAVBAR */}
      <nav className="h-[65px] border-b border-white/10 flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center w-full gap-8">
          {/* LOGO */}
          {logo && (
            <Link href="/" className="flex items-center shrink-0">
              {logo.svgCode ? (
                <div
                  className="h-[26px] w-auto flex items-center [&_svg]:h-[26px] [&_svg]:w-auto"
                  dangerouslySetInnerHTML={{
                    __html: logo.svgCode
                      .replace(/fill="#fff"/g, 'fill="white"')
                      .replace(/fill="#[a-f0-9]{6}"/gi, 'fill="white"'),
                  }}
                />
              ) : (
                logo.image && (
                  <Image
                    src={new URL(
                      logo.image.url,
                      process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
                        "http://localhost:1337",
                    ).toString()}
                    alt={logo.image.alternativeText || "Logo"}
                    width={132}
                    height={26}
                    className="h-[26px] w-auto object-contain"
                  />
                )
              )}
            </Link>
          )}

          {/* NAV LINKS (Top-level Pages) */}
          <div className="hidden md:flex items-center gap-2 h-full text-white/90 font-semibold">
            {pages?.map((page) => {
              const hasChildren = page.children?.length > 0;
              return (
                <div
                  key={page.documentId}
                  className="relative h-[65px] flex items-center"
                  onMouseEnter={() =>
                    hasChildren && setActiveDropdown(page.documentId)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/${page.fullSlug}`}
                    className="px-4 hover:text-white transition-colors uppercase tracking-wider text-sm font-bold font-heading"
                  >
                    {page.title}
                  </Link>

                  {/* Dropdown for subpages */}
                  {hasChildren && activeDropdown === page.documentId && (
                    <div className="absolute top-[65px] left-0 bg-white shadow-2xl min-w-[200px] py-2 rounded-b-lg border-t-2 border-[#1A4579] animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-col">
                        {page.children.map((child) => (
                          <Link
                            key={child.documentId}
                            href={`/${child.fullSlug}`}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#215491] transition-all"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Search />
            <button className="hidden lg:block px-5 py-1.5 border-2 border-white/50 rounded-full text-white text-[13px] font-bold hover:bg-white hover:text-[#215491] transition-all uppercase tracking-wider font-heading">
              Rady na cestu
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
