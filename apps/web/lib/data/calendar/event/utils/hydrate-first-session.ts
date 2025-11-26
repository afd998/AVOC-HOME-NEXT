import { and, asc, eq, inArray, db, events as eventsTable, type Event as EventType } from "shared";

export type EventWithFirstSession<T extends EventType = EventType> = T & {
  isFirstSession: boolean;
};

export async function addFirstSessionFlags<T extends EventType>(
  events: T[]
): Promise<EventWithFirstSession<T>[]> {
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

      namedLectures.forEach((lecture) => {
        const key = lecture.eventName!;
        if (!earliestLectureByName.has(key)) {
          earliestLectureByName.set(key, lecture);
        }
      });
    } catch (error) {
      console.error("[db] addFirstSessionFlags", {
        namesToQuery,
        error,
      });
      throw error;
    }
  }

  return events.map(
    (event) =>
      ({
        ...event,
        isFirstSession:
          event.eventType === "Lecture" &&
          earliestLectureByName.get(event.eventName!)?.id === event.id,
      }) satisfies EventWithFirstSession<T>
  );
}
