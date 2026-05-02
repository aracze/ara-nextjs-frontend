import Link from "next/link";
import { PageChild, PageCategory } from "@/types/payload";

const hiddenCategories: string[] = [PageCategory.Misto_k_navstiveni];

const legacyMenuOrder = [
  "mista",
  "vstup",
  "cesta",
  "pocasi",
  "doprava",
  "mena",
  "zdravi",
  "kultura",
  "jidlo",
  "clanky",
];

const normalizeMenuLabel = (value: string) =>
  value
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getLegacyMenuRank = (pageChild: PageChild): number => {
  const normalizedTitle = normalizeMenuLabel(pageChild.title || "");
  const index = legacyMenuOrder.findIndex((token) =>
    normalizedTitle.startsWith(token),
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const Subnavigation = ({
  title,
  rootFullSlug,
  pageChildren,
  currentPageFullSlug,
}: {
  title: string;
  rootFullSlug: string;
  pageChildren: PageChild[];
  currentPageFullSlug: string;
}) => {
  const isRootActive = currentPageFullSlug === rootFullSlug;
  const visibleChildren = pageChildren?.filter(
    (child) => !child.category || !hiddenCategories.includes(child.category),
  );
  const sortedChildren = [...(visibleChildren || [])]
    .map((child, originalIndex) => ({ child, originalIndex }))
    .sort((a, b) => {
      const rankDiff = getLegacyMenuRank(a.child) - getLegacyMenuRank(b.child);
      if (rankDiff !== 0) return rankDiff;

      return a.originalIndex - b.originalIndex;
    })
    .map(({ child }) => child);

  return (
    <div className="bg-white border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-0 justify-center text-xs md:text-base font-semibold font-heading">
          <Link
            href={rootFullSlug}
            className={`px-3 py-4 tracking-wide transition-colors border-b-2 ${
              isRootActive
                ? "text-[#287bbb] border-[#287bbb] font-bold"
                : "text-[#215491] border-transparent hover:text-[#287bbb]"
            }`}
          >
            {title}
          </Link>
          {sortedChildren.map((pageChild) => {
            const isActive =
              !isRootActive &&
              (currentPageFullSlug === pageChild.fullSlug ||
                currentPageFullSlug.startsWith(pageChild.fullSlug + "/"));
            return (
              <Link
                key={pageChild.id}
                href={pageChild.fullSlug}
                className={`px-3 py-4 tracking-wide transition-colors border-b-2 ${
                  isActive
                    ? "text-[#287bbb] border-[#287bbb] font-bold"
                    : "text-gray-800 border-transparent hover:text-[#287bbb]"
                }`}
              >
                {pageChild.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
