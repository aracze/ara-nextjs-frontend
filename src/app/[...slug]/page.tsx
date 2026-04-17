import { Page } from "@/components/layout/page/page";
import { Article } from "@/components/layout/article/article";
import { fetchPageByFullSlug, fetchArticleBySlug } from "@/lib/payload";
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

  // 2. If not a page, try fetching as an Article (last segment = article slug)
  if (slug.length > 1) {
    const articleSlug = slug[slug.length - 1];
    const parentSlug = slug.slice(0, -1).join("/");
    const { data: articleData } = await fetchArticleBySlug(
      articleSlug,
      parentSlug,
    );

    const article = articleData?.articles[0];
    if (article) {
      const canonicalSlug = article.mainPage?.fullSlug
        ? `${article.mainPage.fullSlug}/${article.slug}`
        : null;

      return {
        title: article.title,
        ...(canonicalSlug
          ? {
              alternates: {
                canonical: canonicalSlug,
              },
            }
          : {}),
      };
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
    return <Page page={pageData?.pages[0]} />;
  }

  // 2. If not a page, try fetching as an Article (last segment = article slug)
  if (slug.length > 1) {
    const articleSlug = slug[slug.length - 1];
    const parentSlug = slug.slice(0, -1).join("/");
    const { data: articleData } = await fetchArticleBySlug(
      articleSlug,
      parentSlug,
    );

    if (articleData?.articles.length > 0) {
      return (
        <Article
          article={articleData.articles[0]}
          contextSlug={parentSlug}
        />
      );
    }
  }

  notFound();
}
