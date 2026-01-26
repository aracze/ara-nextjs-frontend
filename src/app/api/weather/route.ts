import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log("Update weather");
  return NextResponse.json({ message: "Weather updated successfully" });
}
