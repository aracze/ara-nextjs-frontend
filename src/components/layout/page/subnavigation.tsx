import Link from "next/link";
import { PageChild, PageCategory } from "@/types/payload";

const hiddenCategories: string[] = [
  PageCategory.Misto_k_navstiveni,
  PageCategory.Turisticky_cil,
];

// Categories that represent "practical information" pages (country-level content).
// On sub-places (like Dubrovník), these will be collapsed into a single
// "Praktické informace" link pointing to the root's practical info page.
const practicalInfoCategories: string[] = [
  PageCategory.Vstupni_podminky,
  PageCategory.Cesta,
  PageCategory.Doprava,
  PageCategory.Mena_a_ceny,
  PageCategory.Zdravi_a_bezpeci,
  PageCategory.Jazyk_a_kultura,
  PageCategory.Jidlo_a_pit,
  PageCategory.Ubytovani,
];

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
  "prakticke",
];

const normalizeMenuLabel = (value: string) =>
  value
    .trim()
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
  contextTitle,
  contextFullSlug,
  pageChildren,
  rootChildren,
  currentPageFullSlug,
  currentPageCategory,
  isSubPlace,
}: {
  contextTitle: string;
  contextFullSlug: string;
  pageChildren: PageChild[];
  rootChildren: PageChild[];
  currentPageFullSlug: string;
  currentPageCategory?: string;
  isSubPlace: boolean;
}) => {
  const isContextActive = currentPageFullSlug === contextFullSlug;

  // Filter out hidden categories (Places, Tourist destinations) from menu
  const visibleChildren = pageChildren?.filter((child) => {
    if (child.category && hiddenCategories.includes(child.category)) {
      return false;
    }
    // On sub-places, exclude individual practical info pages as they are collapsed
    // into a single "Praktické informace" link pointing to the root.
    if (
      isSubPlace &&
      child.category &&
      practicalInfoCategories.includes(child.category)
    ) {
      return false;
    }
    return true;
  });

  const sortedChildren = [...(visibleChildren || [])]
    .map((child, originalIndex) => ({ child, originalIndex }))
    .sort((a, b) => {
      const rankDiff = getLegacyMenuRank(a.child) - getLegacyMenuRank(b.child);
      if (rankDiff !== 0) return rankDiff;

      return a.originalIndex - b.originalIndex;
    })
    .map(({ child }) => child);

  // On sub-places (like Dubrovník), find the root's "Praktické informace" page
  // to show as a single collapsed link instead of individual pages.
  const practicalInfoPage = isSubPlace
    ? rootChildren?.find(
        (child) => child.category === PageCategory.Prakticke_informace,
      )
    : null;

  // Determine if the current page falls under "practical info" (for highlighting)
  const isCurrentPagePracticalInfo =
    isSubPlace &&
    currentPageCategory &&
    (practicalInfoCategories.includes(currentPageCategory) ||
      currentPageCategory === PageCategory.Prakticke_informace);

  return (
    <div className="bg-white border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-0 justify-center text-xs md:text-base font-semibold font-heading">
          {/* Context page (the Place that owns this menu) */}
          <Link
            href={contextFullSlug}
            className={`px-3 py-4 tracking-wide transition-colors border-b-2 ${
              isContextActive
                ? "text-[#287bbb] border-[#287bbb] font-bold"
                : "text-[#215491] border-transparent hover:text-[#287bbb]"
            }`}
          >
            {contextTitle}
          </Link>

          {/* Menu items from the context page's children */}
          {sortedChildren.map((pageChild) => {
            const isActive =
              currentPageFullSlug === pageChild.fullSlug ||
              currentPageFullSlug.startsWith(pageChild.fullSlug + "/");
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

          {/* On sub-places, show a single "Praktické informace" link from the root */}
          {isSubPlace && practicalInfoPage && (
            <Link
              href={practicalInfoPage.fullSlug}
              className={`px-3 py-4 tracking-wide transition-colors border-b-2 ${
                isCurrentPagePracticalInfo
                  ? "text-[#287bbb] border-[#287bbb] font-bold"
                  : "text-gray-800 border-transparent hover:text-[#287bbb]"
              }`}
            >
              Praktické informace
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
