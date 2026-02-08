import { Page as StrapiPage } from "@/types/strapi";
import { ArticlesList } from "@/components/features/articles-list";
import { HeroSection } from "./hero-section";
import { Subnavigation } from "./subnavigation";
import { MainContent } from "./main-content";
import { PlacesToVisit } from "./places-to-visit";
import { fetchPageByFullSlug } from "@/lib/strapi";
import { PageCategory } from "@/types/strapi";

const rootPageCategories: PageCategory[] = [
  PageCategory.Mista,
  PageCategory.Turisticky_cil,
  PageCategory.Misto_k_navstiveni,
];

export const Page = async ({ page }: { page: StrapiPage }) => {
  const rootPage = await fetchRootPage(page);

  const imageUrl = getHeroImage(page, rootPage);

  return (
    <div className="flex flex-col bg-white overflow-x-hidden transition-all duration-500">
      <article key={page.documentId} className="w-full">
        {/* 1. HERO SECTION (initial-photo) */}
        <HeroSection
          title={page.title}
          imageUrl={imageUrl}
          styleCss={page.featuredImage?.featureImageStyleCss || undefined}
          filterId={`blurFilter-${page.documentId}`}
        />

        {/* Sub-navigation bar style */}
        <Subnavigation
          title={rootPage.title}
          pageChildren={rootPage.children}
          currentPageDocumentId={page.documentId}
        />

        {/* 2. CONTENT AREA */}
        <MainContent text={page.text} pageChildren={page.children} />

        {/* 3. PLACES TO VISIT SECTION */}
        <PlacesToVisit pageChildren={page.children} />

        {page.articles && page.articles.length > 0 && (
          <ArticlesList
            articles={page.articles}
            parentFullSlug={page.fullSlug}
          />
        )}
      </article>
    </div>
  );
};

function getHeroImage(page: StrapiPage, rootPage: StrapiPage) {
  let pageForHeroImage = page;
  if (!rootPageCategories.includes(page.category)) {
    pageForHeroImage = rootPage;
  }
  return pageForHeroImage.featuredImage?.image?.url
    ? pageForHeroImage.featuredImage.image.url.startsWith("/")
      ? new URL(
          pageForHeroImage.featuredImage.image.url,
          process.env.STRAPI_BASE_API_URL,
        ).toString()
      : pageForHeroImage.featuredImage.image.url
    : null;
}

async function fetchRootPage(page: StrapiPage): Promise<StrapiPage> {
  let rootPage = page;
  if (!rootPageCategories.includes(page.category)) {
    const rootPageUrl = page.fullSlug.slice(0, page.fullSlug.lastIndexOf("/"));
    const { data: rootPageData } = await fetchPageByFullSlug(rootPageUrl);
    rootPage = rootPageData?.pages[0];
  }

  return rootPage;
}
