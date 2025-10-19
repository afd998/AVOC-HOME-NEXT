import { Event as EventType } from "@/lib/db/types";
import { events as eventsTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, asc, eq, inArray } from "drizzle-orm";

export type EventWithFirstSession = EventType & { isFirstSession: boolean };

export async function addFirstSessionFlags(
  events: EventType[]
): Promise<EventWithFirstSession[]> {
  const lectureEvents = events.filter((event) => event.eventType === "Lecture");

  if (lectureEvents.length === 0) {
    return events.map((event) => ({
      ...event,
      isFirstSession: false,
    }));
  }

  const uniqueLectureNames = new Set<string>();
  lectureEvents.forEach((event) => {
    uniqueLectureNames.add(event.eventName!);
  });

  const earliestLectureByName = new Map<string, EventType>();

  if (uniqueLectureNames.size > 0) {
    const namesToQuery = Array.from(uniqueLectureNames);
    const namedLectures = await db
      .select()
      .from(eventsTable)
      .where(
        and(
          eq(eventsTable.eventType, "Lecture"),
          inArray(eventsTable.eventName, namesToQuery)
        )
      )
      .orderBy(
        asc(eventsTable.eventName),
        asc(eventsTable.date),
        asc(eventsTable.id)
      );

    namedLectures.forEach((lecture) => {
      const key = lecture.eventName!;
      if (!earliestLectureByName.has(key)) {
        earliestLectureByName.set(key, lecture);
      }
    });
  }

  return events.map((event) => ({
    ...event,
    isFirstSession:
      event.eventType === "Lecture" &&
      earliestLectureByName.get(event.eventName!)?.id === event.id,
  }));
}
