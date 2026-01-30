import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { isProduction } from "@/lib/utils";
import Link from "next/link";
import { Page as StrapiPage, PageChild } from "@/types/strapi";
import { ArticlesList } from "@/components/features/articles-list";

/**
 * Page Component
 * --------------------
 * Renders a premium page layout featuring a full-width hero section,
 * dynamic content area, and responsive design elements.
 */
export const Page = ({ pages }: { pages: StrapiPage[] }) => {
  if (!pages || pages.length === 0) return null;

  return (
    <div className="flex flex-col bg-white overflow-x-hidden transition-all duration-500">
      {pages.map((page) => {
        const imageUrl = page.featuredImage?.image?.url
          ? page.featuredImage.image.url.startsWith("/")
            ? new URL(
                page.featuredImage.image.url,
                process.env.STRAPI_BASE_API_URL,
              ).toString()
            : page.featuredImage.image.url
          : null;

        return (
          <article key={page.documentId} className="w-full">
            {/* 1. HERO SECTION (initial-photo) */}
            <section className="relative w-full h-[350px] overflow-hidden bg-[#3b444f]">
              {/* Cover Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-no-repeat bg-center transition-transform duration-[10000ms] hover:scale-105"
                style={{
                  backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                  backgroundPosition: "50% 35%",
                }}
              />

              {/* Title Content - Overlaid like in Grails */}
              <div className="relative z-[101] h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h1 className="text-[36px] font-bold text-white text-center drop-shadow-[1px_1_1px_rgba(0,0,0,0.5)] tracking-normal">
                  {page.title}
                </h1>
              </div>

              {/* Static Hero Overlay (Blur Blob) */}
              <div className="absolute top-0 left-0 right-0 mx-auto w-full max-w-[800px] h-full opacity-30 z-[100] flex items-center justify-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 80.34 40.73"
                  className="w-full h-auto"
                >
                  <defs>
                    <filter
                      id="blurFilter"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                    </filter>
                  </defs>
                  <path
                    filter="url(#blurFilter)"
                    fill="black"
                    d="M68.08,23.76a12.24,12.24,0,0,1-7.59,3.12A70.6,70.6,0,0,0,50.88,28,15.8,15.8,0,0,0,47,29.26,42.49,42.49,0,0,1,39.51,31a26.17,26.17,0,0,1-4.77.25,1.29,1.29,0,0,0-.75.07,3.38,3.38,0,0,1-1.26-.14,9.61,9.61,0,0,1-2.51.14l.25-.07a.45.45,0,0,0-.25.07,47,47,0,0,1-7.49-.7,13.18,13.18,0,0,1-5.37-2.37,33.35,33.35,0,0,1-5.68-5.2,7.47,7.47,0,0,1-1.79-4.31,6.81,6.81,0,0,1,1.39-4.69c1.82-2.45,4.42-3.39,7.29-3.74,2.71-.33,5.46-.43,8.17-.85l.82-.14a7.65,7.65,0,0,1,2.24-.14h.14a1.21,1.21,0,0,1,.67-.14h4.94a1.18,1.18,0,0,1,.67.14,7.65,7.65,0,0,1,2.24.14,6.4,6.4,0,0,0,2.14.11,36.48,36.48,0,0,0,4.31.09c1-.06,2.07-.08,3.1-.08a38.05,38.05,0,0,1,7,.93c2.23.43,4.44,1,6.69,1.36a13.3,13.3,0,0,1,5.49,2.09C70.83,16.34,71.46,20.54,68.08,23.76Z"
                  />
                </svg>
              </div>

              {/* Static Hero Wave (Match Grails SVG) */}
              <div className="absolute bottom-[-1px] left-0 right-0 z-[101] flex leading-none translate-y-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1400 71.8"
                  className="w-full h-12 md:h-18 lg:h-[72px]"
                  preserveAspectRatio="none"
                >
                  <path
                    fill="#215491"
                    d="M1400,0v38.6c-0.2,0.1-0.4,0.1-0.5,0.2c-94.8,30.2-281.1,46.1-565.8,18.9C1188.5,68.3,1332.9,32.8,1400,0z"
                  ></path>
                  <path
                    fill="#FFF"
                    d="M0,70.7v1.1l1089.1-0.1c-74.2-0.5-159.4-4.8-256-14C309.8,11.4,0,70.7,0,70.7z"
                  ></path>
                  <path
                    fill="#FFF"
                    d="M1115.7,71.7h-26.6C1098.2,71.8,1107.1,71.8,1115.7,71.7H1400v-33C1341.3,57.6,1247,70.9,1115.7,71.7z"
                  ></path>
                </svg>
              </div>
            </section>

            {/* Sub-navigation bar style */}
            <div className="bg-white py-4 md:py-6 border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
              <div className="max-w-7xl mx-auto px-4 md:px-12">
                <div className="flex gap-4 md:gap-8 justify-center text-xs md:text-sm font-bold text-[#1a3f6c]">
                  <span className="border-b-2 border-[#215491] text-[#215491] pb-1 uppercase tracking-wider">
                    {page.title}
                  </span>
                  {page.children?.slice(0, 8).map((child) => (
                    <Link
                      key={child.documentId}
                      href={`/${child.fullSlug}`}
                      className="hover:text-[#215491] transition-colors uppercase tracking-wide text-gray-500"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20 flex flex-col md:flex-row gap-16 lg:gap-24">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed font-sans prose-headings:text-[#1a3f6c] prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {page.text}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Sidebar / Info Column */}
              <aside className="w-full md:w-80 flex flex-col gap-12">
                {/* Time & Exchange Info Mockup */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-sm transition-shadow">
                  <h3 className="text-gray-900 font-bold mb-6 text-xl border-l-4 border-[#215491] pl-4">
                    Aktuální info
                  </h3>
                  <div className="space-y-8">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-[#215491] font-bold">
                        Lokální čas
                      </span>
                      <span className="text-3xl font-light text-gray-800 tabular-nums mt-1 uppercase">
                        pátek{" "}
                        {new Date().toLocaleTimeString("cs-CZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        OH
                      </span>
                    </div>
                    <div className="h-[1px] bg-gray-100" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-[#215491] font-bold">
                        Měnový kurz
                      </span>
                      <div className="mt-2 text-2xl font-light text-gray-800">
                        1 HRK = 3,27 CZK
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-pages list */}
                {page.children && page.children.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <h3 className="text-gray-900 font-bold mb-6 text-xl">
                      Podstránky
                    </h3>
                    <ul className="space-y-4">
                      {page.children.map((child: PageChild) => (
                        <li key={child.documentId}>
                          <Link
                            href={`/${child.fullSlug}`}
                            className="flex items-center group"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#215491]/30 mr-3 group-hover:bg-[#215491] transition-colors" />
                            <span className="text-gray-700 font-semibold group-hover:text-[#215491] transition-colors">
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

            {/* 3. ARTICLES SECTION */}
            {(() => {
              console.log(
                `[Frontend] Rendering page ${page.title}, articles count:`,
                page.articles?.length || 0,
              );
              return null;
            })()}
            {page.articles && page.articles.length > 0 && (
              <ArticlesList
                articles={page.articles}
                parentFullSlug={page.fullSlug}
              />
            )}

            {/* Debug Raw Data Footer (Only in Local/Dev) */}
            {!isProduction() && (
              <footer className="max-w-7xl mx-auto px-4 md:px-12 py-12 border-t border-gray-100">
                <details className="cursor-pointer group">
                  <summary className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                    Vývojářská Data (JSON)
                  </summary>
                  <pre className="mt-6 overflow-x-auto rounded-xl bg-gray-900 p-8 text-[11px] leading-relaxed text-blue-200/80 shadow-inner">
                    {JSON.stringify(page, null, 2)}
                  </pre>
                </details>
              </footer>
            )}
          </article>
        );
      })}
    </div>
  );
};
