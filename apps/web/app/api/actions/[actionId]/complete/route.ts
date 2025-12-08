import { NextResponse } from "next/server";
import { addDisplayColumns, type HydratedAction } from "@/lib/data/calendar/actionUtils";
import { markActionCompleted } from "@/lib/data/actions/markActionCompleted";

type RouteContext = {
  params: Promise<{
    actionId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { actionId } = await context.params;

  const numericActionId = Number(actionId);
  if (!Number.isInteger(numericActionId) || numericActionId <= 0) {
    return NextResponse.json({ error: "Invalid action id" }, { status: 400 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[API] Invalid JSON payload for action completion", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const completedBy =
    typeof body === "object" && body !== null && "completedBy" in body
      ? (body as { completedBy?: unknown }).completedBy
      : undefined;

  if (typeof completedBy !== "string" || completedBy.trim().length === 0) {
    return NextResponse.json(
      { error: "completedBy is required" },
      { status: 400 }
    );
  }

  const completedTime =
    typeof body === "object" &&
    body !== null &&
    "completedTime" in body &&
    typeof (body as { completedTime?: unknown }).completedTime === "string"
      ? (body as { completedTime: string }).completedTime
      : undefined;

  try {
    const action = await markActionCompleted({
      actionId: numericActionId,
      completedBy: completedBy.trim(),
      completedTime,
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    const hydratedAction = addDisplayColumns([action])[0] as HydratedAction;

    return NextResponse.json({ action: hydratedAction });
  } catch (error) {
    console.error("[API] Failed to mark action as completed", error);
    return NextResponse.json(
      { error: "Unable to mark action as completed" },
      { status: 500 }
    );
  }
}
