import { NextResponse } from "next/server";
import { getVenueCalendarRow } from "@/lib/data/calendar/calendar";

type RouteContext = {
  params: Promise<{
    venueId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { venueId } = await context.params;
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const filterParam = url.searchParams.get("filter");
  const autoHideParam = url.searchParams.get("autoHide");

  const filter = filterParam && filterParam.length > 0 ? filterParam : "All Rooms";
  const autoHide =
    autoHideParam === "true" ||
    autoHideParam === "1" ||
    autoHideParam === "yes";

  try {
    const row = await getVenueCalendarRow(date, venueId, filter, autoHide);
    return NextResponse.json({ row });
  } catch (error) {
    console.error("[API] Failed to load venue calendar row", {
      venueId,
      date,
      filter,
      autoHide,
      error,
    });
    return NextResponse.json(
      { error: "Unable to load venue calendar row" },
      { status: 500 }
    );
  }
}
