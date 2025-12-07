import { db, events as eventsTable, eventRecording, eventHybrid, eq, inArray } from "shared";

export type DailyEventCounts = {
  events: number;
  eventRecordings: number;
  eventHybrids: number;
};

export async function getDailyEventCounts(date: string): Promise<DailyEventCounts> {
  // Fetch events for the given date first, then count related records.
  const eventsForDate = await db
    .select({ id: eventsTable.id })
    .from(eventsTable)
    .where(eq(eventsTable.date, date));

  const eventIds = eventsForDate
    .map((row) => row.id)
    .filter((id): id is number => id !== null && id !== undefined);

  let recordings = 0;
  let hybrids = 0;

  if (eventIds.length > 0) {
    const [recordingRows, hybridRows] = await Promise.all([
      db.select({ event: eventRecording.event }).from(eventRecording).where(inArray(eventRecording.event, eventIds)),
      db.select({ event: eventHybrid.event }).from(eventHybrid).where(inArray(eventHybrid.event, eventIds)),
    ]);

    recordings = recordingRows.length;
    hybrids = hybridRows.length;
  }

  return {
    events: eventIds.length,
    eventRecordings: recordings,
    eventHybrids: hybrids,
  };
}
