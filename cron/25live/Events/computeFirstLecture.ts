import { db } from "../../../lib/db";
import { events as eventsTable } from "../../../lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import type { ProcessedEvent } from "../../../lib/db/types";

/**
 * Computes which lectures are the first lecture for their event name.
 * Queries the database to find the earliest lecture for each unique lecture name,
 * then returns a Set of event IDs that are the first lecture.
 *
 * This matches the logic used in createFirstSessionTasks.
 */
export async function computeFirstLecture(
  events: ProcessedEvent[]
): Promise<Set<number>> {
  const lectureEvents = events.filter((event) => event.eventType === "Lecture");
  if (lectureEvents.length === 0) {
    return new Set<number>();
  }

  const uniqueLectureNames = new Set<string>();
  lectureEvents.forEach((event) => {
    if (event.eventName) {
      uniqueLectureNames.add(event.eventName);
    }
  });

  const firstLectureIds = new Set<number>();

  if (uniqueLectureNames.size > 0) {
    const namesToQuery = Array.from(uniqueLectureNames);
    try {
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

      const seenNames = new Set<string>();
      namedLectures.forEach((lecture) => {
        const key = lecture.eventName!;
        // Add the first occurrence of each lecture name
        if (!seenNames.has(key)) {
          seenNames.add(key);
          firstLectureIds.add(lecture.id);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  return firstLectureIds;
}
