import { db } from "../../../lib/db";
import { facultyEvents as facultyEventsTable } from "../../../lib/db/schema";
import { type ProcessedEvent } from "../scrape";
import { type FacultyEventRow } from "../scrape";
import { inArray } from "drizzle-orm";

export async function saveFacultyEvents(
  facultyEventRows: FacultyEventRow[],
  processedEvents: ProcessedEvent[],
  date: string
) {
  const processedEventIds = processedEvents.map((event) => event.id);
  if (processedEventIds.length > 0) {
    console.log(`🧹 Cleaning up existing faculty-event relationships...`);
    await db
      .delete(facultyEventsTable)
      .where(inArray(facultyEventsTable.event, processedEventIds));
    console.log(`🗑️  Deleted existing faculty-event relationships`);
  }

  if (facultyEventRows.length > 0) {
    console.log(
      `👥 Inserting ${facultyEventRows.length} faculty-event relationships...`
    );
    await db.insert(facultyEventsTable).values(facultyEventRows);
    console.log(`✅ Successfully inserted faculty-event relationships`);
  }
}
