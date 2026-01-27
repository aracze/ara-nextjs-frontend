import { Page } from "@/types/strapi";
import { getStrapiURL } from "./utils";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const fetchParentPages = cache(
  unstable_cache(
    async () => {
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
            slug
            children {
              title
              slug
              documentId
            }
          }
        }`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      return res.json();
    },
    ["parent_pages"],
    { revalidate: 10, tags: ["parent_pages"] },
  ),
);

export const fetchPageBySlug = (slug: string) =>
  cache(
    unstable_cache(
      async (): Promise<{
        data: {
          pages: Page[];
        };
      }> => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const res = await fetch(getStrapiURL() + "/graphql", {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: `query {
  pages (filters:  {
     slug: {
      eq: "${slug}"
     }
  }) {
    documentId
    title
    slug
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
      slug
      documentId
    }
  }
}`,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        return res.json();
      },
      [slug],
      { revalidate: 10, tags: ["page_" + slug] },
    ),
  );
