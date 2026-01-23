"use client";

import { useState, useEffect, useRef } from "react";
import type { FuseResult } from "fuse.js";
import type { SearchItem } from "@/types/search";
import { Command, CommandInput } from "@/components/ui/command";
import { X } from "lucide-react";
import { ResultList } from "./resultlist/resultlist";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKeyup = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClear();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keyup", handleEscapeKeyup);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keyup", handleEscapeKeyup);
    };
  }, []);

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
        <ResultList results={results} handleLinkClicked={handleClear} />
      )}
    </div>
  );
}
