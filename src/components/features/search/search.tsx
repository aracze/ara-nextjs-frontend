"use client";

import { useState, useEffect, useRef } from "react";
import type { FuseResult } from "fuse.js";
import type { SearchItem } from "@/types/search";
import { X, Search as SearchIcon } from "lucide-react";
import { ResultList } from "./resultlist/resultlist";
import { createPortal } from "react-dom";

interface SearchProps {
  variant?: "header" | "homepage";
}

export default function Search({ variant = "header" }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Focus management for portal
  useEffect(() => {
    if (isExpanded && variant === "header" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded, variant]);

  // Scroll lock for header portal
  useEffect(() => {
    if (isExpanded && variant === "header") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded, variant]);

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

  // Click outside to close (especially for homepage results)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    if (isExpanded && variant === "homepage") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, variant]);

  if (!mounted) return null;

  // HOMEPAGE VARIANT: Inline search with dropdown
  if (variant === "homepage") {
    return (
      <div ref={containerRef} className="w-full max-w-2xl relative">
        <div className="bg-white rounded-lg shadow-2xl flex items-center p-1 md:p-2 group/home-search border-2 border-transparent focus-within:border-[#215491]/20 transition-all">
          <div className="flex-1 px-4 flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              placeholder="Pojďme objevovat..."
              value={query}
              autoFocus={false}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              className="w-full bg-transparent border-none outline-none text-gray-800 font-medium py-2 placeholder:text-gray-400"
            />
            {query.length > 0 && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-[#215491] text-white px-6 md:px-10 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#1a4579] transition-colors shrink-0"
          >
            Hledat
          </button>
        </div>

        {/* Inline results for homepage */}
        {isExpanded && query.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-h-[400px] overflow-y-auto p-4">
              <ResultList
                results={results}
                handleLinkClicked={() => setIsExpanded(false)}
              />
              {results.length === 0 && query.length > 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Žádné výsledky pro "{query}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // HEADER VARIANT: Portal overlay (as before)
  return (
    <div className="flex items-center">
      <button
        onClick={() => setIsExpanded(true)}
        className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        aria-label="Otevřít vyhledávání"
      >
        <SearchIcon className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {isExpanded &&
        createPortal(
          <div className="fixed inset-0 z-[300] animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => handleClear()}
            />
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
                    onClick={() => {}}
                    className="text-xs font-bold text-gray-400 hover:text-[#215491] transition-colors uppercase tracking-widest"
                  >
                    Hledat vše
                  </button>
                  <button
                    onClick={() => handleClear()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                </div>
                <button
                  onClick={() => handleClear()}
                  className="md:hidden p-2 text-gray-400"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
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
