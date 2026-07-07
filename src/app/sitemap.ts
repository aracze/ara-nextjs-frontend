import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/payload";
import { getSiteURL } from "@/lib/utils";

// Regenerace jednou za hodinu (ISR) — sitemap se sestavuje z Payloadu za běhu.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteURL();
  const { pages, articles } = await fetchSitemapEntries();

  const toUrl = (path: string) =>
    `${site}${path.startsWith("/") ? path : `/${path}`}`;

  const entries: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "daily", priority: 1 },
    ...pages.map((p) => ({
      url: toUrl(p.path),
      lastModified: p.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: toUrl(a.path),
      lastModified: a.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  // Deduplikace podle URL (kdyby se cesta stránky a článku shodovala).
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
