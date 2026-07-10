import { Page } from "@/components/layout/page/page";
import { Article } from "@/components/layout/article/article";
import {
  fetchPageByFullSlug,
  fetchPageLightByFullSlug,
  fetchArticleBySlug,
} from "@/lib/payload";
import { buildPageTitle, rootPageCategories } from "@/lib/page-title";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Streamované dynamické vykreslování (záměrně NE celostránková ISR cache):
// s ISR čekala navigace na kompletní stránku bez jakékoliv odezvy (u studené
// stránky i sekundy „mrtvého" webu). Dynamický režim streamuje — loading.tsx
// (kostra) se zobrazí okamžitě a obsah do ní doteče. Prefetch odkazů pak
// stahuje jen lehký shell po loading boundary (pár KB), ne celé stránky.
// Rychlost obsahu zajišťuje cache dat na úrovni fetch (viz lib/payload.ts).
export const dynamic = "force-dynamic";

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
        // Titulek potřebuje jen title/category kořene — lehký fetch (sdílený
        // s ancestor cache), ne celý detail stránky.
        const { data: rootPageData } =
          await fetchPageLightByFullSlug(rootSegment);
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
