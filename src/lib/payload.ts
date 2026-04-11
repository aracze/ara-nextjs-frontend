import {
  Page,
  PagesResponse,
  Article,
  GlobalHeader,
  Homepage,
} from '@/types/payload';
import { getPayloadURL, isProduction } from './utils';
import { cache } from 'react';

const DEFAULT_LIMIT = '200';

type PayloadDocsResponse<T> = {
  docs: T[];
  totalDocs?: number;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    next: {
      revalidate: isProduction() ? 10 : 0,
      ...init?.next,
      ...(isProduction() ? {} : { revalidate: 0 }),
    },
    cache: isProduction() ? init?.cache : 'no-store',
  });
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
    { next: { tags: ['pages'] } },
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
      { next: { tags: ['root_pages'] } },
    );
    pages = response.docs || [];
  } catch {
    pages = await fetchAllPagesPayload();
  }

  const [header, homepage] = await Promise.all([
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl('/api/globals/header'),
      { next: { tags: ['root_pages'] } },
    ).catch(() => null),
    fetchJSON<Record<string, unknown> | null>(
      buildPayloadUrl('/api/globals/homepage'),
      { next: { tags: ['root_pages'] } },
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
  const response = await fetchJSON<PayloadDocsResponse<Page>>(
    buildPayloadUrl('/api/pages', {
      'where[fullSlug][equals]': fullSlug,
      depth: '2',
      limit: '1',
    }),
    { next: { tags: ['page_' + fullSlug] } },
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
const ensureCorrectFullSlug = (fullSlug: string) => {
  return fullSlug.startsWith('/') ? fullSlug : `/${fullSlug}`;
};

export const fetchArticleBySlug = cache(fetchArticleBySlugPayload);

export const fetchPageByFullSlug = cache(async (slug: string) => {
  const correctFullSlug = ensureCorrectFullSlug(slug);
  return fetchPageByFullSlugPayload(correctFullSlug);
});

export const fetchRootPages = cache(fetchRootPagesPayload);
