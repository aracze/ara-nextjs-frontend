"use client";

import { useState, useEffect, useRef } from "react";
import type { FuseResult } from "fuse.js";
import type { SearchItem } from "@/types/search";
import { X, Search as SearchIcon } from "lucide-react";
import { ResultList } from "./resultlist/resultlist";
import { createPortal } from "react-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsExpanded(false);
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 0) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.success) {
            setResults(data.message);
          }
        } catch (error) {
          console.error("Search fetch error:", error);
        }
      } else {
        setResults([]);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleEscapeKeyup = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClear();
      }
    };
    document.addEventListener("keyup", handleEscapeKeyup);
    return () => {
      document.removeEventListener("keyup", handleEscapeKeyup);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center">
      {/* Search Icon Button (Initial State) */}
      <button
        onClick={() => setIsExpanded(true)}
        className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        aria-label="Otevřít vyhledávání"
      >
        <SearchIcon className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Full-width Search Overlay */}
      {isExpanded &&
        createPortal(
          <div className="fixed inset-0 z-[100] animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => handleClear()}
            />

            {/* Search Bar container */}
            <div className="relative bg-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 flex items-center gap-4">
                <SearchIcon
                  className="w-6 h-6 text-gray-400 shrink-0"
                  strokeWidth={2.5}
                />

                <input
                  ref={inputRef}
                  placeholder="Hledat..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xl font-normal text-gray-800 placeholder:text-gray-400 py-1"
                />

                <div className="hidden md:flex items-center gap-4 border-l border-gray-100 pl-6">
                  <button
                    onClick={() => {}} // Could trigger search index page
                    className="text-xs font-bold text-gray-400 hover:text-[#215491] transition-colors uppercase tracking-widest"
                  >
                    Hledat vše
                  </button>

                  <button
                    onClick={() => handleClear()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    aria-label="Close search"
                  >
                    <X className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Mobile Close */}
                <button
                  onClick={() => handleClear()}
                  className="md:hidden p-2 text-gray-400"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>

              {/* Results Area */}
              {(query.length > 0 || results.length > 0) && (
                <div className="max-w-7xl mx-auto px-4 md:px-12 pb-8">
                  <ResultList
                    results={results}
                    handleLinkClicked={handleClear}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
