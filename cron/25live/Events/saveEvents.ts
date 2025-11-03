import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../lib/db";
import { events } from "../../../lib/db/schema";
import { type ProcessedEvent } from "../scrape";

export async function saveEvents(
  processedEvents: ProcessedEvent[],
  scrapeDate: string
): Promise<void> {
  console.log(`\n📅 Saving events for date: ${scrapeDate}`);
  console.log(`📊 Processing ${processedEvents.length} events`);

  // Get all existing events for the specified date
  const existingEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.date, scrapeDate));

  console.log(`🗃️  Found ${existingEvents.length} existing events in database`);

  // Create a set of current event IDs for efficient lookup
  const currentEventIds = new Set(
    processedEvents
      .map((event) => event.id)
      .filter((id): id is number => typeof id === "number")
  );

  // Find events that exist in the database but not in the current scrape (deleted events)
  const deletedEventIds = existingEvents
    .map(({ id }) => id)
    .filter((id): id is number => !currentEventIds.has(id));

  console.log(`🗑️  Found ${deletedEventIds.length} events to delete`);

  // Remove deleted events; cascading FK cleanup removes faculty assignments
  if (deletedEventIds.length > 0) {
    console.log(`🧹 Deleting ${deletedEventIds.length} obsolete events...`);

    // Then delete the events themselves
    await db.delete(events).where(inArray(events.id, deletedEventIds));
    console.log(`✅ Deleted ${deletedEventIds.length} obsolete events`);
  }

  // If no events to save, exit early
  if (processedEvents.length === 0) {
    console.log(`⚠️  No events to save, exiting early`);
    return;
  }

  // Insert new events or update existing ones (upsert operation)
  console.log(`💾 Upserting ${processedEvents.length} events...`);
  await db
    .insert(events)
    .values(processedEvents)
    .onConflictDoUpdate({
      target: events.id, // Conflict resolution based on event ID
      set: {
        // Update all fields with new values from the scrape
        date: sql`excluded.date`,
        eventType: sql`excluded.event_type`,
        lectureTitle: sql`excluded.lecture_title`,
        roomName: sql`excluded.room_name`,
        resources: sql`excluded.resources`,
        itemId: sql`excluded.item_id`,
        itemId2: sql`excluded.item_id2`,
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        raw: sql`excluded.raw`,
        eventName: sql`excluded.event_name`,
        updatedAt: sql`excluded.updated_at`,
        organization: sql`excluded.organization`,
        instructorNames: sql`excluded.instructor_names`,
      },
    });
  console.log(`✅ Successfully upserted events`);
  console.log(`🎉 Save events completed for ${scrapeDate}\n`);
}
