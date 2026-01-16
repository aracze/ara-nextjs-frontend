import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { isProduction } from "@/lib/utils";

async function getData() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isProduction()) {
    headers['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }
  const res = await fetch(process.env.STRAPI_BASE_API_URL + "/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `query {
  pages {
    documentId
    title
    slug
    text
    publishedAt
    featuredImage {
      url
      alternativeText
    }
  }
}`,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const { data } = await getData();

  return (
    <>
      {data?.pages.map((page: any) => (
        <div key={page.documentId} className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black dark:text-zinc-50">
          <main className="w-full max-w-2xl space-y-8">
            {page ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="mb-2 text-2xl font-semibold">{page.title}</h1>
                <div className="mb-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Published: {new Date(page.publishedAt).toLocaleDateString()}</span>
                </div>

                {page.featuredImage && <Image
                  src={new URL(page.featuredImage.url, process.env.STRAPI_BASE_API_URL).toString()}
                  alt={page.featuredImage.alternativeText}
                  width={500}
                  height={500}
                />}

                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {page.text}
                  </ReactMarkdown>
                </div>

                {!isProduction() && <div className="mt-8 border-t pt-4 dark:border-zinc-800">
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">Raw Data</h3>
                  <pre className="overflow-x-auto rounded bg-zinc-950 p-4 text-xs text-zinc-50">
                    {JSON.stringify(page, null, 2)}
                  </pre>
                </div>}
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
}
