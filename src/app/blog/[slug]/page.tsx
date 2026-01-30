import { fetchArticleBySlug } from "@/lib/strapi";
import { notFound } from "next/navigation";
import { Article } from "@/components/layout/article/article";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await fetchArticleBySlug(slug);

  if (!data?.articles || data.articles.length === 0) {
    return { title: "Článek nenalezen" };
  }

  const article = data.articles[0];
  return {
    title: article.title,
    description: article.text.substring(0, 160),
  };
}

export default async function ArticlePageRoute({ params }: Props) {
  const { slug } = await params;
  const { data } = await fetchArticleBySlug(slug);

  if (!data?.articles || data.articles.length === 0) {
    notFound();
  }

  const article = data.articles[0];
  return <Article article={article} />;
}
