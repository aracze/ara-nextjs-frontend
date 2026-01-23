import Link from "next/link";
import Image from "next/image";
import { Page, GlobalHeader } from "@/types/strapi";

export async function MainMenu({ pages, header }: { pages: Page[], header?: GlobalHeader }) {
    const logo = header?.logo;

    return (
        <nav className="flex h-24 rounded-lg bg-white/80 backdrop-blur-sm relative gap-4 px-4 items-center">
            {/* LOGO */}
            {logo && (
                <div className="flex items-center mr-4">
                    {logo.Link ? (
                        <Link href={logo.Link.href} title={logo.Link.title} className="flex items-center">
                            {logo.svgCode ? (
                                <div
                                    className="h-12 w-auto flex items-center"
                                    dangerouslySetInnerHTML={{ __html: logo.svgCode }}
                                />
                            ) : logo.image && (
                                <Image
                                    src={new URL(logo.image.url, process.env.STRAPI_BASE_API_URL).toString()}
                                    alt={logo.image.alternativeText || logo.Link.title}
                                    width={120}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                />
                            )}
                        </Link>
                    ) : (
                        <div className="flex items-center">
                            {logo.svgCode ? (
                                <div
                                    className="h-12 w-auto flex items-center"
                                    dangerouslySetInnerHTML={{ __html: logo.svgCode }}
                                />
                            ) : logo.image && (
                                <Image
                                    src={new URL(logo.image.url, process.env.STRAPI_BASE_API_URL).toString()}
                                    alt={logo.image.alternativeText || "Logo"}
                                    width={120}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}


            {/* STRÁNKY (původní dlaždice) */}
            {pages?.map((page: Page) => (
                <div key={page.documentId} className="relative group h-full flex items-center">
                    <Link
                        href={page.slug}
                        className="block h-16 w-32 bg-cover bg-center rounded-md hover:scale-105 transition-transform"
                    >
                        <div className="flex h-full items-end p-2 bg-gradient-to-t from-black/50 to-transparent rounded-md">
                            <span className="text-white font-bold text-xs group-hover:text-sm transition-all truncate">
                                {page.title}
                            </span>
                        </div>
                    </Link>

                    {/* Subpages Menu Wrapper - ensures overlapping hit area to prevent collapse */}
                    {
                        page.children?.length > 0 &&
                        (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-8 pl-8 hidden group-hover:block z-20">
                                <div className="flex flex-col min-w-[200px] bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 overflow-visible ml-2">
                                    {page.children.map((child: any) => (
                                        <Link
                                            key={child.documentId}
                                            href={child.slug}
                                            className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-0"
                                        >
                                            {child.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>
            ))}

        </nav>
    );
}