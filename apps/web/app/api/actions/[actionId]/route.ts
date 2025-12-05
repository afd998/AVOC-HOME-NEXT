import { NextResponse } from "next/server";
import { getActionById } from "@/lib/data/actions/action";
import { updateActionManualAssignee } from "@/lib/data/actions/updateActionManualAssignee";
import { addDisplayColumns } from "@/lib/data/calendar/actionUtils";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

type RouteContext = {
  params: Promise<{
    actionId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { actionId } = await context.params;

  try {
    const action = await getActionById(actionId);
    
    if (!action) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }

    // Hydrate the action with display columns
    const hydratedAction = addDisplayColumns([action])[0] as HydratedAction;

    return NextResponse.json({ action: hydratedAction });
  } catch (error) {
    console.error("[API] Failed to load action", error);
    return NextResponse.json(
      { error: "Unable to load action" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { actionId } = await context.params;

  const numericActionId = Number(actionId);
  if (!Number.isInteger(numericActionId) || numericActionId <= 0) {
    return NextResponse.json(
      { error: "Invalid action id" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[API] Invalid JSON payload for action update", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Object.prototype.hasOwnProperty.call(body, "assignedToManual")
  ) {
    return NextResponse.json(
      { error: "assignedToManual is required" },
      { status: 400 }
    );
  }

  const manualValue = (body as { assignedToManual: unknown }).assignedToManual;
  if (manualValue !== null && typeof manualValue !== "string") {
    return NextResponse.json(
      { error: "assignedToManual must be a string or null" },
      { status: 400 }
    );
  }

  const profileId =
    typeof manualValue === "string" && manualValue.trim().length > 0
      ? manualValue.trim()
      : null;

  try {
    const updatedAction = await updateActionManualAssignee({
      actionId: numericActionId,
      profileId,
    });

    if (!updatedAction) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }

    const hydratedAction = addDisplayColumns([updatedAction])[0] as HydratedAction;

    return NextResponse.json({ action: hydratedAction });
  } catch (error) {
    console.error("[API] Failed to update action assignee", error);
    return NextResponse.json(
      { error: "Unable to update assignee" },
      { status: 500 }
    );
  }
}

