"use server";

import {
  eq,
  inArray,
  and,
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
import { revalidatePath } from "next/cache";

export type EventConfigurationUpdates = {
  avConfig?: {
    leftSource?: string | null;
    rightSource?: string | null;
    centerSource?: string | null;
    leftDevice?: string | null;
    rightDevice?: string | null;
    centerDevice?: string | null;
  };
  hybrid?: {
    config?: string | null;
    meetingId?: number | null;
    meetingLink?: string | null;
    instructions?: string | null;
  };
  recording?: {
    type?: string | null;
    instructions?: string | null;
  };
};

export type UpdateEventConfigurationResult = {
  success: boolean;
  error?: string;
};

export async function updateEventConfiguration(
  eventId: number,
  updates: EventConfigurationUpdates
): Promise<UpdateEventConfigurationResult> {
  if (!Number.isInteger(eventId)) {
    return { success: false, error: "Invalid event id" };
  }

  try {
    let updatedAvConfig: EventAVConfigRow | undefined;
    let hybridWasUpdated = false;

    // Handle AV Config updates
    if (updates.avConfig) {
      const avUpdates: {
        leftSource?: string | null;
        rightSource?: string | null;
        centerSource?: string | null;
        leftDevice?: string | null;
        rightDevice?: string | null;
        centerDevice?: string | null;
      } = {};

      if ("leftSource" in updates.avConfig) avUpdates.leftSource = updates.avConfig.leftSource ?? null;
      if ("rightSource" in updates.avConfig) avUpdates.rightSource = updates.avConfig.rightSource ?? null;
      if ("centerSource" in updates.avConfig) avUpdates.centerSource = updates.avConfig.centerSource ?? null;
      if ("leftDevice" in updates.avConfig) avUpdates.leftDevice = updates.avConfig.leftDevice ?? null;
      if ("rightDevice" in updates.avConfig) avUpdates.rightDevice = updates.avConfig.rightDevice ?? null;
      if ("centerDevice" in updates.avConfig) avUpdates.centerDevice = updates.avConfig.centerDevice ?? null;

      if (Object.keys(avUpdates).length > 0) {
        await db
          .update(eventAvConfig)
          .set(avUpdates)
          .where(eq(eventAvConfig.event, eventId));

        // Fetch the updated config for QC regeneration
        updatedAvConfig = await db.query.eventAvConfig.findFirst({
          where: eq(eventAvConfig.event, eventId),
        });
      }
    }

    // Handle Hybrid updates
    if (updates.hybrid) {
      const hybridUpdates: {
        config?: string | null;
        meetingId?: number | null;
        meetingLink?: string | null;
        instructions?: string | null;
      } = {};

      if ("config" in updates.hybrid) hybridUpdates.config = updates.hybrid.config ?? null;
      if ("meetingId" in updates.hybrid) hybridUpdates.meetingId = updates.hybrid.meetingId ?? null;
      if ("meetingLink" in updates.hybrid) hybridUpdates.meetingLink = updates.hybrid.meetingLink ?? null;
      if ("instructions" in updates.hybrid) hybridUpdates.instructions = updates.hybrid.instructions ?? null;

      if (Object.keys(hybridUpdates).length > 0) {
        // Check if this is a "turn off" action (config set to null with no other values)
        const isDeleteAction = hybridUpdates.config === null && 
          !("meetingId" in updates.hybrid && updates.hybrid.meetingId) &&
          !("meetingLink" in updates.hybrid && updates.hybrid.meetingLink) &&
          !("instructions" in updates.hybrid && updates.hybrid.instructions);

        // Check if hybrid config exists
        const existingHybrid = await db.query.eventHybrid.findFirst({
          where: eq(eventHybrid.event, eventId),
        });

        if (isDeleteAction && existingHybrid) {
          // Delete the hybrid record to turn off hybrid
          await db
            .delete(eventHybrid)
            .where(eq(eventHybrid.event, eventId));
          hybridWasUpdated = true;
        } else if (existingHybrid) {
          await db
            .update(eventHybrid)
            .set(hybridUpdates)
            .where(eq(eventHybrid.event, eventId));
          hybridWasUpdated = true;
        } else if (!isDeleteAction) {
          await db.insert(eventHybrid).values({
            event: eventId,
            ...hybridUpdates,
          });
          hybridWasUpdated = true;
        }
      }
    }

    // Handle Recording updates
    if (updates.recording) {
      const recordingUpdates: {
        type?: string | null;
        instructions?: string | null;
      } = {};

      if ("type" in updates.recording) recordingUpdates.type = updates.recording.type ?? null;
      if ("instructions" in updates.recording) recordingUpdates.instructions = updates.recording.instructions ?? null;

      if (Object.keys(recordingUpdates).length > 0) {
        // Check if recording config exists
        const existingRecording = await db.query.eventRecording.findFirst({
          where: eq(eventRecording.event, eventId),
        });

        if (existingRecording) {
          await db
            .update(eventRecording)
            .set(recordingUpdates)
            .where(eq(eventRecording.event, eventId));
        } else {
          await db.insert(eventRecording).values({
            event: eventId,
            ...recordingUpdates,
          });
        }
      }
    }

    // Regenerate QC items if AV config or hybrid was updated
    // (hybrid affects Staff Assistance QC items)
    if (updatedAvConfig || hybridWasUpdated) {
      // Fetch AV config if we don't have it yet (hybrid-only update)
      const avConfigForRegen = updatedAvConfig ?? await db.query.eventAvConfig.findFirst({
        where: eq(eventAvConfig.event, eventId),
      });
      
      if (avConfigForRegen) {
        await regenerateQcItemsForEvent(eventId, avConfigForRegen);
      }
    }

    // Revalidate the page to refresh data
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[updateEventConfiguration] Failed to update event configuration", error);
    return { success: false, error: "Unable to update event configuration" };
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
  const newQcItems = incompleteActions.flatMap((action) => {
    const items = generateQcItemsForAction(action as ActionRow, enrichedEvent);
    
    // Log debug info if no items were generated
    if (items.length === 0) {
      console.log(`[QC Regen] No QC items generated for action ${action.id}:`, {
        actionType: action.type,
        actionSubType: action.subType,
        eventId: eventId,
        hasAVConfig: !!enrichedEvent.avConfig,
        avConfig: enrichedEvent.avConfig ? {
          leftSource: enrichedEvent.avConfig.leftSource,
          rightSource: enrichedEvent.avConfig.rightSource,
          centerSource: enrichedEvent.avConfig.centerSource,
          lapels: enrichedEvent.avConfig.lapels,
          handhelds: enrichedEvent.avConfig.handhelds,
        } : null,
        transform: enrichedEvent.transform,
        firstLecture: enrichedEvent.firstLecture,
        hasHybrid: !!enrichedEvent.hybrid,
        otherHardwareCount: enrichedEvent.otherHardware?.length ?? 0,
        otherHardware: enrichedEvent.otherHardware?.map(hw => hw.otherHardwareDict) ?? [],
      });
    }
    
    return items;
  });

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

