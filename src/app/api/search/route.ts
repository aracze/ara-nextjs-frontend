import { NextRequest, NextResponse } from "next/server";
import { getFuse } from "@/lib/search";

export function GET(request: NextRequest): NextResponse {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams(searchParams);

    const results = getFuse().search(params.get("q") || "");

    return NextResponse.json({
        success: true,
        message: results,
    });
}
