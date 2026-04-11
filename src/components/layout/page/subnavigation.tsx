import Link from "next/link";
import { PageChild } from "@/types/payload";

export const Subnavigation = ({
  title,
  pageChildren,
  currentPageDocumentId,
}: {
  title: string;
  pageChildren: PageChild[];
  currentPageDocumentId: string;
}) => {
  return (
    <div className="bg-white py-4 md:py-6 border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-4 md:gap-8 justify-center text-xs md:text-base font-medium text-[#1a3f6c] font-heading">
          <span className="text-[#215491] tracking-wide">{title}</span>
          {pageChildren?.slice(0, 8).map((pageChild) => (
            <Link
              key={pageChild.id}
              href={pageChild.fullSlug}
              className={`hover:text-[#215491] transition-colors tracking-wide font-heading ${String(pageChild.id) === currentPageDocumentId ? "text-[#ff0000]" : "text-gray-900"}`}
            >
              {pageChild.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
