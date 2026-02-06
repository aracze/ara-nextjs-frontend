import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { isProduction } from "@/lib/utils";
import Link from "next/link";
import { Page as StrapiPage, PageChild } from "@/types/strapi";
import { ArticlesList } from "@/components/features/articles-list";
import { StaticHeroWave } from "@/components/features/static-hero-wave";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroImage } from "@/components/features/static-hero-image";

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
              <StaticHeroImage
                imageUrl={imageUrl}
                styleCss={page.featuredImage?.featureImageStyleCss || undefined}
              />

              {/* Title Content - Overlaid like in Grails */}
              <div className="relative z-[101] h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h1 className="text-[36px] font-bold text-white text-center drop-shadow-[1px_1_1px_rgba(0,0,0,0.5)] tracking-normal">
                  {page.title}
                </h1>
              </div>

              {/* Static Hero Overlay (Blur Blob) */}
              <StaticHeroOverlay filterId={`blurFilter-${page.documentId}`} />

              {/* Static Hero Wave (Match Grails SVG) */}
              <StaticHeroWave />
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

            {page.articles && page.articles.length > 0 && (
              <ArticlesList
                articles={page.articles}
                parentFullSlug={page.fullSlug}
              />
            )}
          </article>
        );
      })}
    </div>
  );
};
