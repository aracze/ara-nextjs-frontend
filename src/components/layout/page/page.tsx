import { Page as StrapiPage, PageChild } from "@/types/strapi";
import { ArticlesList } from "@/components/features/articles-list";
import { HeroSection } from "./hero-section";
import { Subnavigation } from "./subnavigation";
import { MainContent } from "./main-content";

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
            <HeroSection title={page.title} imageUrl={imageUrl} />  

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
