import { db, events as eventsTable, eventRecording, eventHybrid, eq, inArray } from "shared";

export type DailyEventCounts = {
  events: number;
  eventRecordings: number;
  eventHybrids: number;
};

export type HybridEventSummary = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  room: string | null;
  meetingLink: string | null;
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

export async function getHybridEventsForDate(date: string): Promise<HybridEventSummary[]> {
  const eventsWithHybrid = await db.query.events.findMany({
    where: (events, { eq }) => eq(events.date, date),
    columns: {
      id: true,
      startTime: true,
      endTime: true,
    },
    with: {
      eventHybrids: {
        columns: {
          meetingLink: true,
        },
      },
      venue: {
        columns: {
          name: true,
          spelling: true,
        },
      },
      series: {
        columns: {
          seriesName: true,
        },
      },
    },
  });

  return eventsWithHybrid
    .filter((event) => (event.eventHybrids?.length ?? 0) > 0 && typeof event.id === "number")
    .map((event) => {
      const title =
        (event.series?.seriesName ?? "").trim().length > 0
          ? (event.series?.seriesName as string)
          : `Event ${event.id}`;
      const room = event.venue?.name ?? event.venue?.spelling ?? null;
      const meetingLink = event.eventHybrids?.[0]?.meetingLink ?? null;

      return {
        id: Number(event.id),
        title,
        startTime: event.startTime,
        endTime: event.endTime,
        room,
        meetingLink,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}
