import { fetchRootPages } from "@/lib/payload";
import { Homepage } from "@/components/layout/homepage/homepage";

// Vykreslujeme za běhu (ne při buildu) — obrázek se staví v GitHub Actions bez
// běžícího CMS. Data se dál cachují na úrovni fetch (revalidate: 10 s).
export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await fetchRootPages();

  return <Homepage homepage={data?.homepage} />;
}
