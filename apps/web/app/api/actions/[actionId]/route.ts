import { NextResponse } from "next/server";
import { getActionById } from "@/lib/data/actions/action";
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

