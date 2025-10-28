import { NextResponse } from "next/server";
import { getTasksCalendar } from "@/lib/data/calendar/taskscalendar";

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = context.params;
  const url = new URL(request.url);
  const filterParam = url.searchParams.get("filter");
  const autoHideParam = url.searchParams.get("autoHide");

  const filter = filterParam && filterParam.length > 0 ? filterParam : "All Rooms";
  const autoHide =
    autoHideParam === "true" ||
    autoHideParam === "1" ||
    autoHideParam === "yes";

  try {
    const taskGroups = await getTasksCalendar(slug, filter, autoHide);
    return NextResponse.json({ taskGroups });
  } catch (error) {
    console.error("[API] Failed to load tasks calendar", error);
    return NextResponse.json(
      { error: "Unable to load calendar tasks" },
      { status: 500 }
    );
  }
}
