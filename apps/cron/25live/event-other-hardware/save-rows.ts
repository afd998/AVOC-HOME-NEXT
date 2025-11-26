import { inArray, sql, eq, and, or } from "drizzle-orm";
import {
  db,
  eventOtherHardware,
  type EventOtherHardwareRow,
  type EnrichedEvent,
} from "shared";

export async function saveEventOtherHardwareRows(
  eventOtherHardwareRows: EventOtherHardwareRow[],
  enrichedEvents: EnrichedEvent[]
) {
  // Upsert other hardware rows based on composite key (event, otherHardwareDict)
  if (eventOtherHardwareRows.length > 0) {
    await db
      .insert(eventOtherHardware)
      .values(eventOtherHardwareRows)
      .onConflictDoUpdate({
        target: [eventOtherHardware.event, eventOtherHardware.otherHardwareDict],
        set: {
          quantity: sql`excluded.quantity`,
          instructions: sql`excluded.instructions`,
        },
      });
  }

  // Delete orphaned other hardware rows for events in this scrape
  const eventIds = [
    ...new Set(
      enrichedEvents
        .map((e) => e.id)
        .filter((id): id is number => id !== null && id !== undefined)
    ),
  ];

  if (eventIds.length === 0) {
    return;
  }

  // Get valid (event, otherHardwareDict) combinations
  const validCombos = eventOtherHardwareRows.map((r) => ({
    event: r.event,
    dict: r.otherHardwareDict,
  }));

  // Fetch existing other hardware for these events
  const existing = await db
    .select()
    .from(eventOtherHardware)
    .where(inArray(eventOtherHardware.event, eventIds));

  // Find items to delete (exists in DB but not in scrape)
  const toDelete = existing.filter(
    (e) => !validCombos.some((v) => v.event === e.event && v.dict === e.otherHardwareDict)
  );

  // Delete orphaned items
  if (toDelete.length > 0) {
    await db.delete(eventOtherHardware).where(
      or(
        ...toDelete.map((item) =>
          and(
            eq(eventOtherHardware.event, item.event),
            eq(eventOtherHardware.otherHardwareDict, item.otherHardwareDict)
          )
        )
      )
    );
  }
}
