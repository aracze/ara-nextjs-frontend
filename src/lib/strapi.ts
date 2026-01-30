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

export const fetchPageByFullSlug = async (
  fullSlug: string,
): Promise<{ data: { pages: Page[] } }> => {
  console.log(`[Strapi] RAW FETCH for: ${fullSlug}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(getStrapiURL() + "/graphql", {
    method: "POST",
    headers,
    cache: "no-store", // Vynutí stažení přímo ze Strapi
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

  if (!res.ok) {
    throw new Error("Failed to fetch data from Strapi");
  }

  const result = await res.json();
  console.log(
    `[Strapi] Received articles for ${fullSlug}:`,
    result?.data?.pages?.[0]?.articles
      ? result.data.pages[0].articles.length
      : "NONE",
  );
  return result;
};

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

      const res = await fetch(getStrapiURL() + "/graphql", {
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

      if (!res.ok) {
        throw new Error("Failed to fetch article data");
      }

      return res.json();
    },
    ["article_" + slug + "_" + (parentSlug || "any")],
    { revalidate: 10, tags: ["article_" + slug] },
  ),
);

export const fetchArticleBySlug = (slug: string, parentSlug?: string) =>
  fetchArticleBySlugCache(slug, parentSlug)();

export const fetchRootPages = () => fetchRootPagesCache();
