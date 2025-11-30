import { NextResponse } from "next/server";
import { getActionsCalendar } from "@/lib/data/calendar/actionsCalendar";

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

  const filter = filterParam && filterParam.length > 0 ? filterParam : "All Rooms";
  const autoHide =
    autoHideParam === "true" ||
    autoHideParam === "1" ||
    autoHideParam === "yes";

  try {
    const actionGroups = await getActionsCalendar(slug, filter, autoHide);
    return NextResponse.json({ actionGroups });
  } catch (error) {
    console.error("[API] Failed to load actions calendar", error);
    return NextResponse.json(
      { error: "Unable to load calendar actions" },
      { status: 500 }
    );
  }
}

