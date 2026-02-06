import { Page as StrapiPage, PageChild } from "@/types/strapi";
import { ArticlesList } from "@/components/features/articles-list";
import { HeroSection } from "./hero-section";
import { Subnavigation } from "./subnavigation";
import { MainContent } from "./main-content";
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
              <HeroSection title={page.title} imageUrl={imageUrl} />
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
            <Subnavigation title={page.title} pageChildren={page.children} />

            {/* 2. CONTENT AREA */}
            <MainContent text={page.text} children={page.children} />

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
