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
      revalidate: isProduction() ? 10 : 0,
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
      depth: "2",
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
        "where[parent][exists]": "false",
        depth: "2",
        limit: DEFAULT_LIMIT,
      }),
      { next: { tags: ["root_pages"] } },
    );
    pages = normalizePages(response.docs || []);
  } catch {
    pages = await fetchAllPagesPayload();
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

async function fetchPageByFullSlugPayload(
  fullSlug: string,
): Promise<{ data: { pages: Page[] } }> {
  const response = await fetchJSON<PayloadDocsResponse<RawPayloadPage>>(
    buildPayloadUrl("/api/pages", {
      "where[fullSlug][equals]": fullSlug,
      depth: "2",
      limit: "1",
    }),
    { next: { tags: ["page_" + fullSlug] } },
  );
  const match = response.docs?.[0]
    ? normalizePage(response.docs[0])
    : undefined;

  if (match) {
    match.articles = await enrichArticleImages(match.articles);
  }

  return {
    data: {
      pages: match ? [match] : [],
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
    .map((p) => ({ path: p.fullSlug as string, lastModified: p.updatedAt || now }));

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
