import { NextRequest, NextResponse } from "next/server";
import { generateSearchIndex } from "@/scripts/generate-search-index";
import { getFuse } from "@/lib/search";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    await generateSearchIndex();
    getFuse(true);

    return NextResponse.json({
      success: true,
      message: "Search index generated successfully",
      requestedParams: params,
    });
  } catch (error) {
    console.error("Error in /api/search-index:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate search index",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
