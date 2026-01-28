import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { fetchRootPages } from "@/lib/strapi";

export default async function Home() {
  const { data } = await fetchRootPages();

  return (
    <>
      <PageDisplay pages={data?.pages} />
    </>
  );
}
