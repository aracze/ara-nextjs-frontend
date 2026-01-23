import Fuse from "fuse.js";
import type { FuseIndexRecords } from "fuse.js";
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
    const searchIndex = Fuse.parseIndex<SearchItem>(
      searchIndexData as unknown as {
        keys: readonly string[];
        records: FuseIndexRecords;
      },
    );
    fuse = new Fuse<SearchItem>(
      searchData,
      { keys: ["title", "text"] },
      searchIndex,
    );
  }
  return fuse;
}
