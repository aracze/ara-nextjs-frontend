import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Article as ArticleType } from "@/types/payload";
import { getPayloadURL, richTextToHtml } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroImage } from "@/components/features/static-hero-image";
import { StaticHeroWave } from "@/components/features/static-hero-wave";
import { fetchPageByFullSlug } from "@/lib/payload";
import { Subnavigation } from "@/components/layout/page/subnavigation";
import { HeroSection } from "@/components/layout/page/hero-section";
import { ArticleAd } from "@/components/features/article-ad";
import { ArticleActions } from "@/components/features/article-actions";

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

  // Author (safe public subset from the backend virtual field)
  const author = article.createdByPublic ?? null;
  const authorName = author
    ? [author.firstName, author.lastName].filter(Boolean).join(" ") ||
      author.username ||
      null
    : null;
  const profileHref = author?.username ? `/profil/${author.username}` : null;
  const rawAvatar = author?.avatar?.url;
  const avatarUrl = rawAvatar
    ? rawAvatar.startsWith("/")
      ? new URL(rawAvatar, process.env.PAYLOAD_BASE_API_URL).toString()
      : rawAvatar
    : "/assets/avatar-white.jpg";
  const authorBio = author?.description || null;

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
          contextTitle={rootPage.title}
          contextFullSlug={rootPage.fullSlug}
          pageChildren={rootPage.children?.docs ?? []}
          rootChildren={rootPage.children?.docs ?? []}
          currentPageFullSlug={contextPage?.fullSlug ?? ""}
          currentPageCategory={contextPage?.category}
          isSubPlace={false}
        />
      )}

      {/* Article Content + side advertisement (two-column on desktop) */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-stretch lg:flex-row gap-8 lg:gap-10">
        <main className="flex-1 min-w-0 lg:max-w-4xl">
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

          <div className="article-prose prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>
              {articleText}
            </ReactMarkdown>
          </div>

          {/* Attribution (Zdroj: ...) — right-aligned italic, like the legacy `p.attribution` */}
          {article.attribution && (
            <div className="mt-12 text-right text-sm italic text-gray-600 [&_a]:font-medium [&_a]:text-[#215491] [&_a]:no-underline hover:[&_a]:underline">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {richTextToHtml(article.attribution)}
              </ReactMarkdown>
            </div>
          )}

          {/* Author */}
          {authorName && (
            <div className="mt-8 flex items-start gap-4 border-t border-[#dadbdc] pt-5 pb-2.5">
              {profileHref ? (
                <Link href={profileHref} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="h-[45px] w-[45px] rounded-full border-[3px] border-white object-cover shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
                  />
                </Link>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={authorName}
                  className="h-[45px] w-[45px] shrink-0 rounded-full border-[3px] border-white object-cover shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
                />
              )}
              <div className="min-w-0">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="font-semibold text-[#215491] hover:underline"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#215491]">
                    {authorName}
                  </span>
                )}
                {authorBio && (
                  <p className="mt-1 leading-relaxed text-gray-600">
                    {authorBio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Comment count + "Vložit komentář" + "Sdílet" (comments not wired up yet) */}
          <ArticleActions commentCount={0} />
        </main>

        {/* Side advertisements — desktop only, matches legacy `.sideAds`.
            The column stretches to the article height and is split into two halves;
            each ad is `sticky`, so the first pins in the upper half and the second
            takes over in the lower half (legacy `sideAds--first` / `sideAds--second`). */}
        <aside className="hidden lg:flex flex-col w-[340px] shrink-0">
          <div className="flex-1">
            <ArticleAd variant="primary" className="sticky top-5" />
          </div>
          <div className="flex-1">
            <ArticleAd variant="secondary" className="sticky top-5 mt-10" />
          </div>
        </aside>
      </div>
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
