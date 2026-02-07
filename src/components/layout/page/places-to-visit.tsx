import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PageChild } from "@/types/strapi";
import { getStrapiURL } from "@/lib/utils";

interface PlacesToVisitProps {
  children: PageChild[];
}

export const PlacesToVisit: React.FC<PlacesToVisitProps> = ({ children }) => {
  // Filter children that have the category "Místo k navštívení" or internal Strapi enum values
  console.log(
    "PlacesToVisit raw children data:",
    JSON.stringify(
      children.map((c) => ({ title: c.title, category: c.category })),
      null,
      2,
    ),
  );

  const places = children.filter((child) => {
    const cat = child.category?.trim();
    return cat === "Misto_k_navstiveni";
  });

  if (places.length === 0) return null;

  return (
    <section className="w-full py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col mb-12 items-center text-center">
          <h2 className="text-4xl font-bold text-[#1a3f6c] mb-4 font-heading tracking-tight">
            Co vidět v této oblasti
          </h2>
          <div className="w-24 h-1.5 bg-[#d45145] rounded-full"></div>
          <p className="mt-6 text-gray-500 max-w-2xl text-lg font-light leading-relaxed">
            Objevte nejkrásnější místa a památky, které stojí za návštěvu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {places.map((place) => {
            const imageUrl = place.featuredImage?.image?.url
              ? place.featuredImage.image.url.startsWith("/")
                ? `${getStrapiURL()}${place.featuredImage.image.url}`
                : place.featuredImage.image.url
              : null;

            return (
              <Link
                key={place.documentId}
                href={`/${place.fullSlug}`}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 h-[380px]"
              >
                <div className="relative h-full w-full overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={place.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a3f6c]/5 to-[#1a3f6c]/10 flex items-center justify-center">
                      <span className="text-[#1a3f6c]/20 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Bez náhledu
                      </span>
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors leading-tight">
                      {place.title}
                    </h3>
                    <div className="flex items-center text-white/80 text-[12px] font-medium tracking-wide border-t border-white/20 pt-3">
                      <span>Prozkoumat místo</span>
                      <svg
                        className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
