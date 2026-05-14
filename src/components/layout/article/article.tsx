import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Article as ArticleType } from "@/types/payload";
import { getPayloadURL, richTextToHtml } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroImage } from "@/components/features/static-hero-image";
import { StaticHeroWave } from "@/components/features/static-hero-wave";
import { fetchPageByFullSlug } from "@/lib/payload";
import { Subnavigation } from "@/components/layout/page/subnavigation";
import { HeroSection } from "@/components/layout/page/hero-section";

interface ArticleProps {
  article: ArticleType;
  contextSlug?: string;
}

export const Article: React.FC<ArticleProps> = async ({
  article,
  contextSlug,
}) => {
  const articleText = richTextToHtml(article.text);

  // Resolve the context page (the page the user came from based on URL)
  const contextPageSlug =
    contextSlug || article.mainPage?.fullSlug?.replace(/^\//, "") || null;
  const { contextPage, rootPage } = await resolveContextPages(contextPageSlug);

  const backHref = contextPage ? contextPage.fullSlug : "/";
  const backLabel = contextPage ? contextPage.title : "Zpět na hlavní stranu";

  const heroImageUrl = resolveHeroImage(contextPage || rootPage, article);

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
      <HeroSection
        title={article.title}
        imageUrl={heroImageUrl}
        styleCss={article.featuredImage?.featureImageStyleCss || undefined}
        filterId={`blurFilter-article-${article.documentId}`}
      />

      {/* Subnavigation - keeps user in context of parent destination */}
      {rootPage && (
        <Subnavigation
          title={rootPage.title}
          rootFullSlug={rootPage.fullSlug}
          pageChildren={rootPage.children?.docs ?? []}
          currentPageFullSlug={contextPage?.fullSlug ?? ""}
        />
      )}

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Breadcrumb-style back link + meta */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Link
            href={backHref}
            className="inline-flex items-center text-[#215491] hover:text-[#1a3f6c] transition-colors group text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            {backLabel}
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {article.category && (
            <span className="bg-[#215491] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {article.category}
            </span>
          )}
          <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            <Calendar className="w-3 h-3 mr-2" />
            {formattedDate}
          </div>
        </div>

        <div className="prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>
            {articleText}
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
            href={backHref}
            className="px-8 py-3 bg-[#1a3f6c] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#215491] transition-all shadow-lg hover:shadow-xl"
          >
            Další inspirace
          </Link>
        </div>
      </main>
    </div>
  );
};

async function resolveContextPages(contextPageSlug: string | null) {
  if (!contextPageSlug) return { contextPage: null, rootPage: null };

  const { data } = await fetchPageByFullSlug(contextPageSlug);
  const contextPage = data?.pages[0] ?? null;

  if (!contextPage) return { contextPage: null, rootPage: null };

  // Find root page (first segment of the slug)
  const rootSlug = contextPageSlug.split("/")[0];
  if (rootSlug === contextPageSlug) {
    // Context page IS the root page
    return { contextPage, rootPage: contextPage };
  }

  const { data: rootData } = await fetchPageByFullSlug(rootSlug);
  const rootPage = rootData?.pages[0] ?? contextPage;

  return { contextPage, rootPage };
}

function resolveHeroImage(
  page: {
    featuredImage?: {
      image?: { url?: string } | null;
      featureImageStyleCss?: string | null;
    } | null;
  } | null,
  article: ArticleType,
) {
  // Prefer article's own featured image, fall back to context page
  const source = article.featuredImage?.image?.url
    ? article.featuredImage
    : page?.featuredImage;

  const url = source?.image?.url;
  if (!url) return null;

  return url.startsWith("/") ? `${getPayloadURL()}${url}` : url;
}
