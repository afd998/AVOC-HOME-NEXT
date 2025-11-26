import { inArray } from "drizzle-orm";
import {
  db,
  resourceEvents as resourceEventsTable,
  type ProcessedEvent,
  type ResourceEventRow,
} from "shared";

export async function saveResourceEvents(
  resourceEventsRows: ResourceEventRow[],
  processedEvents: ProcessedEvent[],
  date: string
) {
  // STEP 10: Delete existing resource-event relationships for these events
  // This ensures we have a clean slate before inserting the new relationships
  // (handles cases where resources were removed from events)
  const processedEventIds = processedEvents.map((event) => event.id);
  if (processedEventIds.length > 0) {
    await db
      .delete(resourceEventsTable)
      .where(inArray(resourceEventsTable.eventId, processedEventIds));
  }

  // STEP 11: Insert the new resource-event relationships
  if (resourceEventsRows.length > 0) {
    await db.insert(resourceEventsTable).values(resourceEventsRows);
  }
}
