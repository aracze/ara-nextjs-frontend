import { Page } from "@/components/layout/page/page";
import { Article } from "@/components/layout/article/article";
import { fetchPageByFullSlug, fetchArticleBySlug } from "@/lib/strapi";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  // 1. Try fetching as a Page
  const { data: pageData } = await fetchPageByFullSlug(fullSlug);
  if (pageData?.pages.length > 0) {
    return { title: pageData.pages[0]?.title };
  }

  // 2. If not a page, try fetching as an Article under a parent
  if (slug.length > 1) {
    const articleSlug = slug[slug.length - 1];
    const parentSlug = slug.slice(0, -1).join("/");
    const { data: articleData } = await fetchArticleBySlug(
      articleSlug,
      parentSlug,
    );

    if (articleData?.articles.length > 0) {
      return { title: articleData.articles[0]?.title };
    }
  }

  notFound();
}

export default async function PageRoute({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  // 1. Try fetching as a Page
  const { data: pageData } = await fetchPageByFullSlug(fullSlug);
  if (pageData?.pages.length > 0) {
    return <Page pages={pageData?.pages} />;
  }

  // 2. If not a page, try fetching as an Article under a parent
  if (slug.length > 1) {
    const articleSlug = slug[slug.length - 1];
    const parentSlug = slug.slice(0, -1).join("/");
    const { data: articleData } = await fetchArticleBySlug(
      articleSlug,
      parentSlug,
    );

    if (articleData?.articles.length > 0) {
      return <Article article={articleData.articles[0]} />;
    }
  }

  notFound();
}
