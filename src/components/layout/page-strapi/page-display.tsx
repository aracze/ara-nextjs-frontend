import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { isProduction } from "@/lib/utils";
import Link from "next/link";
import { Page, PageChild } from "@/types/strapi";

export const PageDisplay = ({ pages }: { pages: Page[] }) => {
  return (
    <>
      {pages.map((page) => (
        <div
          key={page.documentId}
          className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black dark:text-zinc-50"
        >
          <main className="w-full max-w-2xl space-y-8">
            {page ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="mb-2 text-2xl font-semibold">{page.title}</h1>
                <div className="mb-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>
                    Published: {new Date(page.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                {page.featuredImage && page.featuredImage.image && (
                  <Image
                    src={
                      page.featuredImage.image.url.startsWith("/")
                        ? new URL(
                            page.featuredImage.image.url,
                            process.env.STRAPI_BASE_API_URL,
                          ).toString()
                        : page.featuredImage.image.url
                    }
                    alt={page.featuredImage.image.alternativeText || ""}
                    width={500}
                    height={500}
                    style={
                      page.featuredImage.featureImageStyleCss
                        ? (page.featuredImage.featureImageStyleCss
                            .split(";")
                            .reduce((acc: Record<string, string>, rule) => {
                              const [k, v] = rule.split(":");
                              if (k && v) {
                                const key = k
                                  .trim()
                                  .replace(/-./g, (c) =>
                                    c.substr(1).toUpperCase(),
                                  );
                                acc[key] = v.trim();
                              }
                              return acc;
                            }, {}) as React.CSSProperties)
                        : undefined
                    }
                  />
                )}

                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {page.text}
                  </ReactMarkdown>
                </div>

                {page.children && page.children.length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-2 text-xl font-semibold">Children</h2>
                    <ul className="list-disc pl-6">
                      {page.children.map((child: PageChild) => (
                        <li key={child.documentId}>
                          <Link href={`/${child.fullSlug}`}>{child.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isProduction() && (
                  <div className="mt-8 border-t pt-4 dark:border-zinc-800">
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                      Raw Data
                    </h3>
                    <pre className="overflow-x-auto rounded bg-zinc-950 p-4 text-xs text-zinc-50">
                      {JSON.stringify(page, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                No article found with the specified Document ID.
              </div>
            )}
          </main>
        </div>
      ))}
    </>
  );
};
