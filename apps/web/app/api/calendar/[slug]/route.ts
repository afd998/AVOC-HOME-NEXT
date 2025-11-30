import { NextResponse } from "next/server";
import { getCalendar } from "@/lib/data/calendar/calendar";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const filterParam = url.searchParams.get("filter");
  const autoHideParam = url.searchParams.get("autoHide");

  const filter =
    filterParam && filterParam.length > 0 ? filterParam : "All Rooms";
  const autoHide =
    autoHideParam === "true" ||
    autoHideParam === "1" ||
    autoHideParam === "yes";

  try {
    const calendar = await getCalendar(slug, filter, autoHide);
    return NextResponse.json({ calendar });
  } catch (error) {
    console.error("[API] Failed to load calendar", error);
    return NextResponse.json(
      { error: "Unable to load calendar" },
      { status: 500 }
    );
  }
}

