import { fetchRootPages } from "@/lib/payload";
import { Homepage } from "@/components/layout/homepage/homepage";

export default async function Home() {
  const { data } = await fetchRootPages();

  return <Homepage homepage={data?.homepage} />;
}
