import { inArray } from "drizzle-orm";
import {
  db,
  facultyEvents as facultyEventsTable,
  type ProcessedEvent,
  type FacultyEventRow,
} from "shared";

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
