import { NextResponse } from "next/server";
import { getTaskById } from "@/lib/data/tasks/task";
import { addDisplayColumns } from "@/lib/data/calendar/taskscalendar";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;
  const numericTaskId = Number(taskId);
  if (!Number.isInteger(numericTaskId)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const task = await getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ task: null });
    }

    const [hydratedTask] = addDisplayColumns([task]);
    return NextResponse.json({ task: hydratedTask });
  } catch (error) {
    console.error("[API] Failed to fetch task details", error);
    return NextResponse.json(
      { error: "Unable to load task details" },
      { status: 500 }
    );
  }
}
