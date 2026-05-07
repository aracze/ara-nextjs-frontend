import { Page as PayloadPage, PageCategory } from "@/types/payload";
import { ArticlesList } from "@/components/features/articles-list";
import { HeroSection } from "./hero-section";
import { Subnavigation } from "./subnavigation";
import { MainContent } from "./main-content";
import { PlacesToVisit } from "./places-to-visit";
import { fetchPageByFullSlug } from "@/lib/payload";
import { fetchExchangeRate } from "@/lib/exchange-rate";
import { buildPageTitle, rootPageCategories } from "@/lib/page-title";

// Categories that can "own" a sub-navigation menu.
// Turistický cíl is excluded – it should always delegate to its parent Place.
const menuOwnerCategories: PageCategory[] = [
  PageCategory.Mista,
  PageCategory.Misto_k_navstiveni,
];

export const Page = async ({ page }: { page: PayloadPage }) => {
  const rootPage = await fetchRootPage(page);
  const safeRootPage = rootPage ?? page;
  const rootChildren = safeRootPage.children?.docs ?? [];
  const pageChildren = page.children?.docs ?? [];

  const imageUrl = getHeroImage(page, safeRootPage);
  const breadcrumbs = await getBreadcrumbs(page);

  // Determine which Place "owns" the menu for this page.
  // e.g. on Dubrovník's Počasí → menuContext = Dubrovník's children
  // e.g. on Chorvatsko's Počasí → menuContext = Chorvatsko's children
  const menuContext = await fetchMenuContext(page, safeRootPage);

  const effectiveCurrencyCode =
    page.detail?.currencyCode || safeRootPage.detail?.currencyCode;
  const exchangeData = effectiveCurrencyCode
    ? await fetchExchangeRate(effectiveCurrencyCode)
    : null;

  return (
    <div className="flex flex-col bg-white overflow-x-hidden transition-all duration-500">
      <article key={page.id} className="w-full">
        {/* 1. HERO SECTION (initial-photo) */}
        <HeroSection
          title={buildPageTitle(page, safeRootPage)}
          imageUrl={imageUrl}
          styleCss={page.featuredImage?.featureImageStyleCss || undefined}
          filterId={`blurFilter-${page.id}`}
          breadcrumbs={breadcrumbs}
        />

        {/* Sub-navigation bar style */}
        <Subnavigation
          contextTitle={menuContext.contextTitle}
          contextFullSlug={menuContext.contextFullSlug}
          pageChildren={menuContext.menuChildren}
          rootChildren={rootChildren}
          currentPageFullSlug={page.fullSlug}
          currentPageCategory={page.category}
          isSubPlace={menuContext.isSubPlace}
        />

        {/* 2. CONTENT AREA */}
        <MainContent
          text={page.text}
          pageChildren={pageChildren}
          pageCategory={page.category}
          timezone={page.detail?.timezone || safeRootPage?.detail?.timezone}
          currencyCode={effectiveCurrencyCode}
          exchangeRate={exchangeData?.rate}
        />

        {/* 3. PLACES TO VISIT SECTION */}
        {pageChildren.length > 0 && (
          <PlacesToVisit pageChildren={pageChildren} />
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
  let pageForHeroImage = page;
  if (!rootPageCategories.includes(page.category)) {
    pageForHeroImage = rootPage;
  }
  return pageForHeroImage.featuredImage?.image?.url
    ? pageForHeroImage.featuredImage.image.url.startsWith("/")
      ? new URL(
          pageForHeroImage.featuredImage.image.url,
          process.env.PAYLOAD_BASE_API_URL,
        ).toString()
      : pageForHeroImage.featuredImage.image.url
    : null;
}

async function fetchRootPage(page: PayloadPage): Promise<PayloadPage> {
  const normalizedSlug = page.fullSlug.replace(/^\/+|\/+$/g, "");
  const parts = normalizedSlug.split("/");

  // We want to find the highest level page in the hierarchy that belongs to rootPageCategories
  // This ensures that for /evropa/chorvatsko/dubrovnik, we find "Chorvatsko" as the root.
  for (let i = 1; i < parts.length; i++) {
    const parentSlug = parts.slice(0, i).join("/");
    const { data } = await fetchPageByFullSlug(parentSlug);
    const parentPage = data?.pages?.[0];

    if (parentPage && rootPageCategories.includes(parentPage.category)) {
      return parentPage;
    }
  }

  return page;
}

/**
 * Find the nearest ancestor Place (or self) that "owns" the menu.
 * Returns its children for the sub-navigation and whether it's a sub-place (not the root).
 *
 * Examples:
 *   /chorvatsko          → context=Chorvatsko, isSubPlace=false
 *   /chorvatsko/pocasi   → context=Chorvatsko, isSubPlace=false
 *   /chorvatsko/dubrovnik → context=Dubrovník, isSubPlace=true
 *   /chorvatsko/dubrovnik/pocasi → context=Dubrovník, isSubPlace=true
 */
async function fetchMenuContext(
  page: PayloadPage,
  rootPage: PayloadPage,
): Promise<{
  contextTitle: string;
  contextFullSlug: string;
  menuChildren: PayloadPage["children"]["docs"];
  isSubPlace: boolean;
}> {
  // If the current page IS a menu-owning Place (Místa, Místo k navštívení), it owns its own menu.
  // Turistický cíl is excluded – it delegates to its parent Place.
  if (menuOwnerCategories.includes(page.category)) {
    const isRoot = page.fullSlug === rootPage.fullSlug;
    return {
      contextTitle: page.title,
      contextFullSlug: page.fullSlug,
      menuChildren: page.children?.docs ?? [],
      isSubPlace: !isRoot,
    };
  }

  // Otherwise, walk up the hierarchy from deepest to shallowest
  // to find the nearest Place ancestor.
  const normalizedSlug = page.fullSlug.replace(/^\/+|\/+$/g, "");
  const parts = normalizedSlug.split("/");

  for (let i = parts.length - 1; i >= 1; i--) {
    const parentSlug = parts.slice(0, i).join("/");
    const { data } = await fetchPageByFullSlug(parentSlug);
    const parentPage = data?.pages?.[0];

    if (parentPage && menuOwnerCategories.includes(parentPage.category)) {
      const isRoot = parentPage.fullSlug === rootPage.fullSlug;
      return {
        contextTitle: parentPage.title,
        contextFullSlug: parentPage.fullSlug,
        menuChildren: parentPage.children?.docs ?? [],
        isSubPlace: !isRoot,
      };
    }
  }

  // Fallback: use root
  return {
    contextTitle: rootPage.title,
    contextFullSlug: rootPage.fullSlug,
    menuChildren: rootPage.children?.docs ?? [],
    isSubPlace: false,
  };
}

async function getBreadcrumbs(
  page: PayloadPage,
): Promise<{ title: string; href: string }[]> {
  const breadcrumbs: { title: string; href: string }[] = [];
  const normalizedSlug = page.fullSlug.replace(/^\/+|\/+$/g, "");
  const parts = normalizedSlug.split("/");

  // We want to fetch all parents, so we iterate through parts except the last one (current page)
  for (let i = 1; i < parts.length; i++) {
    const parentSlug = parts.slice(0, i).join("/");
    const { data } = await fetchPageByFullSlug(parentSlug);
    const parentPage = data?.pages?.[0];

    if (parentPage) {
      breadcrumbs.push({
        title: parentPage.title,
        href: parentPage.fullSlug,
      });
    }
  }

  return breadcrumbs;
}
