import { NextRequest } from "next/server";
import { delCache } from "@/lib/redis";
import { StrapiEvent } from "@/types/payload";

export async function POST(request: NextRequest) {
  const body: StrapiEvent = (await request.json()) as StrapiEvent;

  if (body.event === "entry.publish" || body.event === "entry.unpublish") {
    await delCache("root_pages");
    await delCache(body.entry.fullSlug);
  }

  return Response.json({ message: "OK" });
}
