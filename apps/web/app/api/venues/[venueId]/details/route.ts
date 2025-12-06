import { NextResponse } from "next/server";
import { getVenueById } from "@/lib/data/venues";

type RouteContext = {
  params: Promise<{
    venueId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { venueId } = await context.params;

  try {
    const venue = await getVenueById(venueId);

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ venue });
  } catch (error) {
    console.error("[API] Failed to load venue details", { venueId, error });
    return NextResponse.json(
      { error: "Unable to load venue details" },
      { status: 500 }
    );
  }
}
