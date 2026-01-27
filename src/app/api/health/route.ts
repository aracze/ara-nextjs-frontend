import { NextResponse } from "next/server";
import { getStrapiURL } from "@/lib/utils";

export async function GET(): Promise<NextResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${getStrapiURL()}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return new NextResponse(null, { status: 503 });
    }

    const json = await res.json();

    // GraphQL returns 200 even for some errors, check the body
    if (json.errors) {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
