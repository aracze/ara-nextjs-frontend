import Link from "next/link";
import { PageChild } from "@/types/strapi";

export const Subnavigation = ({ title, pageChildren }: { title: string; pageChildren: PageChild[] }) => {
  return (
    <div className="bg-white py-4 md:py-6 border-b border-gray-100 relative z-30 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-4 md:gap-8 justify-center text-xs md:text-sm font-bold text-[#1a3f6c]">
          <span className="border-b-2 border-[#215491] text-[#215491] pb-1 uppercase tracking-wider">
            {title}
          </span>
          {pageChildren?.slice(0, 8).map((pageChild) => (
            <Link
              key={pageChild.documentId}
              href={`/${pageChild.fullSlug}`}
              className="hover:text-[#215491] transition-colors uppercase tracking-wide text-gray-500"
            >
              {pageChild.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
