import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { getStrapiURL } from "@/lib/utils";
import type { Page } from "@/types/strapi";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getData(slug: string): Promise<{
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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getData(slug);
  if (data?.pages.length > 0) {
    return {
      title: data.pages[0].title,
    };
  } else {
    notFound();
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { data } = await getData(slug);
  if (data?.pages.length > 0) {
    return <PageDisplay pages={data?.pages} />;
  } else {
    notFound();
  }
}
