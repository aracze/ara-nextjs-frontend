import Link from "next/link";
import { PageChild } from "@/types/strapi";

export const Subnavigation = ({
  title,
  pageChildren,
}: {
  title: string;
  pageChildren: PageChild[];
}) => {
  return (
    <div className="bg-white py-4 md:py-6 border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-4 md:gap-8 justify-center text-xs md:text-base font-medium text-[#1a3f6c] font-heading">
          <span className="text-[#215491] tracking-wide">{title}</span>
          {pageChildren?.slice(0, 8).map((pageChild) => (
            <Link
              key={pageChild.documentId}
              href={`/${pageChild.fullSlug}`}
              className="hover:text-[#215491] transition-colors tracking-wide text-gray-900 font-heading"
            >
              {pageChild.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
