import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventAvConfig } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { eventId } = await params;
  const numericEventId = Number(eventId);
  
  if (!Number.isInteger(numericEventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: {
      leftSource?: string | null;
      rightSource?: string | null;
      centerSource?: string | null;
      leftDevice?: string | null;
      rightDevice?: string | null;
      centerDevice?: string | null;
    } = {};

    if ("leftSource" in body) updates.leftSource = body.leftSource || null;
    if ("rightSource" in body) updates.rightSource = body.rightSource || null;
    if ("centerSource" in body) updates.centerSource = body.centerSource || null;
    if ("leftDevice" in body) updates.leftDevice = body.leftDevice || null;
    if ("rightDevice" in body) updates.rightDevice = body.rightDevice || null;
    if ("centerDevice" in body) updates.centerDevice = body.centerDevice || null;

    await db
      .update(eventAvConfig)
      .set(updates)
      .where(eq(eventAvConfig.event, numericEventId));

    // Fetch updated config
    const updated = await db.query.eventAvConfig.findFirst({
      where: eq(eventAvConfig.event, numericEventId),
    });

    return NextResponse.json({ avConfig: updated });
  } catch (error) {
    console.error("[API] Failed to update event AV config", error);
    return NextResponse.json(
      { error: "Unable to update AV configuration" },
      { status: 500 }
    );
  }
}

