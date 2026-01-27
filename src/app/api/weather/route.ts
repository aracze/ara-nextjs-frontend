import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const premiumKey = process.env.OPENWEATHER_API_KEY;
    if (!premiumKey) {
      console.error(
        "OPENWEATHER_API_KEY is not defined in environment variables",
      );
      return NextResponse.json(
        { error: "OpenWeather API configuration missing" },
        { status: 500 },
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${premiumKey}&units=metric&exclude=minutely,alerts`;

    const response = await fetch(url);
    const weatherJson = await response.json();

    if (!response.ok) {
      return NextResponse.json(weatherJson, { status: response.status });
    }

    return NextResponse.json(weatherJson);
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather forecast" },
      { status: 500 },
    );
  }
}
