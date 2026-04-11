import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { StrapiEvent } from "@/types/payload";

export async function POST(request: NextRequest) {
  const body: StrapiEvent = (await request.json()) as StrapiEvent;

  if (body.event === "entry.publish" || body.event === "entry.unpublish") {
    revalidateTag("root_pages", "max");
    revalidateTag("pages", "max");
    revalidateTag("page_" + body.entry.fullSlug, "max");
  }

  return Response.json({ message: "OK" });
}
