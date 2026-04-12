import { PageChild } from "@/types/payload";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

export const MainContent = ({
  text,
  pageChildren = [],
}: {
  text: string;
  pageChildren: PageChild[];
}) => {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-18 py-12 md:py-20 flex flex-col md:flex-row gap-16 lg:gap-24">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="prose max-w-none prose-a:text-[#215491] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]}>{text}</ReactMarkdown>
        </div>
      </div>

      {/* Sidebar / Info Column */}
      <aside className="w-full md:w-80 flex flex-col gap-12">
        {/* Time & Exchange Info Mockup */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-sm transition-shadow">
          <h3 className="text-gray-900 font-bold mb-6 text-xl border-l-4 border-[#215491] pl-4">
            Aktuální info
          </h3>
          <div className="space-y-8">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[#215491] font-bold font-heading">
                Lokální čas
              </span>
              <span className="text-3xl font-light text-gray-800 tabular-nums mt-1 uppercase font-heading">
                pátek{" "}
                {new Date().toLocaleTimeString("cs-CZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                OH
              </span>
            </div>
            <div className="h-[1px] bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[#215491] font-bold font-heading">
                Měnový kurz
              </span>
              <div className="mt-2 text-2xl font-light text-gray-800 font-heading">
                1 HRK = 3,27 CZK
              </div>
            </div>
          </div>
        </div>

        {/* Sub-pages list */}
        {pageChildren.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-gray-900 font-bold mb-6 text-xl">Podstránky</h3>
            <ul className="space-y-4">
              {pageChildren.map((child: PageChild) => (
                <li key={child.id}>
                  <Link
                    href={child.fullSlug}
                    className="flex items-center group"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#215491]/30 mr-3 group-hover:bg-[#215491] transition-colors" />
                    <span className="text-gray-700 font-semibold group-hover:text-[#215491] transition-colors font-heading">
                      {child.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </main>
  );
};
