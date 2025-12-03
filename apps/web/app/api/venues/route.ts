import { NextResponse } from "next/server";
import { getVenues } from "@/lib/data/venues";

export async function GET() {
  try {
    const venues = await getVenues();
    return NextResponse.json({ venues });
  } catch (error) {
    console.error("[API] Failed to load venues", error);
    return NextResponse.json(
      { error: "Unable to load venues" },
      { status: 500 }
    );
  }
}
