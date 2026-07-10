import {
  Page,
  PageChild,
  PagesResponse,
  Article,
  GlobalHeader,
  Homepage,
  GlobalFooter,
} from "@/types/payload";
import { getPayloadURL, isProduction } from "./utils";
import { cache } from "react";

const DEFAULT_LIMIT = "200";

// Pole potřebná pro hlavní menu (header): jen názvy/odkazy stránek a jejich
// dětí. Bez `select`/`populate` Payload při depth táhne i články, služby a média
// (~3 MB místo ~8 KB) — to bylo hlavní zdržení na KAŽDÉ stránce. `select`
// omezí pole stránky, `populate[pages]` omezí pole napojených dětí (subPages).
const MENU_QUERY_PARAMS: Record<string, string> = {
  depth: "1",
  "select[title]": "true",
  "select[slug]": "true",
  "select[fullSlug]": "true",
  "select[category]": "true",
  "select[subPages]": "true",
  "populate[pages][title]": "true",
  "populate[pages][slug]": "true",
  "populate[pages][fullSlug]": "true",
  "populate[pages][category]": "true",
};

// Pole pro předky (breadcrumbs, menu kontext, kořenová stránka): jako menu,
// ale navíc `detail` a `featuredImage` — podstránky z kořenového předka berou
// hero obrázek a fallback měny/časové zóny. (Obojí jsou malá pole; těžké části
// — texty, články — zůstávají vynechané.)
const ANCESTOR_QUERY_PARAMS: Record<string, string> = {
  ...MENU_QUERY_PARAMS,
  "select[detail]": "true",
  "select[featuredImage]": "true",
};

// Detail stránky se skládá ze 3 PARALELNÍCH dotazů (stránka ∥ děti ∥ články)
// místo jednoho těžkého depth=2 s joiny — joiny běží v Payloadu sériově a
// tahaly i nepoužívaný balast (SEO meta, breadcrumbs, vnořené joiny, plné
// profily uživatelů). Měřeno na /nemecko: 287 KB/1,7 s → 3 dotazy paralelně,
// nejpomalejší ~0,7 s. Každý dotaz stahuje jen pole, která web kreslí.

// 1) Vlastní pole stránky (texty, detail, hero, autor).
const PAGE_SCALAR_QUERY_PARAMS: Record<string, string> = {
  depth: "1",
  limit: "1",
  "select[title]": "true",
  "select[slug]": "true",
  "select[fullSlug]": "true",
  "select[category]": "true",
  "select[text]": "true",
  "select[detail]": "true",
  "select[featuredImage]": "true",
  "select[createdBy]": "true",
  "select[createdByPublic]": "true",
  "populate[users][username]": "true",
  "populate[users][firstName]": "true",
  "populate[users][lastName]": "true",
  "populate[media][url]": "true",
  "populate[media][alternativeText]": "true",
};

// 2) Děti stránky (karty míst, mapa, menu) — texty jsou potřeba pro náhledy
// karet a rozbalovací turistické cíle. Řazení odpovídá subPages joinu (ověřeno).
const PAGE_CHILDREN_QUERY_PARAMS: Record<string, string> = {
  depth: "1",
  limit: "100",
  "select[title]": "true",
  "select[slug]": "true",
  "select[fullSlug]": "true",
  "select[category]": "true",
  "select[text]": "true",
  "select[detail]": "true",
  "select[featuredImage]": "true",
  "populate[media][url]": "true",
  "populate[media][alternativeText]": "true",
};

// 3) Články stránky (primární přes mainPage + sekundární přes pages) jedním
// OR dotazem; roztřídí se lokálně podle mainPage. Texty = výňatky karet.
const PAGE_ARTICLES_QUERY_PARAMS: Record<string, string> = {
  depth: "0",
  limit: "100",
  "select[title]": "true",
  "select[slug]": "true",
  "select[documentId]": "true",
  "select[text]": "true",
  "select[featuredImage]": "true",
  "select[mainPage]": "true",
};

type PayloadDocsResponse<T> = {
  docs: T[];
  totalDocs?: number;
};

type RawPayloadPage = Omit<Page, "children" | "articles"> & {
  children?: {
    docs: PageChild[];
  };
  subPages?: {
    docs: PageChild[];
  };
  articles?: Article[];
  primaryArticles?: {
    docs: Article[];
  };
  secondaryArticles?: {
    docs: Article[];
  };
};

function normalizePage(page: RawPayloadPage): Page {
  const normalizedChildren = page.children?.docs ?? page.subPages?.docs ?? [];

  const primary = page.articles ?? page.primaryArticles?.docs ?? [];
  const secondary = page.secondaryArticles?.docs ?? [];
  // Merge primary + secondary, deduplicate by documentId/slug
  const seen = new Set<string>();
  const normalizedArticles: Article[] = [];
  for (const a of [...primary, ...secondary]) {
    const key = a.documentId || a.slug;
    if (!seen.has(key)) {
      seen.add(key);
      normalizedArticles.push(a);
    }
  }

  return {
    ...page,
    children: {
      docs: normalizedChildren,
    },
    articles: normalizedArticles,
  };
}

function normalizePages(pages: RawPayloadPage[]): Page[] {
  return pages.map(normalizePage);
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    next: {
      // Stránky se vykreslují dynamicky (streaming) — rychlost obsahu stojí na
      // této datové cache: 5 min + tagy (webhook /api/cache umí invalidovat
      // okamžitě při publikaci). Ve vývoji se necachuje vůbec.
      revalidate: isProduction() ? 300 : 0,
      ...init?.next,
      ...(isProduction() ? {} : { revalidate: 0 }),
    },
    cache: isProduction() ? init?.cache : "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${body}`);
  }
  return (await res.json()) as T;
}

function buildPayloadUrl(path: string, params?: Record<string, string>) {
  const base = getPayloadURL();
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function fetchAllPagesPayload(): Promise<Page[]> {
  const response = await fetchJSON<PayloadDocsResponse<RawPayloadPage>>(
    buildPayloadUrl("/api/pages", {
      ...MENU_QUERY_PARAMS,
      limit: DEFAULT_LIMIT,
    }),
    { next: { tags: ["pages"] } },
  );
  return normalizePages(response.docs || []);
}

async function fetchRootPagesPayload(): Promise<PagesResponse> {
  let pages: Page[] = [];
  try {
    const response = await fetchJSON<PayloadDocsResponse<RawPayloadPage>>(
      buildPayloadUrl("/api/pages", {
        ...MENU_QUERY_PARAMS,
        "where[parent][exists]": "false",
        limit: DEFAULT_LIMIT,
      }),
      { next: { tags: ["root_pages"] } },
    );
    pages = normalizePages(response.docs || []);
  } catch {
    try {
      pages = await fetchAllPagesPayload();
    } catch {
      // CMS je nedostupné (typicky při buildu obrazu v GitHub Actions, kde
      // žádné CMS neběží). Nespadneme — vrátíme prázdný seznam. Za běhu, kdy
      // už CMS běží, se data doplní (ISR / dynamické vykreslení).
      pages = [];
    }
  }

  const [header, homepage] = await Promise.all([
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl("/api/globals/header"),
      { next: { tags: ["root_pages"] } },
    ).catch(() => null),
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl("/api/globals/homepage"),
      { next: { tags: ["root_pages"] } },
    ).catch(() => null),
  ]);

  return {
    data: {
      pages,
      global: header
        ? {
            header: ((header as any).header || header) as GlobalHeader,
          }
        : null,
      homepage: homepage
        ? (((homepage as any).homepage || homepage) as Homepage)
        : null,
    },
  };
}

/**
 * Article cards come from a page's `primaryArticles`/`secondaryArticles` join, where
 * Payload returns `featuredImage.image` only as a numeric id (join fields don't deep-populate
 * uploads, regardless of depth). Resolve those ids to URLs so listing cards show thumbnails.
 */
async function enrichArticleImages(articles: Article[]): Promise<Article[]> {
  if (!articles?.length) return articles ?? [];

  const ids = articles
    .map((a) => a.featuredImage?.image)
    .filter((img): img is number => typeof img === "number");

  if (ids.length === 0) return articles;

  const urlMap = await fetchMediaUrlsByIds([...new Set(ids)]);

  return articles.map((a) => {
    const img = a.featuredImage?.image;
    if (a.featuredImage && typeof img === "number" && urlMap.has(img)) {
      return {
        ...a,
        featuredImage: {
          ...a.featuredImage,
          image: { url: urlMap.get(img)!, alternativeText: null },
        },
      };
    }
    return a;
  });
}

/** Id z relace, která může být číslo nebo populovaný objekt. */
function relationId(value: unknown): number | string | null {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return (value as { id: number | string }).id;
  }
  return null;
}

async function fetchPageByFullSlugPayload(
  fullSlug: string,
): Promise<{ data: { pages: Page[] } }> {
  const tags = { next: { tags: ["page_" + fullSlug] } };

  // Tři nezávislé dotazy paralelně (viz komentář u *_QUERY_PARAMS výše).
  const [pageRes, childrenRes, articlesRes] = await Promise.all([
    fetchJSON<PayloadDocsResponse<RawPayloadPage>>(
      buildPayloadUrl("/api/pages", {
        ...PAGE_SCALAR_QUERY_PARAMS,
        "where[fullSlug][equals]": fullSlug,
      }),
      tags,
    ),
    fetchJSON<PayloadDocsResponse<PageChild>>(
      buildPayloadUrl("/api/pages", {
        ...PAGE_CHILDREN_QUERY_PARAMS,
        "where[parent.fullSlug][equals]": fullSlug,
      }),
      tags,
    ).catch(() => ({ docs: [] as PageChild[] })),
    fetchJSON<PayloadDocsResponse<Article>>(
      buildPayloadUrl("/api/articles", {
        ...PAGE_ARTICLES_QUERY_PARAMS,
        "where[or][0][mainPage.fullSlug][equals]": fullSlug,
        "where[or][1][pages.fullSlug][equals]": fullSlug,
      }),
      tags,
    ).catch(() => ({ docs: [] as Article[] })),
  ]);

  const raw = pageRes.docs?.[0];
  if (!raw) {
    return { data: { pages: [] } };
  }

  // Roztřídění článků: primární (mainPage = tato stránka) první — stejné
  // pořadí jako dřívější primaryArticles/secondaryArticles joiny.
  const allArticles = articlesRes.docs || [];
  const primary = allArticles.filter(
    (a) => relationId((a as { mainPage?: unknown }).mainPage) === raw.id,
  );
  const secondary = allArticles.filter(
    (a) => relationId((a as { mainPage?: unknown }).mainPage) !== raw.id,
  );

  const match = normalizePage({
    ...raw,
    subPages: { docs: childrenRes.docs || [] },
    primaryArticles: { docs: primary },
    secondaryArticles: { docs: secondary },
  });

  match.articles = await enrichArticleImages(match.articles);

  return {
    data: {
      pages: [match],
    },
  };
}

async function fetchArticleBySlugPayload(
  slug: string,
  _parentSlug?: string,
): Promise<{ data: { articles: Article[] } }> {
  const response = await fetchJSON<PayloadDocsResponse<Article>>(
    buildPayloadUrl("/api/articles", {
      "where[slug][equals]": slug,
      depth: "2",
      limit: "1",
    }),
    { next: { tags: ["article_" + slug] } },
  );

  return {
    data: {
      articles: response.docs || [],
    },
  };
}
const ensureCorrectFullSlug = (fullSlug: string) => {
  return fullSlug.startsWith("/") ? fullSlug : `/${fullSlug}`;
};

export const fetchArticleBySlug = cache(fetchArticleBySlugPayload);

export const fetchPageByFullSlug = cache(async (slug: string) => {
  const correctFullSlug = ensureCorrectFullSlug(slug);
  return fetchPageByFullSlugPayload(correctFullSlug);
});

/**
 * Lehká varianta fetchPageByFullSlug — vrátí jen pole potřebná pro menu a
 * drobečky (title, slug, fullSlug, category + děti). Používá se pro předky
 * v řetězci (breadcrumbs, menu kontext), kde plný detail stránky (~144 KB)
 * není potřeba — tím odpadají opakované těžké dotazy při generování stránky.
 */
async function fetchPageLightByFullSlugPayload(
  fullSlug: string,
): Promise<{ data: { pages: Page[] } }> {
  const response = await fetchJSON<PayloadDocsResponse<RawPayloadPage>>(
    buildPayloadUrl("/api/pages", {
      ...ANCESTOR_QUERY_PARAMS,
      "where[fullSlug][equals]": fullSlug,
      limit: "1",
    }),
    { next: { tags: ["page_" + fullSlug] } },
  );
  const match = response.docs?.[0]
    ? normalizePage(response.docs[0])
    : undefined;
  return { data: { pages: match ? [match] : [] } };
}

export const fetchPageLightByFullSlug = cache(async (slug: string) => {
  return fetchPageLightByFullSlugPayload(ensureCorrectFullSlug(slug));
});

/**
 * Levné zjištění, zda má stránka nějaké články (bez stahování jejich obsahu) —
 * `limit=1` + `depth=0`, čte se jen `totalDocs`. Používá se pro rozhodnutí, zda
 * v podnavigaci zobrazit záložku „Články", aniž bychom tahali celý kontext.
 */
export const pageHasArticles = cache(
  async (pageId: number | string): Promise<boolean> => {
    try {
      const res = await fetchJSON<{ totalDocs?: number }>(
        buildPayloadUrl("/api/articles", {
          "where[mainPage][equals]": String(pageId),
          limit: "1",
          depth: "0",
        }),
        { next: { tags: ["page_" + pageId + "_articles"] } },
      );
      return (res.totalDocs ?? 0) > 0;
    } catch {
      return false;
    }
  },
);

export const fetchRootPages = cache(fetchRootPagesPayload);

async function fetchFooterPayload(): Promise<GlobalFooter | null> {
  try {
    const data = await fetchJSON<Record<string, unknown>>(
      buildPayloadUrl("/api/globals/footer"),
      { next: { tags: ["footer"] } },
    );
    return {
      logo: (data.logo as GlobalFooter["logo"]) ?? null,
      navItems: (data.navItems as GlobalFooter["navItems"]) ?? [],
      copyrightText:
        (data.copyrightText as GlobalFooter["copyrightText"]) ?? null,
    };
  } catch {
    return null;
  }
}

export const fetchFooter = cache(fetchFooterPayload);

/**
 * Batch-fetch media URLs by IDs for map markers.
 * Returns a Map of mediaId → URL string.
 */
export async function fetchMediaUrlsByIds(
  ids: number[],
): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  const response = await fetchJSON<
    PayloadDocsResponse<{ id: number; url: string }>
  >(
    buildPayloadUrl("/api/media", {
      "where[id][in]": ids.join(","),
      limit: String(ids.length),
      depth: "0",
    }),
  );
  const map = new Map<number, string>();
  for (const doc of response.docs || []) {
    if (doc.url) map.set(doc.id, doc.url);
  }
  return map;
}

/**
 * All indexable page & article paths for the sitemap. Pages use `fullSlug`
 * (už zohledňuje "include in child URL paths"), články `mainPage.fullSlug + slug`.
 */
export async function fetchSitemapEntries(): Promise<{
  pages: { path: string; lastModified: string }[];
  articles: { path: string; lastModified: string }[];
}> {
  type SitemapPage = { fullSlug?: string | null; updatedAt?: string | null };
  type SitemapArticle = {
    slug?: string | null;
    updatedAt?: string | null;
    mainPage?: { fullSlug?: string | null } | number | null;
  };

  const [pagesRes, articlesRes] = await Promise.all([
    fetchJSON<PayloadDocsResponse<SitemapPage>>(
      buildPayloadUrl("/api/pages", {
        depth: "0",
        limit: "0",
        pagination: "false",
      }),
      { next: { tags: ["sitemap"] } },
    ).catch((err) => {
      console.error("[sitemap] /api/pages fetch failed:", err);
      return { docs: [] as SitemapPage[] };
    }),
    fetchJSON<PayloadDocsResponse<SitemapArticle>>(
      buildPayloadUrl("/api/articles", {
        depth: "1",
        limit: "0",
        pagination: "false",
      }),
      { next: { tags: ["sitemap"] } },
    ).catch((err) => {
      console.error("[sitemap] /api/articles fetch failed:", err);
      return { docs: [] as SitemapArticle[] };
    }),
  ]);

  const now = new Date().toISOString();

  const pages = (pagesRes.docs || [])
    .filter((p) => typeof p.fullSlug === "string" && p.fullSlug)
    .map((p) => ({
      path: p.fullSlug as string,
      lastModified: p.updatedAt || now,
    }));

  const articles = (articlesRes.docs || [])
    .map((a) => {
      const mp = a.mainPage;
      const parent =
        mp && typeof mp === "object" && typeof mp.fullSlug === "string"
          ? mp.fullSlug
          : null;
      if (!parent || !a.slug) return null;
      return {
        path: `${parent.replace(/\/$/, "")}/${a.slug}`,
        lastModified: a.updatedAt || now,
      };
    })
    .filter((x): x is { path: string; lastModified: string } => x !== null);

  return { pages, articles };
}
