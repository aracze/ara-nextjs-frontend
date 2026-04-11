import { Page as PayloadPage } from '@/types/payload';
import { ArticlesList } from '@/components/features/articles-list';
import { HeroSection } from './hero-section';
import { Subnavigation } from './subnavigation';
import { MainContent } from './main-content';
import { PlacesToVisit } from './places-to-visit';
import { fetchPageByFullSlug } from '@/lib/payload';
import { PageCategory } from '@/types/payload';

const rootPageCategories: PageCategory[] = [
  PageCategory.Mista,
  PageCategory.Turisticky_cil,
  PageCategory.Misto_k_navstiveni,
];

export const Page = async ({ page }: { page: PayloadPage }) => {
  const rootPage = await fetchRootPage(page);

  const imageUrl = getHeroImage(page, rootPage);

  return (
    <div className="flex flex-col bg-white overflow-x-hidden transition-all duration-500">
      <article key={page.id} className="w-full">
        {/* 1. HERO SECTION (initial-photo) */}
        <HeroSection
          title={page.title}
          imageUrl={imageUrl}
          styleCss={page.featuredImage?.featureImageStyleCss || undefined}
          filterId={`blurFilter-${page.id}`}
        />

        {/* Sub-navigation bar style */}
        <Subnavigation
          title={rootPage.title}
          pageChildren={rootPage.children.docs}
          currentPageDocumentId={String(page.id)}
        />

        {/* 2. CONTENT AREA */}
        <MainContent text={page.text} pageChildren={page.children.docs} />

        {/* 3. PLACES TO VISIT SECTION */}
        {page.children.docs?.length > 0 && (
          <PlacesToVisit pageChildren={page.children.docs} />
        )}

        {page.articles?.length > 0 && (
          <ArticlesList
            articles={page.articles}
            parentFullSlug={page.fullSlug}
          />
        )}
      </article>
    </div>
  );
};

function getHeroImage(page: PayloadPage, rootPage: PayloadPage) {
  console.log('page', page);
  console.log('rootPage', rootPage);
  let pageForHeroImage = page;
  if (!rootPageCategories.includes(page.category)) {
    pageForHeroImage = rootPage;
  }
  return pageForHeroImage.featuredImage?.image?.url
    ? pageForHeroImage.featuredImage.image.url.startsWith('/')
      ? new URL(
          pageForHeroImage.featuredImage.image.url,
          process.env.PAYLOAD_BASE_API_URL,
        ).toString()
      : pageForHeroImage.featuredImage.image.url
    : null;
}

async function fetchRootPage(page: PayloadPage): Promise<PayloadPage> {
  let rootPage = page;
  if (!rootPageCategories.includes(page.category)) {
    const rootPageUrl = page.fullSlug.slice(0, page.fullSlug.lastIndexOf('/'));
    const { data: rootPageData } = await fetchPageByFullSlug(rootPageUrl);
    rootPage = rootPageData?.pages[0];
  }

  return rootPage;
}
