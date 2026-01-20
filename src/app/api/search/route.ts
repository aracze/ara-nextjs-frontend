import Fuse, { FuseResult } from "fuse.js";
import searchData from "@/data/search_data.json";
import searchIndexData from "@/data/search_index.json";
import { NextRequest, NextResponse } from "next/server";

let fuse: Fuse<any>;

function getFuse() {
    const searchIndex = Fuse.parseIndex(searchIndexData as any);
    if (!fuse) {
        fuse = new Fuse(searchData, { keys: ["title", "text"] }, searchIndex)
    }
    return fuse;
}

export function GET(request: NextRequest): NextResponse {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams(searchParams);

    const results = getFuse().search(params.get("q") || "");

    return NextResponse.json({
        success: true,
        message: results,
    });
}
