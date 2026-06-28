import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/payload";
import { getPayloadURL, richTextToPlainText } from "@/lib/utils";

/** Single article card used in listings (recommended articles, rubric pages). */
export function ArticleCard({
  article,
  href,
}: {
  article: Article;
  href: string;
}) {
  const articleText = richTextToPlainText(article.text);
  const imageUrl = article.featuredImage?.image?.url
    ? article.featuredImage.image.url.startsWith("/")
      ? `${getPayloadURL()}${article.featuredImage.image.url}`
      : article.featuredImage.image.url
    : null;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100/50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2"
    >
      <div className="relative h-72 w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a3f6c]/5 to-[#1a3f6c]/10 flex items-center justify-center">
            <span className="text-[#1a3f6c]/20 font-bold uppercase tracking-[0.2em] text-[10px]">
              Bez náhledu
            </span>
          </div>
        )}
        {/* Glassmorphism Badge */}
        <div className="absolute top-4 left-4 backdrop-blur-md bg-white/70 px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
          <span className="text-[10px] font-bold text-[#1a3f6c] uppercase tracking-wider font-heading">
            Článek
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 relative">
        <h3 className="text-2xl font-bold text-[#1a3f6c] mb-4 group-hover:text-[#215491] transition-colors leading-[1.2]">
          {article.title}
        </h3>
        <div className="text-gray-500 line-clamp-3 text-[15px] leading-relaxed mb-8 font-light">
          {articleText}
        </div>
        <div className="mt-auto flex items-center text-[#215491] font-bold text-[13px] tracking-[0.1em] uppercase group/read font-heading">
          <span>Číst více</span>
          <div className="ml-3 w-8 h-[1px] bg-[#215491]/30 transition-all duration-300 group-hover/read:w-12 group-hover/read:bg-[#215491]"></div>
        </div>
      </div>
    </Link>
  );
}
