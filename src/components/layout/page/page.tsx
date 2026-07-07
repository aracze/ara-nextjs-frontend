import { Page as PayloadPage, PageCategory } from "@/types/payload";
import { ArticlesList } from "@/components/features/articles-list";
import { ArticlesListClassic } from "@/components/features/articles-list-classic";
import { HeroSection } from "./hero-section";
import { Subnavigation } from "./subnavigation";
import { MainContent } from "./main-content";
import { PlacesToVisit } from "./places-to-visit";
import { fetchPageByFullSlug, fetchMediaUrlsByIds } from "@/lib/payload";
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
  const pageChildren = page.children?.docs ?? [];

  const imageUrl = getHeroImage(page, safeRootPage);
  const breadcrumbs = await getBreadcrumbs(page);

  // Determine which Place "owns" the menu for this page.
  // e.g. on Dubrovník's Počasí → menuContext = Dubrovník's children
  // e.g. on Chorvatsko's Počasí → menuContext = Chorvatsko's children
  const menuContext = await fetchMenuContext(page, safeRootPage);
  const practicalInfoSourceChildren = await fetchPracticalInfoSourceChildren(
    page,
    safeRootPage,
    menuContext.isSubPlace,
  );

  // "Místa"/"Články" v sekundárním menu patří kontextovému místu (např. Chorvatsko),
  // ne aktuální podstránce (např. Vstupní podmínky). Načteme proto data kontextové stránky.
  const contextPage =
    menuContext.contextFullSlug === page.fullSlug
      ? page
      : ((await fetchPageByFullSlug(menuContext.contextFullSlug)).data
          .pages[0] ?? page);
  const contextHasPlaces = (contextPage.children?.docs?.length ?? 0) > 0;
  const contextHasArticles = (contextPage.articles?.length ?? 0) > 0;

  const effectiveCurrencyCode =
    page.detail?.currencyCode || safeRootPage.detail?.currencyCode;
  const exchangeData = effectiveCurrencyCode
    ? await fetchExchangeRate(effectiveCurrencyCode)
    : null;

  // Resolve image URLs for child pages (for map markers & place cards)
  const childImageIds = pageChildren
    .map<number | null>((c) => {
      const imgField = c.featuredImage?.image;
      return typeof imgField === "number" ? imgField : null;
    })
    .filter((id): id is number => id !== null);
  const imageUrlMap = await fetchMediaUrlsByIds(childImageIds);
  // Build a map from child page ID → image URL
  const childImageUrlMap = new Map<number | string, string>();
  for (const child of pageChildren) {
    const imgField = child.featuredImage?.image;
    const imgId = typeof imgField === "number" ? imgField : null;
    if (imgId && imageUrlMap.has(imgId)) {
      childImageUrlMap.set(child.id, imageUrlMap.get(imgId)!);
    } else if (
      typeof imgField === "object" &&
      imgField !== null &&
      "url" in imgField &&
      imgField.url
    ) {
      childImageUrlMap.set(child.id, String(imgField.url));
    }
  }

  // Map center from page detail
  const mapCenter =
    page.detail?.latitude && page.detail?.longitude
      ? {
          lat: parseFloat(page.detail.latitude),
          lng: parseFloat(page.detail.longitude),
        }
      : null;
  const mapZoom = page.detail?.googleMapsZoom ?? 7;

  return (
    <div className="flex flex-col bg-white transition-all duration-500">
      <article key={page.id} className="w-full">
        {/* 1. HERO SECTION (initial-photo) */}
        <HeroSection
          title={buildPageTitle(page, safeRootPage)}
          imageUrl={imageUrl}
          styleCss={page.featuredImage?.featureImageStyleCss || undefined}
          filterId={`blurFilter-${page.id}`}
          breadcrumbs={breadcrumbs}
        />

        {/* Sub-navigation bar style — not shown on rubric or static content pages */}
        {page.category !== PageCategory.Rubrika &&
          page.category !== PageCategory.Staticka_stranka && (
            <Subnavigation
              contextTitle={menuContext.contextTitle}
              contextFullSlug={menuContext.contextFullSlug}
              pageChildren={menuContext.menuChildren}
              rootChildren={practicalInfoSourceChildren}
              currentPageFullSlug={page.fullSlug}
              currentPageCategory={page.category}
              isSubPlace={menuContext.isSubPlace}
              hasPlaces={contextHasPlaces}
              hasArticles={contextHasArticles}
            />
          )}

        {/* 2. CONTENT AREA */}
        <MainContent
          text={page.text}
          pageChildren={pageChildren}
          pageCategory={page.category}
          timezone={page.detail?.timezone || safeRootPage?.detail?.timezone}
          currencyCode={effectiveCurrencyCode}
          exchangeRate={exchangeData?.rate}
          pageTitle={page.title}
          genitive={page.detail?.genitive}
          createdBy={page.createdBy}
          createdByPublic={page.createdByPublic}
        />

        {/* 3. PLACES TO VISIT SECTION */}
        {pageChildren.length > 0 && (
          <PlacesToVisit
            pageChildren={pageChildren}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            imageUrlMap={childImageUrlMap}
            parentLocative={page.detail?.locative ?? null}
          />
        )}

        {/* Rubriky používají mřížkový layout, ostatní stránky (místa k navštívení)
            klasický vertikální seznam s reklamním sloupcem. */}
        {page.articles?.length > 0 &&
          (page.category === PageCategory.Rubrika ? (
            <ArticlesList
              articles={page.articles}
              parentFullSlug={page.fullSlug}
            />
          ) : (
            <ArticlesListClassic
              articles={page.articles}
              parentFullSlug={page.fullSlug}
              destinationLocative={page.detail?.locative}
            />
          ))}
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

/**
 * Shared helper to fetch all ancestor pages for a given slug.
 * If an intermediate parent is missing in the CMS, it returns a placeholder.
 */
async function fetchAncestorChain(
  fullSlug: string,
): Promise<
  (
    | PayloadPage
    | { title: string; fullSlug: string; category?: never; isPlaceholder: true }
  )[]
> {
  const normalizedSlug = fullSlug.replace(/^\/+|\/+$/g, "");
  if (!normalizedSlug) return [];

  const parts = normalizedSlug.split("/");
  const chain: (
    | PayloadPage
    | { title: string; fullSlug: string; category?: never; isPlaceholder: true }
  )[] = [];

  // We walk through all segments except the last one (which is the page itself)
  for (let i = 1; i < parts.length; i++) {
    const parentSlug = parts.slice(0, i).join("/");
    const { data } = await fetchPageByFullSlug(parentSlug);
    const parentPage = data?.pages?.[0];

    if (parentPage) {
      chain.push(parentPage);
    } else {
      const segment = parts[i - 1];
      const title =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      chain.push({
        title,
        fullSlug: `/${parentSlug}`,
        isPlaceholder: true,
      });
      console.warn(`[Page] Missing parent page in CMS for slug: ${parentSlug}`);
    }
  }

  return chain;
}

async function fetchRootPage(page: PayloadPage): Promise<PayloadPage> {
  if (rootPageCategories.includes(page.category)) {
    return page;
  }

  const ancestors = await fetchAncestorChain(page.fullSlug);
  // Find the first valid root page in the chain
  for (const ancestor of ancestors) {
    if (
      !("isPlaceholder" in ancestor) &&
      rootPageCategories.includes(ancestor.category)
    ) {
      return ancestor;
    }
  }

  return page;
}

async function fetchMenuContext(
  page: PayloadPage,
  rootPage: PayloadPage,
): Promise<{
  contextTitle: string;
  contextFullSlug: string;
  menuChildren: PayloadPage["children"]["docs"];
  isSubPlace: boolean;
}> {
  if (menuOwnerCategories.includes(page.category)) {
    const ancestors = await fetchAncestorChain(page.fullSlug);
    const hasParentMenuOwner = ancestors.some(
      (ancestor) =>
        !("isPlaceholder" in ancestor) &&
        menuOwnerCategories.includes(ancestor.category),
    );

    return {
      contextTitle: page.title,
      contextFullSlug: page.fullSlug,
      menuChildren: page.children?.docs ?? [],
      isSubPlace: hasParentMenuOwner,
    };
  }

  const ancestors = await fetchAncestorChain(page.fullSlug);
  // Walk backwards through resolved ancestors to find the nearest Place
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (
      !("isPlaceholder" in ancestor) &&
      menuOwnerCategories.includes(ancestor.category)
    ) {
      const isRoot = ancestor.fullSlug === rootPage.fullSlug;
      return {
        contextTitle: ancestor.title,
        contextFullSlug: ancestor.fullSlug,
        menuChildren: ancestor.children?.docs ?? [],
        isSubPlace: !isRoot,
      };
    }
  }

  return {
    contextTitle: rootPage.title,
    contextFullSlug: rootPage.fullSlug,
    menuChildren: rootPage.children?.docs ?? [],
    isSubPlace: false,
  };
}

async function fetchPracticalInfoSourceChildren(
  page: PayloadPage,
  rootPage: PayloadPage,
  isSubPlace: boolean,
): Promise<PayloadPage["children"]["docs"]> {
  const rootChildren = rootPage.children?.docs ?? [];

  if (!isSubPlace) {
    return rootChildren;
  }

  const ancestors = await fetchAncestorChain(page.fullSlug);

  // Prefer the nearest ancestor that has a Praktické informace child.
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if ("isPlaceholder" in ancestor) continue;

    const children = ancestor.children?.docs ?? [];
    const hasPracticalInfo = children.some(
      (child) => child.category === PageCategory.Prakticke_informace,
    );

    if (hasPracticalInfo) {
      return children;
    }
  }

  return rootChildren;
}

async function getBreadcrumbs(
  page: PayloadPage,
): Promise<{ title: string; href: string }[]> {
  const ancestors = await fetchAncestorChain(page.fullSlug);
  return ancestors.map((a) => ({
    title: a.title,
    href: a.fullSlug,
  }));
}
