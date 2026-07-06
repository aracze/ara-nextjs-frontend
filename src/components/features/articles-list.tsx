import React from "react";
import { Article } from "@/types/payload";
import { ArticleCard } from "./article-card";

interface ArticlesProps {
  articles: Article[];
  parentFullSlug?: string;
  /** Lokativ destinace z `page.detail.locative` (např. „v Chorvatsku", „na Slovensku"). */
  destinationLocative?: string | null;
}

export const ArticlesList: React.FC<ArticlesProps> = ({
  articles: articlesProp,
  parentFullSlug,
  destinationLocative,
}) => {
  // Ensure we have an array even if Payload returns a single object (due to relation type)
  const articles = Array.isArray(articlesProp)
    ? articlesProp
    : articlesProp
      ? [articlesProp]
      : [];

  if (articles.length === 0) return null;

  // Lokativ je uložený i s předložkou („v Chorvatsku", „na Slovensku", „ve Španělsku").
  // Očistíme na holý tvar a použijeme „po {…}" (po Chorvatsku / po Slovensku) — funguje
  // pro všechny pády bez problému s předložkou z/ze a neopakuje nadpis „Články a cestopisy".
  const place = destinationLocative?.replace(/^(ve?|na)\s+/i, "").trim();
  const subtitle = place
    ? `Zážitky, tipy a inspirace z cestování po ${place}.`
    : "Zážitky, tipy a inspirace z cestování.";

  return (
    <section id="clanky" className="w-full py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col mb-12 items-center text-center">
          <h2 className="text-3xl font-bold text-[#1a3f6c] mb-3 font-heading tracking-tight">
            Články a cestopisy
          </h2>
          <div className="w-[30px] h-[1px] bg-[#215491] rounded-full mb-5"></div>
          <p className="text-[17px] text-gray-400 max-w-xl leading-relaxed">
            {subtitle}
          </p>
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
