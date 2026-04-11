'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Page, ImageLink } from '@/types/payload';
import Search from '@/components/features/search/search';

export function Header({
  pages,
  headerLogo,
}: {
  pages: Page[];
  headerLogo?: ImageLink | null;
}) {
  const logo = headerLogo;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Najdeme aktuálně aktivní stránku pro mega menu
  const activePage = pages?.find((p) => String(p.id) === activeDropdown);

  return (
    <header
      className={`absolute top-0 left-0 w-full z-[200] transition-colors duration-300 ${
        activeDropdown ? 'bg-[#215491]' : 'bg-transparent'
      } group/header`}
    >
      <div
        className={`absolute inset-0 h-[65px] bg-gradient-to-b from-black/50 to-transparent z-[-1] transition-opacity duration-300 ${
          activeDropdown ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <nav className="h-[65px] border-b border-white/10 flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center w-full gap-8">
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
                      process.env.NEXT_PUBLIC_PAYLOAD_BASE_URL ||
                        'http://localhost:3000',
                    ).toString()}
                    alt={logo.image.alternativeText || 'Logo'}
                    width={132}
                    height={26}
                    className="h-[26px] w-auto object-contain"
                  />
                )
              )}
            </Link>
          )}

          <div className="hidden md:flex items-center gap-2 h-full text-white/90 font-semibold">
            {pages?.map((page) => {
              const hasChildren = page.children?.docs?.length > 0;
              return (
                <div
                  key={page.id}
                  className="h-[65px] flex items-center"
                  onMouseEnter={() =>
                    hasChildren && setActiveDropdown(String(page.id))
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={page.fullSlug}
                    className="px-4 text-white hover:text-gray-100 transition-colors tracking-wide text-[15px] font-semibold font-heading flex items-center gap-1"
                  >
                    {page.title}
                    {hasChildren && (
                      <span className="inline-block border-white hover:border-gray-100 border-t-4 border-l-4 border-r-4 border-l-transparent border-r-transparent border-white/60" />
                    )}
                  </Link>
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

      {/* Mega Menu - Vykresleno pouze jednou mimo loop pro čistší DOM a lepší pozicování */}
      {activePage && activePage.children?.docs?.length > 0 && (
        <div
          className="absolute left-0 right-0 w-full bg-[#215490] border-b-2 border-[#1A4579] shadow-2xl transition-all duration-300 top-[65px] z-[150] pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-200"
          onMouseEnter={() => setActiveDropdown(String(activePage.id))}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="bg-white py-2">
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
              <div className="grid grid-cols-5 gap-y-4 gap-x-12">
                {activePage.children.docs.map((child) => (
                  <Link
                    key={child.id}
                    href={child.fullSlug}
                    className="text-[15px] text-gray-800 py-1 transition-all inline-block w-full [text-shadow:1px_2px_3px_rgb(255,255,255)] hover:text-white hover:bg-[#3C6EAA] hover:px-4 hover:-mx-4 hover:rounded-sm hover:no-underline hover:shadow-none hover:[text-shadow:none]"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
