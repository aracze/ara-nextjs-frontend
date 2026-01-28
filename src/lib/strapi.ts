import { Page, PagesResponse } from "@/types/strapi";
import { getStrapiURL } from "./utils";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import redis from "./redis";

const fetchParentPagesCache = cache(
  unstable_cache(
    async (): Promise<PagesResponse> => {
      const pageJson = await redis.get("parent_pages");
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
          }
        }`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await res.json();
      await redis.set("parent_pages", JSON.stringify(data));
      return data;
    },
    ["parent_pages"],
    { revalidate: 10, tags: ["parent_pages"] },
  ),
);

const fetchPageByFullSlugCache = cache((fullSlug: string) =>
  unstable_cache(
    async (): Promise<{
      data: {
        pages: Page[];
      };
    }> => {
      const pageJson = await redis.get(fullSlug);
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
          query: `query {
  pages (filters:  {
     fullSlug: {
      eq: "${fullSlug}"
     }
  }) {
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
  }
}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await res.json();
      await redis.set(fullSlug, JSON.stringify(data));
      return data;
    },
    [fullSlug],
    { revalidate: 10, tags: ["page_" + fullSlug] },
  ),
);

export const fetchPageByFullSlug = (fullSlug: string) =>
  fetchPageByFullSlugCache(fullSlug)();
export const fetchParentPages = () => fetchParentPagesCache();
