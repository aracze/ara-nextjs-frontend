import { PageDisplay } from "@/components/layout/page-strapi/page-display";
import { fetchParentPages } from "@/lib/strapi";

export default async function Home() {
  const { data } = await fetchParentPages();

  return (
    <>
      <PageDisplay pages={data?.pages} />
    </>
  );
}
