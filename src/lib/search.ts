import Fuse from "fuse.js";
import searchData from "@/data/search_data.json";
import searchIndexData from "@/data/search_index.json";
import type { SearchItem } from "@/types/search";

let fuse: Fuse<SearchItem> | null = null;

/**
 * Returns a singleton instance of Fuse.js, initialized with search data and pre-generated index.
 * @param forceRefresh - If true, re-initializes the Fuse instance (useful after index regeneration).
 */
export function getFuse(forceRefresh: boolean = false): Fuse<SearchItem> {
  if (!fuse || forceRefresh) {
    // Data se načítají ze JSON souborů generovaných při buildu (viz
    // scripts/generate-search-index.ts). Jejich tvar je dynamický, proto
    // přetypováváme na typy, které Fuse.js očekává.
    const searchIndex = Fuse.parseIndex<SearchItem>(
      searchIndexData as unknown as Parameters<typeof Fuse.parseIndex>[0],
    );
    fuse = new Fuse<SearchItem>(
      searchData as unknown as SearchItem[],
      { keys: ["title", "text"] },
      searchIndex,
    );
  }
  return fuse;
}
