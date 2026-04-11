import {
  Page,
  PagesResponse,
  Article,
  GlobalHeader,
  Homepage,
} from '@/types/payload';
import { getPayloadURL } from './utils';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getCache, setCache } from './redis';

const DEFAULT_LIMIT = '200';

type PayloadDocsResponse<T> = {
  docs: T[];
  totalDocs?: number;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
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
  const response = await fetchJSON<PayloadDocsResponse<Page>>(
    buildPayloadUrl('/api/pages', {
      depth: '2',
      limit: DEFAULT_LIMIT,
    }),
  );
  return response.docs || [];
}

async function fetchRootPagesPayload(): Promise<PagesResponse> {
  let pages: Page[] = [];
  try {
    const response = await fetchJSON<PayloadDocsResponse<Page>>(
      buildPayloadUrl('/api/pages', {
        'where[parent][exists]': 'false',
        depth: '2',
        limit: DEFAULT_LIMIT,
      }),
    );
    pages = response.docs || [];
  } catch {
    pages = await fetchAllPagesPayload();
  }

  const [header, homepage] = await Promise.all([
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl('/api/globals/header'),
    ).catch(() => null),
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl('/api/globals/homepage'),
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

async function fetchPageByFullSlugPayload(
  fullSlug: string,
): Promise<{ data: { pages: Page[] } }> {
  console.log('fullSlugxxxx', fullSlug);
  const response = await fetchJSON<PayloadDocsResponse<Page>>(
    buildPayloadUrl('/api/pages', {
      'where[fullSlug][equals]': fullSlug,
      depth: '2',
      limit: '1',
    }),
  );
  const match = response.docs?.[0];

  return {
    data: {
      pages: match ? [match] : [],
    },
  };
}

async function fetchArticleBySlugPayload(
  _slug: string,
  _parentSlug?: string,
): Promise<{ data: { articles: Article[] } }> {
  return {
    data: {
      articles: [],
    },
  };
}

const fetchRootPagesCache = cache(
  unstable_cache(
    async (): Promise<PagesResponse> => {
      const pageJson = await getCache('root_pages');
      if (pageJson) {
        console.log('Cache hit for root_pages');
        return JSON.parse(pageJson);
      }

      const data = await fetchRootPagesPayload();

      console.log('dataxxx', data);
      await setCache('root_pages', JSON.stringify(data));
      return data;
    },
    ['root_pages'],
    { revalidate: 10, tags: ['root_pages'] },
  ),
);

const ensureCorrectFullSlug = (fullSlug: string) => {
  return fullSlug.startsWith('/') ? fullSlug : `/${fullSlug}`;
};

const fetchPageByFullSlugCache = cache((fullSlug: string) => {
  const correctFullSlug = ensureCorrectFullSlug(fullSlug);
  return unstable_cache(
    async (): Promise<{ data: { pages: Page[] } }> => {
      const pageJson = await getCache('page_' + correctFullSlug);
      if (pageJson) {
        return JSON.parse(pageJson);
      }

      const result = await fetchPageByFullSlugPayload(correctFullSlug);

      await setCache('page_' + correctFullSlug, JSON.stringify(result));

      return result;
    },
    ['page_' + correctFullSlug],
    { revalidate: 10, tags: ['page_' + correctFullSlug] },
  );
});

const fetchArticleBySlugCache = cache((slug: string, parentSlug?: string) =>
  unstable_cache(
    async (): Promise<{
      data: {
        articles: Article[];
      };
    }> => {
      return fetchArticleBySlugPayload(slug, parentSlug);
    },
    ['article_' + slug + '_' + (parentSlug || 'any')],
    { revalidate: 10, tags: ['article_' + slug] },
  ),
);

export const fetchArticleBySlug = (slug: string, parentSlug?: string) =>
  fetchArticleBySlugCache(slug, parentSlug)();

export const fetchPageByFullSlug = (slug: string) =>
  fetchPageByFullSlugCache(slug)();

export const fetchRootPages = () => fetchRootPagesCache();
