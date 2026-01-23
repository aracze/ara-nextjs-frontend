import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { isProduction } from "@/lib/utils";
import type { Page } from "@/types/strapi";
import redis from "@/lib/redis";

async function getData(): Promise<{
  data: {
    pages: Page[];
  };
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isProduction()) {
    headers["Authorization"] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }
  const res = await fetch(process.env.STRAPI_BASE_API_URL + "/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `query {
  pages (filters:  {
     parent:  {
      documentId:  {
        null: true
      }        
     }
  }) {
    documentId
    title
    slug
    text
    publishedAt
    featuredImage {
      url
      alternativeText
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
}

export default async function Home() {
  const { data } = await getData();

  return (
    <>
      <PageDisplay pages={data?.pages} />
    </>
  );
}
