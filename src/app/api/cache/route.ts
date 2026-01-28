import { NextRequest } from "next/server";
import redis from "@/lib/redis";
import { StrapiEvent } from "@/types/strapi";

export async function POST(request: NextRequest) {
  const body: StrapiEvent = (await request.json()) as StrapiEvent;

  if (body.event === "entry.publish" || body.event === "entry.unpublish") {
    await redis.del("root_pages");
    await redis.del(body.entry.fullSlug);
  }

  return Response.json({ message: "OK" });
}
