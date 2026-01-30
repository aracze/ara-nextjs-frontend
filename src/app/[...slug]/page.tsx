import { Page } from "@/components/layout/page/page";
import { fetchPageByFullSlug } from "@/lib/strapi";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const { data } = await fetchPageByFullSlug(fullSlug);
  if (data?.pages.length > 0) {
    return {
      title: data.pages[0].title,
    };
  } else {
    notFound();
  }
}

export default async function PageRoute({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const { data } = await fetchPageByFullSlug(fullSlug);
  if (data?.pages.length > 0) {
    return <Page pages={data?.pages} />;
  } else {
    notFound();
  }
}
