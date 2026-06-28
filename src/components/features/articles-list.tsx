import React from "react";
import { Article } from "@/types/payload";
import { ArticleCard } from "./article-card";

interface ArticlesProps {
  articles: Article[];
  parentFullSlug?: string;
}

export const ArticlesList: React.FC<ArticlesProps> = ({
  articles: articlesProp,
  parentFullSlug,
}) => {
  // Ensure we have an array even if Payload returns a single object (due to relation type)
  const articles = Array.isArray(articlesProp)
    ? articlesProp
    : articlesProp
      ? [articlesProp]
      : [];

  if (articles.length === 0) return null;

  return (
    <section className="w-full py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col mb-12">
          <h2 className="text-3xl font-bold text-[#1a3f6c] mb-4">
            Doporučené články
          </h2>
          <div className="w-20 h-1.5 bg-[#215491] rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => {
            const href = parentFullSlug
              ? `${parentFullSlug.replace(/\/$/, "")}/${article.slug}`
              : `/blog/${article.slug}`;
            const articleKey =
              article.documentId || article.slug || `${article.title}-${index}`;

            return (
              <ArticleCard key={articleKey} article={article} href={href} />
            );
          })}
        </div>
      </div>
    </section>
  );
};
