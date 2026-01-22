import Link from "next/link";

export function ResultList({ results, handleLinkClicked }: { results: any[], handleLinkClicked: () => void }) {
    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="max-h-[400px] overflow-y-auto">
                {results.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        Žádné výsledky pro hledání.
                    </div>
                ) : (
                    <div className="p-2">
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Výsledky</div>
                        {results.map((result: any, index: number) => (
                            <Link href={`/${result.item.slug}`} key={result.item.documentId || `result-${index}`}
                                onClick={() => handleLinkClicked()}>
                                <div
                                    className="flex flex-col items-start px-4 py-3 cursor-pointer hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 rounded-md"
                                >
                                    <div className="font-semibold text-blue-600 hover:text-blue-700">{result.item.title}</div>
                                    {result.item.text && (
                                        <div className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                            {result.item.text}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}