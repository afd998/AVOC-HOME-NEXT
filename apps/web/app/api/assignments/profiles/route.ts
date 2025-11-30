import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/data/assignments";

export async function GET() {
  try {
    const profiles = await getProfiles();
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("[api] GET /api/assignments/profiles", { error });
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

