import { NextRequest, NextResponse } from "next/server";
import { generateSearchIndex } from "@/scripts/generate-search-index";

export async function POST(request: NextRequest) {
    // Extract search params
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    console.log("Search Index Triggered - Request Params:", params);

    // Extract and log headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log("Search Index Triggered - Request Headers:", headers);

    // Extract and log body
    let body = {};
    try {
        body = await request.json();
        console.log("Search Index Triggered - Request Body:", body);
    } catch (e) {
        console.log("Search Index Triggered - Request Body: (empty or invalid JSON)");
    }

    try {
        // Call the generation method
        await generateSearchIndex();

        return NextResponse.json({
            success: true,
            message: "Search index generated successfully",
            requestedParams: params,
            requestedBody: body
        });
    } catch (error) {
        console.error("Error in /api/search-index:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate search index",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
