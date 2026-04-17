import Link from "next/link";
import { PageChild, PageCategory } from "@/types/payload";

const hiddenCategories: string[] = [PageCategory.Misto_k_navstiveni];

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
          {visibleChildren?.map((pageChild) => {
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
