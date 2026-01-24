import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { getStrapiURL } from "@/lib/utils";
import type { Page } from "@/types/strapi";

async function getData(): Promise<{
  data: {
    pages: Page[];
  };
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const res = await fetch(getStrapiURL() + "/graphql", {
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
}

export default async function Home() {
  const { data } = await getData();

  return (
    <>
      <PageDisplay pages={data?.pages} />
    </>
  );
}
