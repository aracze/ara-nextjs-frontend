import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { isProduction } from "@/lib/utils";
import type { Page } from "@/types/strapi";
import { notFound } from "next/navigation";

async function getData(slug: string): Promise<{
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
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getData(slug);
  if (data?.pages.length > 0) {
    return <PageDisplay pages={data?.pages} />;
  } else {
    notFound()
  }
}
