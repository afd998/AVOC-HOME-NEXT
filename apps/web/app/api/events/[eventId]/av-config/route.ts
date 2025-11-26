import { NextResponse } from "next/server";
import {
  eq,
  inArray,
  and,
  or,
  db,
  eventAvConfig,
  events,
  actions,
  qcItems,
  eventHybrid,
  eventOtherHardware,
  eventRecording,
  generateQcItemsForAction,
  type EnrichedEvent,
  type ActionRow,
  type EventAVConfigRow,
  type EventHybridRow,
  type EventOtherHardwareRow,
  type EventRecordingRow,
} from "shared";

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

    // Update the AV config
    await db
      .update(eventAvConfig)
      .set(updates)
      .where(eq(eventAvConfig.event, numericEventId));

    // Fetch the updated config
    const updatedAvConfig = await db.query.eventAvConfig.findFirst({
      where: eq(eventAvConfig.event, numericEventId),
    });

    if (!updatedAvConfig) {
      return NextResponse.json({ error: "AV config not found" }, { status: 404 });
    }

    // Regenerate QC items for incomplete actions
    await regenerateQcItemsForEvent(numericEventId, updatedAvConfig);

    return NextResponse.json({ avConfig: updatedAvConfig });
  } catch (error) {
    console.error("[API] Failed to update event AV config", error);
    return NextResponse.json(
      { error: "Unable to update AV configuration" },
      { status: 500 }
    );
  }
}

/**
 * Regenerate QC items for all incomplete actions of an event.
 * This is called after AV config updates to ensure QC items reflect the new config.
 */
async function regenerateQcItemsForEvent(
  eventId: number,
  avConfig: EventAVConfigRow
): Promise<void> {
  // Fetch the event
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    console.warn(`[QC Regen] Event ${eventId} not found`);
    return;
  }

  // Fetch all incomplete actions for this event
  const incompleteActions = await db
    .select()
    .from(actions)
    .where(
      and(
        eq(actions.event, eventId),
        // Actions are incomplete if status is "pending"
        eq(actions.status, "pending")
      )
    );

  if (incompleteActions.length === 0) {
    console.log(`[QC Regen] No incomplete actions for event ${eventId}`);
    return;
  }

  // Fetch related event data
  const [hybridRows, otherHardwareRows, recordingRows] = await Promise.all([
    db.select().from(eventHybrid).where(eq(eventHybrid.event, eventId)),
    db.select().from(eventOtherHardware).where(eq(eventOtherHardware.event, eventId)),
    db.select().from(eventRecording).where(eq(eventRecording.event, eventId)),
  ]);

  // Build enriched event
  const enrichedEvent: EnrichedEvent = {
    ...event,
    resources: Array.isArray(event.resources) ? event.resources as any : [],
    hybrid: hybridRows[0] as EventHybridRow | undefined,
    avConfig: avConfig,
    otherHardware: otherHardwareRows as EventOtherHardwareRow[],
    recording: recordingRows[0] as EventRecordingRow | undefined,
  };

  // Generate new QC items for each incomplete action
  const newQcItems = incompleteActions.flatMap((action) =>
    generateQcItemsForAction(action as ActionRow, enrichedEvent)
  );

  // Get action IDs for the incomplete actions
  const actionIds = incompleteActions
    .map((a) => a.id)
    .filter((id): id is number => id !== null && id !== undefined);

  if (actionIds.length === 0) {
    return;
  }

  // Delete existing QC items for these actions
  await db.delete(qcItems).where(inArray(qcItems.action, actionIds));

  // Insert new QC items
  if (newQcItems.length > 0) {
    await db.insert(qcItems).values(newQcItems);
  }

  console.log(
    `[QC Regen] Regenerated ${newQcItems.length} QC items for ${actionIds.length} actions on event ${eventId}`
  );
}
