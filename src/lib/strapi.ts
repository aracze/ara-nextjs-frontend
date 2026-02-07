import { Page, PagesResponse, Article } from "@/types/strapi";
import { getStrapiURL } from "./utils";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getCache, setCache } from "./redis";

const fetchRootPagesCache = cache(
  unstable_cache(
    async (): Promise<PagesResponse> => {
      const pageJson = await getCache("root_pages");
      if (pageJson) {
        return JSON.parse(pageJson);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const res = await fetch(getStrapiURL() + "/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `
            query {
              global {
                header {
                  logo {
                    svgCode
                  }
                }
              }
              homepage {
                title
              }
              pages(filters: { parent: { documentId: { null: true } } }) {
                documentId
                title
                fullSlug
                text
                publishedAt
                featuredImage {
                  image {
                    url
                    alternativeText
                  }
                  featureImageStyleCss
                }
                children {
                  title
                  fullSlug
                  documentId
                  children {
                    title
                    fullSlug
                    documentId
                  }
                }
                articles {
                  documentId
                  title
                  slug
                  text
                  featuredImage {
                    image {
                      url
                      alternativeText
                    }
                  }
                }
              }
            }`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await res.json();
      await setCache("root_pages", JSON.stringify(data));
      return data;
    },
    ["root_pages"],
    { revalidate: 10, tags: ["root_pages"] },
  ),
);

const fetchPageByFullSlugCache = cache((fullSlug: string) =>
  unstable_cache(
    async (): Promise<{ data: { pages: Page[] } }> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const response = await fetch(getStrapiURL() + "/graphql", {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify({
          query: `query {
            pages (filters: { fullSlug: { eq: "${fullSlug}" } }) {
              documentId
              title
              fullSlug
              text
              publishedAt
              featuredImage {
                image {
                  url
                  alternativeText
                }
                featureImageStyleCss
              }
              children {
                title
                fullSlug
                documentId
              }
              articles {
                documentId
                title
                slug
                text
                featuredImage {
                  image {
                    url
                    alternativeText
                  }
                }
              }
            }
          }`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from Strapi");
      }

      const result = await response.json();

      if (result.errors?.length > 0) {
        throw new Error(result.errors[0].message);
      }

      return result;
    },
    ["page_" + fullSlug],
    { revalidate: 10, tags: ["page_" + fullSlug] },
  ),
);

const fetchArticleBySlugCache = cache((slug: string, parentSlug?: string) =>
  unstable_cache(
    async (): Promise<{
      data: {
        articles: Article[];
      };
    }> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // If we have a parentSlug, we want to ensure the article is linked to that page
      const parentFilter = parentSlug
        ? `, pages: { fullSlug: { eq: "${parentSlug}" } }`
        : "";

      const response = await fetch(getStrapiURL() + "/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `query {
            articles (filters: { slug: { eq: "${slug}" } ${parentFilter} }) {
              documentId
              title
              text
              slug
              category
              publishedAt
              featuredImage {
                image {
                  url
                  alternativeText
                }
              }
            }
          }`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch article data");
      }

      const result = await response.json();

      if (result.errors?.length > 0) {
        throw new Error(result.errors[0].message);
      }

      return result;
    },
    ["article_" + slug + "_" + (parentSlug || "any")],
    { revalidate: 10, tags: ["article_" + slug] },
  ),
);

export const fetchArticleBySlug = (slug: string, parentSlug?: string) =>
  fetchArticleBySlugCache(slug, parentSlug)();

export const fetchPageByFullSlug = (slug: string) =>
  fetchPageByFullSlugCache(slug)();

export const fetchRootPages = () => fetchRootPagesCache();
