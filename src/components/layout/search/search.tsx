"use client";

import { useState, useEffect, useRef } from "react";
import {
    Command,
    CommandInput,
} from "@/components/ui/command";
import { X } from "lucide-react";
import Link from "next/link";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length > 0) {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data.success) {
                        setResults(data.message);
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error("Search fetch error:", error);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative max-w-sm w-full z-50">
            <Command
                className="relative h-auto rounded-lg border shadow-sm bg-white overflow-visible"
                shouldFilter={false}
            >
                <div className="relative flex items-center px-1">
                    <CommandInput
                        placeholder="Search..."
                        value={query}
                        onValueChange={(v) => setQuery(v)}
                        onFocus={() => query.length > 0 && setIsOpen(true)}
                        className="flex-1 border-none focus-visible:ring-0"
                    />
                    {query.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 flex items-center justify-center bg-white"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>
            </Command>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white rounded-lg border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="max-h-[400px] overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No results found for "<span className="font-medium">{query}</span>".
                            </div>
                        ) : (
                            <div className="p-2">
                                <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Results</div>
                                {results.map((result: any, index: number) => (
                                    <Link href={`/${result.item.slug}`} key={result.item.documentId || `result-${index}`}>
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
            )}
        </div>
    );
}