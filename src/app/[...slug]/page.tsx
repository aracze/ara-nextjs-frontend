import { Page } from "@/components/layout/page/page";
import { Article } from "@/components/layout/article/article";
import { fetchPageByFullSlug, fetchArticleBySlug } from "@/lib/payload";
import { buildPageTitle, rootPageCategories } from "@/lib/page-title";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// ISR: stránka se vygeneruje on-demand při první návštěvě, cachuje se a na
// pozadí obnovuje po 5 min. Při publikaci obsahu ji CMS obnoví okamžitě přes
// /api/cache (revalidateTag). Prefetch i navigace tak berou hotovou verzi
// z cache místo plného re-renderu — to dramaticky sníží zátěž i dobu odezvy.
// Bez generateStaticParams se nic neprerenderuje při buildu → build CMS nepotřebuje.
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  // 1. Try fetching as a Page
  const { data: pageData } = await fetchPageByFullSlug(fullSlug);
  if (pageData?.pages.length > 0) {
    const page = pageData.pages[0];

    let rootPage = page;
    if (!rootPageCategories.includes(page.category)) {
      const rootSegment = page.fullSlug.replace(/^\/+/, "").split("/")[0];
      if (rootSegment) {
        const { data: rootPageData } = await fetchPageByFullSlug(rootSegment);
        rootPage = rootPageData?.pages[0] || page;
      }
    }

    return { title: buildPageTitle(page, rootPage) };
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
        <Article article={articleData.articles[0]} contextSlug={parentSlug} />
      );
    }
  }

  notFound();
}
