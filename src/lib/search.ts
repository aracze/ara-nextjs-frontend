import Fuse from "fuse.js";
import searchData from "@/data/search_data.json";
import searchIndexData from "@/data/search_index.json";

let fuse: Fuse<any> | null = null;

/**
 * Returns a singleton instance of Fuse.js, initialized with search data and pre-generated index.
 * @param forceRefresh - If true, re-initializes the Fuse instance (useful after index regeneration).
 */
export function getFuse(forceRefresh: boolean = false): Fuse<any> {
    if (!fuse || forceRefresh) {
        const searchIndex = Fuse.parseIndex(searchIndexData as any);
        fuse = new Fuse(searchData, { keys: ["title", "text"] }, searchIndex);
    }
    return fuse;
}
