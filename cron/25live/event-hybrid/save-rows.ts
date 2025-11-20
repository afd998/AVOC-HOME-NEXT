import { db } from "../../../lib/db";
import { eventHybrid } from "../../../lib/db/schema";
import { type EventHybridRow, type EnrichedEvent } from "../../../lib/db/types";
import { inArray, sql } from "drizzle-orm";

export async function saveEventHybridRows(
  eventHybridRows: EventHybridRow[],
  enrichedEvents: EnrichedEvent[]
) {
  // Upsert hybrid rows (updates all fields since no user modifications)
  if (eventHybridRows.length > 0) {
    await db
      .insert(eventHybrid)
      .values(eventHybridRows)
      .onConflictDoUpdate({
        target: eventHybrid.event,
        set: {
          config: sql`excluded.config`,
          meetingId: sql`excluded.meeting_id`,
          meetingLink: sql`excluded.meeting_link`,
          instructions: sql`excluded.instructions`,
        },
      });
  }

  // Delete hybrid rows for events in scrape that don't have hybrid anymore
  const eventIds = enrichedEvents
    .map((e) => e.id)
    .filter((id): id is number => id !== null && id !== undefined);
  const hybridEventIds = eventHybridRows
    .map((r) => r.event)
    .filter((id): id is number => id !== null && id !== undefined);
  const eventsWithoutHybrid = eventIds.filter(
    (id) => !hybridEventIds.includes(id)
  );

  if (eventsWithoutHybrid.length > 0) {
    await db.delete(eventHybrid).where(inArray(eventHybrid.event, eventsWithoutHybrid));
  }
}