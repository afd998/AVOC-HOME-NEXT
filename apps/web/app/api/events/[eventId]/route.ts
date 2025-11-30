import { NextResponse } from "next/server";
import { getEventById } from "@/lib/data/calendar/event/events";

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { eventId } = await context.params;

  try {
    const event = await getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("[API] Failed to load event", error);
    return NextResponse.json(
      { error: "Unable to load event" },
      { status: 500 }
    );
  }
}

