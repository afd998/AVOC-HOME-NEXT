import { db } from "../../../lib/db";
import { facultyEvents as facultyEventsTable } from "../../../lib/db/schema";
import { type ProcessedEvent } from "../../../lib/db/types";
import { type FacultyEventRow } from "../../../lib/db/types";
import { inArray } from "drizzle-orm";

export async function saveFacultyEvents(
  facultyEventRows: FacultyEventRow[],
  processedEvents: ProcessedEvent[],
  date: string
) {
  const processedEventIds = processedEvents.map((event) => event.id);
  if (processedEventIds.length > 0) {
    await db
      .delete(facultyEventsTable)
      .where(inArray(facultyEventsTable.event, processedEventIds));
  }

  if (facultyEventRows.length > 0) {
    await db.insert(facultyEventsTable).values(facultyEventRows);
  }
}
