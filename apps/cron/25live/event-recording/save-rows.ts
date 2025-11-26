import { inArray, sql } from "drizzle-orm";
import {
  db,
  eventRecording,
  type EventRecordingRow,
  type EnrichedEvent,
} from "shared";

export async function saveEventRecordingRows(
  eventRecordingRows: EventRecordingRow[],
  enrichedEvents: EnrichedEvent[]
) {
  // Upsert recording rows (updates all fields since no user modifications)
  if (eventRecordingRows.length > 0) {
    await db
      .insert(eventRecording)
      .values(eventRecordingRows)
      .onConflictDoUpdate({
        target: eventRecording.event,
        set: {
          instructions: sql`excluded.instructions`,
          type: sql`excluded.type`,
        },
      });
  }

  // Delete recording rows for events in scrape that don't have recording anymore
  const eventIds = enrichedEvents
    .map((e) => e.id)
    .filter((id): id is number => id !== null && id !== undefined);
  const recordingEventIds = eventRecordingRows
    .map((r) => r.event)
    .filter((id): id is number => id !== null && id !== undefined);
  const eventsWithoutRecording = eventIds.filter(
    (id) => !recordingEventIds.includes(id)
  );

  if (eventsWithoutRecording.length > 0) {
    await db
      .delete(eventRecording)
      .where(inArray(eventRecording.event, eventsWithoutRecording));
  }
}