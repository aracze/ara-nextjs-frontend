import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Article as ArticleType } from "@/types/payload";
import { getPayloadURL } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroImage } from "@/components/features/static-hero-image";
import { StaticHeroWave } from "@/components/features/static-hero-wave";

interface ArticleProps {
  article: ArticleType;
}

export const Article: React.FC<ArticleProps> = ({ article }) => {
  const imageUrl = article.featuredImage?.image?.url
    ? article.featuredImage.image.url.startsWith("/")
      ? `${getPayloadURL()}${article.featuredImage.image.url}`
      : article.featuredImage.image.url
    : null;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "cs-CZ",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Article Header / Hero */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <StaticHeroImage
          imageUrl={imageUrl}
          styleCss={article.featuredImage?.featureImageStyleCss || undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 h-full max-w-5xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-20">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Zpět na hlavní stranu
          </Link>

          <div className="flex flex-wrap gap-4 mb-6">
            {article.category && (
              <span className="bg-[#215491] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {article.category}
              </span>
            )}
            <div className="flex items-center text-white/80 text-[10px] font-bold uppercase tracking-widest">
              <Calendar className="w-3 h-3 mr-2" />
              {formattedDate}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1]">
            {article.title}
          </h1>
        </div>
        <StaticHeroOverlay
          filterId={`blurFilter-article-${article.documentId}`}
        />
        <StaticHeroWave />
      </section>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>
            {article.text}
          </ReactMarkdown>
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#215491]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#215491] font-bold">
                Kategorie
              </p>
              <p className="font-bold text-gray-800">
                {article.category || "Článek"}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-8 py-3 bg-[#1a3f6c] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#215491] transition-all shadow-lg hover:shadow-xl"
          >
            Další inspirace
          </Link>
        </div>
      </main>
    </div>
  );
};
