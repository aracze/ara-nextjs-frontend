"use client";

import Link from "next/link";
import Image from "next/image";
import { Page, GlobalHeader } from "@/types/strapi";

export function Header({
  pages,
  header,
}: {
  pages: Page[];
  header?: GlobalHeader;
}) {
  const logo = header?.logo;

  return (
    <header className="w-full relative z-50 shadow-md">
      {/* MAIN NAVBAR */}
      <nav className="h-16 bg-[#215491]">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center h-full gap-8">
          {/* LOGO */}
          {logo && (
            <Link href="/" className="flex items-center">
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
          <div className="hidden md:flex items-center gap-8 h-full text-white font-semibold text-sm">
            {pages?.map((page) => (
              <div
                key={page.documentId}
                className="relative group h-full flex items-center"
              >
                <Link
                  href={page.slug}
                  className="hover:text-white/80 transition-colors uppercase tracking-wider"
                >
                  {page.title}
                </Link>

                {/* Simple Dropdown for subpages */}
                {page.children?.length > 0 && (
                  <div className="absolute top-16 left-0 hidden group-hover:block bg-white shadow-xl min-w-[200px] py-2 border-t-2 border-[#1A4579]">
                    {page.children.map((child) => (
                      <Link
                        key={child.documentId}
                        href={child.slug}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1a3f6c]"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
